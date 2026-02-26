# DealerGuard — Pre-Onboarding & Onboarding Complete Code Export

> **Purpose:** Plug-and-play code export for replicating the exact pre-onboarding checks and onboarding process in a parallel project.
>
> **Generated:** 26 Feb 2026

---

## Table of Contents

1. [Database Schema & RLS](#1-database-schema--rls)
2. [Edge Functions (Backend)](#2-edge-functions-backend)
3. [Hooks](#3-hooks)
4. [Pages](#4-pages)
5. [Components](#5-components)
6. [Utils](#6-utils)
7. [Required Secrets](#7-required-secrets)
8. [Dependencies](#8-dependencies)

---

## 1. Database Schema & RLS

### `onboarding_applications` table

```sql
CREATE TABLE public.onboarding_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dealer_name TEXT NOT NULL,
  company_number TEXT,
  stage TEXT NOT NULL DEFAULT 'pre-screening',
  status TEXT NOT NULL DEFAULT 'in_progress',
  segmentation JSONB DEFAULT '{}'::jsonb,
  qualification_notes TEXT,
  screening_results JSONB DEFAULT '{}'::jsonb,
  checklist_progress JSONB DEFAULT '{}'::jsonb,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.onboarding_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.onboarding_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.onboarding_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.onboarding_applications FOR DELETE
  USING (auth.uid() = user_id);
```

### `dealer_documents` table (for file uploads)

```sql
CREATE TABLE public.dealer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dealer_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  description TEXT,
  expiry_date DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dealer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON public.dealer_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents"
  ON public.dealer_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents"
  ON public.dealer_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents"
  ON public.dealer_documents FOR DELETE USING (auth.uid() = user_id);
```

### `banned_entities` table (for DND list from failed pre-screening)

```sql
CREATE TABLE public.banned_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  company_name TEXT,
  reason TEXT NOT NULL,
  failed_checks TEXT[] DEFAULT '{}',
  banned_by UUID NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.banned_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own banned entities"
  ON public.banned_entities FOR SELECT USING (auth.uid() = banned_by);
CREATE POLICY "Users can insert banned entities"
  ON public.banned_entities FOR INSERT WITH CHECK (auth.uid() = banned_by);
CREATE POLICY "Users can update own banned entities"
  ON public.banned_entities FOR UPDATE USING (auth.uid() = banned_by);
CREATE POLICY "Users can delete own banned entries"
  ON public.banned_entities FOR DELETE USING (auth.uid() = banned_by);
```

### Storage bucket

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('dealer-documents', 'dealer-documents', false);
```

### `updated_at` trigger function

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
```

---

## 2. Edge Functions (Backend)

### 2a. `supabase/functions/companies-house/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CH_BASE = "https://api.company-information.service.gov.uk";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateQuery(query: unknown): string {
  if (typeof query !== "string" || query.length === 0 || query.length > 200) {
    throw new ValidationError("Query must be 1-200 characters");
  }
  return query;
}

function validateCompanyNumber(num: unknown): string {
  if (typeof num !== "string" || !/^[A-Z0-9]{1,8}$/i.test(num)) {
    throw new ValidationError("companyNumber must be 1-8 alphanumeric characters");
  }
  return num;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("COMPANIES_HOUSE_API_KEY");
    if (!apiKey) throw new Error("COMPANIES_HOUSE_API_KEY is not configured");

    const authToken = btoa(`${apiKey}:`);

    const body = await req.json();
    const action = body.action;

    if (typeof action !== "string") {
      throw new ValidationError("action is required");
    }

    const chFetch = async (path: string) => {
      const res = await fetch(`${CH_BASE}${path}`, {
        headers: { Authorization: `Basic ${authToken}` },
      });
      if (res.status === 404) return { status: "not_found" };
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Companies House API [${res.status}]: ${text}`);
      }
      return await res.json();
    };

    let result: unknown;

    switch (action) {
      case "search": {
        const q = encodeURIComponent(validateQuery(body.query));
        result = await chFetch(`/search/companies?q=${q}&items_per_page=10`);
        break;
      }
      case "profile": {
        const companyNumber = validateCompanyNumber(body.companyNumber);
        result = await chFetch(`/company/${companyNumber}`);
        break;
      }
      case "officers": {
        const companyNumber = validateCompanyNumber(body.companyNumber);
        result = await chFetch(`/company/${companyNumber}/officers?items_per_page=100`);
        break;
      }
      case "pscs": {
        const companyNumber = validateCompanyNumber(body.companyNumber);
        result = await chFetch(`/company/${companyNumber}/persons-with-significant-control`);
        break;
      }
      case "filing-history": {
        const companyNumber = validateCompanyNumber(body.companyNumber);
        result = await chFetch(`/company/${companyNumber}/filing-history?items_per_page=20`);
        break;
      }
      default:
        throw new ValidationError(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof ValidationError) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("companies-house error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### 2b. `supabase/functions/fca-register/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FCA_BASE = "https://register.fca.org.uk/services";

function validateFrn(frn: unknown): string {
  if (typeof frn !== "string" || !/^\d{1,7}$/.test(frn)) {
    throw new ValidationError("FRN must be 1-7 digits");
  }
  return frn;
}

function validateQuery(query: unknown): string {
  if (typeof query !== "string" || query.length === 0 || query.length > 200) {
    throw new ValidationError("Query must be 1-200 characters");
  }
  return query;
}

function validateType(type: unknown): string {
  const allowed = ["firm", "individual"];
  if (type !== undefined && (typeof type !== "string" || !allowed.includes(type))) {
    throw new ValidationError("Type must be 'firm' or 'individual'");
  }
  return (type as string) || "firm";
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const FCA_API_KEY = Deno.env.get("FCA_API_KEY");
    if (!FCA_API_KEY) {
      throw new Error("FCA_API_KEY is not configured");
    }

    const body = await req.json();
    const action = body.action;

    if (typeof action !== "string") {
      throw new ValidationError("action is required");
    }

    const headers: Record<string, string> = {
      "X-Auth-Email": FCA_API_KEY,
      "X-Auth-Key": FCA_API_KEY,
      Accept: "application/json",
    };

    let result: unknown;

    switch (action) {
      case "search": {
        const q = encodeURIComponent(validateQuery(body.query));
        const type = validateType(body.type);
        const res = await fetch(
          `${FCA_BASE}/V0.1/Search?q=${q}&type=${type}`,
          { headers }
        );
        if (res.status === 404) {
          result = { Status: "Not Found", Data: [], Message: `No results found for "${body.query}"` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA search failed [${res.status}]: ${text}`);
        }
        result = await res.json();
        break;
      }

      case "firm": {
        const frn = validateFrn(body.frn);
        const res = await fetch(`${FCA_BASE}/V0.1/Firm/${frn}`, { headers });
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No firm found with FRN ${frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA firm lookup failed [${res.status}]: ${text}`);
        }
        result = await res.json();
        break;
      }

      case "firm-individuals": {
        const frn = validateFrn(body.frn);
        const res = await fetch(`${FCA_BASE}/V0.1/Firm/${frn}/Individuals`, { headers });
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No individuals found for FRN ${frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA individuals lookup failed [${res.status}]: ${text}`);
        }
        result = await res.json();
        break;
      }

      case "firm-permissions": {
        const frn = validateFrn(body.frn);
        const res = await fetch(`${FCA_BASE}/V0.1/Firm/${frn}/Permission`, { headers });
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No permissions found for FRN ${frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA permissions lookup failed [${res.status}]: ${text}`);
        }
        result = await res.json();
        break;
      }

      case "firm-activities": {
        const frn = validateFrn(body.frn);
        const res = await fetch(`${FCA_BASE}/V0.1/Firm/${frn}/Activities`, { headers });
        if (res.status === 404) {
          result = { Status: "Not Found", Message: `No activities found for FRN ${frn}` };
          break;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`FCA activities lookup failed [${res.status}]: ${text}`);
        }
        result = await res.json();
        break;
      }

      default:
        throw new ValidationError(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof ValidationError) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("fca-register error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### 2c. `supabase/functions/creditsafe/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SANDBOX_BASE = "https://connect.sandbox.creditsafe.com/v1";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function authenticate(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const username = Deno.env.get("CREDITSAFE_USERNAME");
  const password = Deno.env.get("CREDITSAFE_PASSWORD");
  if (!username || !password) {
    throw new Error("CreditSafe credentials not configured");
  }

  const res = await fetch(`${SANDBOX_BASE}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CreditSafe auth failed [${res.status}]: ${text}`);
  }

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  return cachedToken!;
}

async function searchCompanies(
  token: string,
  query: { name?: string; regNo?: string; country?: string }
) {
  const params = new URLSearchParams();
  if (query.country) params.set("countries", query.country);
  if (query.name) params.set("name", query.name);
  if (query.regNo) params.set("regNo", query.regNo);
  params.set("pageSize", "10");
  params.set("page", "1");

  const res = await fetch(`${SANDBOX_BASE}/companies?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CreditSafe company search failed [${res.status}]: ${text}`);
  }

  return await res.json();
}

async function getCompanyReport(token: string, connectId: string) {
  const res = await fetch(`${SANDBOX_BASE}/companies/${connectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CreditSafe report fetch failed [${res.status}]: ${text}`);
  }

  return await res.json();
}

function validateSearchParams(params: Record<string, unknown>) {
  const validated: { name?: string; regNo?: string; country?: string } = {};
  if (params.name !== undefined) {
    if (typeof params.name !== "string" || params.name.length > 200) throw new ValidationError("name must be a string under 200 chars");
    validated.name = params.name;
  }
  if (params.regNo !== undefined) {
    if (typeof params.regNo !== "string" || params.regNo.length > 50) throw new ValidationError("regNo must be a string under 50 chars");
    validated.regNo = params.regNo;
  }
  if (params.country !== undefined) {
    if (typeof params.country !== "string" || !/^[A-Z]{2}$/i.test(params.country)) throw new ValidationError("country must be a 2-letter code");
    validated.country = params.country;
  }
  if (!validated.name && !validated.regNo) throw new ValidationError("name or regNo is required");
  return validated;
}

function validateConnectId(id: unknown): string {
  if (typeof id !== "string" || id.length === 0 || id.length > 100) {
    throw new ValidationError("connectId must be 1-100 characters");
  }
  return id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const action = body.action;

    if (typeof action !== "string") {
      throw new ValidationError("action is required");
    }

    const csToken = await authenticate();

    let result: unknown;

    switch (action) {
      case "search": {
        const searchParams = validateSearchParams(body);
        result = await searchCompanies(csToken, {
          ...searchParams,
          country: searchParams.country || "GB",
        });
        break;
      }
      case "report": {
        const connectId = validateConnectId(body.connectId);
        result = await getCompanyReport(csToken, connectId);
        break;
      }
      default:
        throw new ValidationError(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof ValidationError) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("creditsafe error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

## 3. Hooks

### 3a. `src/hooks/useOnboardingPersistence.ts`

```typescript
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface SegData {
  franchise: string;
  size: string;
  stockType: string[];
  existingFinance: string;
}

export interface OnboardingState {
  id: string | null;
  dealerName: string;
  companyNumber: string;
  stage: string;
  status: string;
  segmentation: SegData;
  qualificationNotes: string;
  screeningResults: Record<string, string>;
  checklistProgress: Record<string, boolean[]>;
  failureReason: string | null;
}

const defaultSeg: SegData = { franchise: "", size: "", stockType: [], existingFinance: "" };

const defaultState: OnboardingState = {
  id: null,
  dealerName: "",
  companyNumber: "",
  stage: "pre-screening",
  status: "in_progress",
  segmentation: defaultSeg,
  qualificationNotes: "",
  screeningResults: {},
  checklistProgress: {},
  failureReason: null,
};

export function useOnboardingPersistence() {
  const { toast } = useToast();
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [applications, setApplications] = useState<OnboardingState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchAll = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("onboarding_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (data) {
      setApplications(data.map((r) => ({
        id: r.id,
        dealerName: r.dealer_name,
        companyNumber: r.company_number || "",
        stage: r.stage,
        status: r.status,
        segmentation: (r.segmentation as unknown as SegData) || defaultSeg,
        qualificationNotes: r.qualification_notes || "",
        screeningResults: (r.screening_results as unknown as Record<string, string>) || {},
        checklistProgress: (r.checklist_progress as unknown as Record<string, boolean[]>) || {},
        failureReason: r.failure_reason,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const loadApplication = useCallback((app: OnboardingState) => {
    setState(app);
  }, []);

  const createNew = useCallback(() => {
    setState(defaultState);
  }, []);

  const save = useCallback(async (partial?: Partial<OnboardingState>) => {
    const current = partial ? { ...state, ...partial } : state;
    if (!current.dealerName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);

    const payload = {
      user_id: user.id,
      dealer_name: current.dealerName,
      company_number: current.companyNumber || null,
      stage: current.stage,
      status: current.status,
      segmentation: current.segmentation as unknown as Json,
      qualification_notes: current.qualificationNotes || null,
      screening_results: current.screeningResults as unknown as Json,
      checklist_progress: current.checklistProgress as unknown as Json,
      failure_reason: current.failureReason,
    };

    if (current.id) {
      await supabase
        .from("onboarding_applications")
        .update(payload)
        .eq("id", current.id);
    } else {
      const { data } = await supabase
        .from("onboarding_applications")
        .insert(payload)
        .select("id")
        .single();
      if (data) {
        setState((s) => ({ ...s, id: data.id }));
      }
    }

    setSaving(false);
    fetchAll();
  }, [state, fetchAll]);

  const autoSave = useCallback((partial?: Partial<OnboardingState>) => {
    const merged = partial ? { ...state, ...partial } : state;
    setState(merged);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save(partial);
    }, 1500);
  }, [state, save]);

  const update = useCallback((partial: Partial<OnboardingState>) => {
    setState((s) => {
      const next = { ...s, ...partial };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        save(partial);
      }, 1500);
      return next;
    });
  }, [save]);

  return {
    state,
    setState,
    applications,
    loading,
    saving,
    save,
    autoSave,
    update,
    loadApplication,
    createNew,
    fetchAll,
  };
}
```

---

## 4. Pages

### 4a. `src/pages/PreOnboarding.tsx`

> **613 lines** — Contains:
> - `DealerSegmentation` component (franchise, size, stock type, existing finance)
> - `QualificationCall` component (structured call checklist with 4 objectives)
> - `PreScreeningChecks` component (Companies House, Open Banking, AML checks + DealerEnrichment + CreditSafe + FCA)
> - Main `PreOnboarding` page with tabs, saved applications list, new application dialog, demo mode wizard

**Full source:** See the file `src/pages/PreOnboarding.tsx` in the current project (613 lines). Copy it directly.

### 4b. `src/pages/Onboarding.tsx`

> **842 lines** — Contains:
> - `ChecklistSection` reusable component with auto-population from screening data
> - 4 onboarding sections: Business Info, Financial Info, Directors & Shareholders, Supporting Docs
> - Demo mode with 8-section compliance checklist (Legal Status, FCA Auth, Financial, DBS, Training, Complaints, Marketing, KYC/AML)
> - Detail modals with interactive DBS certificate upload and Training certificate upload
> - Request More Info email template
> - PDF export, screening data editor, enrichment integration
> - Section navigation with progress tracking

**Full source:** See the file `src/pages/Onboarding.tsx` in the current project (842 lines). Copy it directly.

---

## 5. Components

### 5a. `src/components/onboarding/DemoOnboardingWizard.tsx`

> **510 lines** — 3-step wizard:
> 1. Company Search (by name, postcode, or FCA FRN) with progress indicator
> 2. Results Review with RAG-coloured CreditSafe indicators and overall risk banner
> 3. Completion Form for missing fields + document upload + submit

**Full source:** Copy directly from project.

### 5b. `src/components/onboarding/DealerEnrichment.tsx`

> **611 lines** — Automated enrichment engine:
> - Orchestrates FCA Register, Companies House, and CreditSafe APIs
> - Extracts structured fields: Business Info, Financial Info, Directors & Shareholders, Supporting Docs
> - Auto-triggers on dealer name change (debounced 1.5s)
> - Collapsible result sections with FOUND/MISSING indicators
> - Copy JSON to clipboard

**Full source:** Copy directly from project.

### 5c. `src/components/onboarding/CreditSafeSearch.tsx`

> **241 lines** — CreditSafe search + report component:
> - Search by name or registration number
> - Fetches credit report with score, risk level, credit limit, DBT, CCJs
> - Two variants: "full" (search + detail cards) and "score-only" (inline badge)
> - Risk-coloured badges (Low/Medium/High)

**Full source:** Copy directly from project.

### 5d. `src/components/onboarding/OnboardingDocUpload.tsx`

> **172 lines** — Document upload component:
> - Drag & drop file upload to Supabase storage
> - File list with download/delete
> - Category-based organisation
> - Compact mode for inline use

**Full source:** Copy directly from project.

### 5e. `src/components/onboarding/ScreeningDataBadge.tsx`

> **19 lines** — Simple badge showing auto-populated screening data.

```tsx
import { CheckCircle2 } from "lucide-react";

interface Props {
  label: string;
  value: string | null | undefined;
}

export function ScreeningDataBadge({ label, value }: Props) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 mt-1">
      <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
      <div className="text-xs">
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
```

### 5f. `src/components/onboarding/ScreeningDataEditor.tsx`

> **103 lines** — Editable screening data grid with manual override badges.

**Full source:** Copy directly from project (already shown in context).

### 5g. `src/components/dealer/FcaRegisterCard.tsx`

> **420 lines** — FCA Register search & display:
> - Search by firm name or FRN
> - Shows firm details, approved individuals (collapsible), permissions (collapsible)
> - Status badges (Authorised/Cancelled/etc.)
> - Auto-search on mount if FCA ref provided
> - Callback for parent data consumption

**Full source:** Copy directly from project.

---

## 6. Utils

### 6a. `src/utils/onboardingPdfExport.ts`

```typescript
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

interface OnboardingPdfData {
  dealerName: string;
  companyNumber: string;
  screeningDataMap: Record<string, string>;
  checklistProgress: Record<string, boolean[]>;
  sections: { key: string; title: string; items: { label: string }[] }[];
}

const LABEL_MAP: Record<string, string> = {
  companyRegNo: "Company Registration No",
  registeredAddress: "Registered Address",
  vatRegistration: "VAT Registration",
  creditScore: "Credit Score",
  companyName: "Company Name",
  fcaFrn: "FCA Reference",
  fcaPermissions: "FCA Permissions",
  fcaIndividuals: "FCA Individuals",
};

export function generateOnboardingPdf(data: OnboardingPdfData): void {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = (h = 40) => {
    if (y > doc.internal.pageSize.getHeight() - h) { doc.addPage(); y = 20; }
  };

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Onboarding Application Pack", pw / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`, pw / 2, y, { align: "center" });
  y += 12;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pw - 28, 20, 3, 3, "F");
  doc.setTextColor(0);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(data.dealerName || "Unnamed Dealer", 20, y + 9);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  if (data.companyNumber) doc.text(`Co. #${data.companyNumber}`, 20, y + 16);
  y += 28;

  const entries = Object.entries(data.screeningDataMap).filter(([, v]) => v);
  if (entries.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Screening Data Summary", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: entries.map(([k, v]) => [LABEL_MAP[k] || k, v]),
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  for (const section of data.sections) {
    checkPage(50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(section.title, 14, y);
    y += 6;

    const checks = data.checklistProgress[section.key] || [];
    const rows = section.items.map((item, i) => [
      item.label,
      checks[i] ? "✓" : "—",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Item", "Status"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 25, halign: "center" },
      },
      didParseCell: (d) => {
        if (d.section === "body" && d.column.index === 1) {
          d.cell.styles.textColor = d.cell.raw === "✓" ? [34, 197, 94] : [180, 180, 180];
          d.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  checkPage(30);
  const totalItems = data.sections.reduce((s, sec) => s + sec.items.length, 0);
  const doneItems = data.sections.reduce((s, sec) => {
    const ch = data.checklistProgress[sec.key] || [];
    return s + ch.filter(Boolean).length;
  }, 0);
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`Overall Progress: ${doneItems}/${totalItems} (${pct}%)`, 14, y);

  doc.save(`${data.dealerName || "onboarding"}-application-pack.pdf`);
}
```

---

## 7. Required Secrets

The following secrets must be configured in the target project's backend:

| Secret Name | Description |
|---|---|
| `COMPANIES_HOUSE_API_KEY` | Companies House API key (free from https://developer.company-information.service.gov.uk) |
| `FCA_API_KEY` | FCA Register API key |
| `CREDITSAFE_USERNAME` | CreditSafe sandbox username |
| `CREDITSAFE_PASSWORD` | CreditSafe sandbox password |

---

## 8. Dependencies

```json
{
  "jspdf": "^4.1.0",
  "jspdf-autotable": "^5.0.7",
  "lucide-react": "^0.462.0",
  "react-router-dom": "^6.30.1",
  "@supabase/supabase-js": "^2.95.3"
}
```

Plus all shadcn/ui components used: `Card`, `Badge`, `Button`, `Input`, `Label`, `Textarea`, `Select`, `Checkbox`, `Tabs`, `Progress`, `Dialog`, `Collapsible`, `Skeleton`, `Separator`.

---

## File Manifest

| File | Lines | Purpose |
|---|---|---|
| `src/pages/PreOnboarding.tsx` | 613 | Pre-onboarding page with segmentation, qualification, screening |
| `src/pages/Onboarding.tsx` | 842 | Full onboarding checklist with demo mode |
| `src/hooks/useOnboardingPersistence.ts` | 169 | DB persistence hook with auto-save |
| `src/components/onboarding/DemoOnboardingWizard.tsx` | 510 | 3-step demo wizard |
| `src/components/onboarding/DealerEnrichment.tsx` | 611 | Multi-API enrichment engine |
| `src/components/onboarding/CreditSafeSearch.tsx` | 241 | CreditSafe search & report |
| `src/components/onboarding/OnboardingDocUpload.tsx` | 172 | Document upload with storage |
| `src/components/onboarding/ScreeningDataBadge.tsx` | 19 | Auto-populated data badge |
| `src/components/onboarding/ScreeningDataEditor.tsx` | 103 | Editable screening data grid |
| `src/components/dealer/FcaRegisterCard.tsx` | 420 | FCA Register search & display |
| `src/utils/onboardingPdfExport.ts` | 134 | PDF export utility |
| `supabase/functions/companies-house/index.ts` | 135 | Companies House edge function |
| `supabase/functions/fca-register/index.ts` | 191 | FCA Register edge function |
| `supabase/functions/creditsafe/index.ts` | 185 | CreditSafe edge function |

**Total: ~4,345 lines of code across 14 files.**
