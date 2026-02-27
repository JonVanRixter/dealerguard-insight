import { tcgDealers } from "./dealers";
import { getLenderName } from "./lenders";

export type ReviewReason =
  | "Score below threshold"
  | "Failed section check"
  | "Lender escalation"
  | "Onboarding exception"
  | "Document expiry";

export type ReviewPriority = "High" | "Medium" | "Low";
export type ReviewStatus = "Open" | "In Progress" | "Resolved";

export interface ReviewQueueItem {
  id: string;
  dealerId: string;
  dealerName: string;
  dealerScore: number;
  lenderId: string;
  lenderName: string;
  reason: ReviewReason;
  priority: ReviewPriority;
  status: ReviewStatus;
  raisedDate: string;
  raisedBy: string;
  notes: string;
}

export const reviewQueueItems: ReviewQueueItem[] = [
  {
    id: "rq-001",
    dealerId: "d010",
    dealerName: "Summit Automotive",
    dealerScore: 44,
    lenderId: "l001",
    lenderName: getLenderName("l001"),
    reason: "Score below threshold",
    priority: "High",
    status: "Open",
    raisedDate: "2026-02-24",
    raisedBy: "System",
    notes: "Score dropped below 50 after latest audit. Multiple section failures detected.",
  },
  {
    id: "rq-002",
    dealerId: "d011",
    dealerName: "Horizon Motor Sales",
    dealerScore: 38,
    lenderId: "l001",
    lenderName: getLenderName("l001"),
    reason: "Score below threshold",
    priority: "High",
    status: "Open",
    raisedDate: "2026-02-22",
    raisedBy: "System",
    notes: "Lowest score in portfolio. Consistent downward trend over 3 audit cycles.",
  },
  {
    id: "rq-003",
    dealerId: "d009",
    dealerName: "Riverside Car Group",
    dealerScore: 52,
    lenderId: "l003",
    lenderName: getLenderName("l003"),
    reason: "Failed section check",
    priority: "High",
    status: "In Progress",
    raisedDate: "2026-02-20",
    raisedBy: "Tom Griffiths",
    notes: "Consumer Duty section failed. Dealer has been notified and given 14-day remediation window.",
  },
  {
    id: "rq-004",
    dealerId: "d007",
    dealerName: "Northgate Auto Centre",
    dealerScore: 60,
    lenderId: "l002",
    lenderName: getLenderName("l002"),
    reason: "Lender escalation",
    priority: "Medium",
    status: "Open",
    raisedDate: "2026-02-18",
    raisedBy: "James Whitaker",
    notes: "Sterling Auto Credit flagged concerns about dealer complaint handling procedures.",
  },
  {
    id: "rq-005",
    dealerId: "d006",
    dealerName: "Castle Cars Ltd",
    dealerScore: 65,
    lenderId: "l001",
    lenderName: getLenderName("l001"),
    reason: "Document expiry",
    priority: "Medium",
    status: "Open",
    raisedDate: "2026-02-15",
    raisedBy: "System",
    notes: "Motor trade insurance certificate expires in 7 days. Renewal not yet submitted.",
  },
  {
    id: "rq-006",
    dealerId: "d008",
    dealerName: "Pennine Motor Co",
    dealerScore: 58,
    lenderId: "l001",
    lenderName: getLenderName("l001"),
    reason: "Onboarding exception",
    priority: "Low",
    status: "Resolved",
    raisedDate: "2026-02-10",
    raisedBy: "Sarah Chen",
    notes: "DBS check returned a referred result. Manually reviewed and cleared by compliance team.",
  },
];
