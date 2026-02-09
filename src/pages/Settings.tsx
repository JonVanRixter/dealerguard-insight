import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AlertThresholds } from "@/components/settings/AlertThresholds";
import { DisplaySettings } from "@/components/settings/DisplaySettings";
import { User, Bell, Sliders, Monitor } from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure your account, notifications, and platform preferences.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-background">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="thresholds" className="gap-2 data-[state=active]:bg-background">
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Alert Thresholds</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-2 data-[state=active]:bg-background">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="thresholds" className="space-y-6">
            <AlertThresholds />
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <DisplaySettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
