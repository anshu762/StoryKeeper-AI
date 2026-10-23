"use client";

import React, { useState } from "react";
import { User, Settings, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserSettings } from "@/server/actions/user";
import { StoryPermission, DisplayPreference } from "@prisma/client";
import { toast } from "sonner";

interface SettingsManagerProps {
  user: {
    id: string;
    name: string;
    email: string;
    preferredLanguage: string;
    defaultPermission: StoryPermission;
    defaultDisplay: DisplayPreference;
    allowPublicEmail: boolean;
  };
}

const LANGUAGES = [
  "Hindi",
  "Bhojpuri",
  "Maithili",
  "Magahi",
  "Bengali",
  "Punjabi",
  "Urdu",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "English",
];

export function SettingsManager({ user }: SettingsManagerProps) {
  const [name, setName] = useState(user.name);
  const [preferredLanguage, setPreferredLanguage] = useState(
    user.preferredLanguage || "Hindi"
  );
  const [defaultPermission, setDefaultPermission] = useState<StoryPermission>(
    user.defaultPermission || "PUBLIC"
  );
  const [defaultDisplay, setDefaultDisplay] = useState<DisplayPreference>(
    user.defaultDisplay || "NAMED"
  );
  const [allowPublicEmail, setAllowPublicEmail] = useState(
    user.allowPublicEmail || false
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserSettings({
        name,
        preferredLanguage,
        defaultPermission,
        defaultDisplay,
        allowPublicEmail,
      });
      toast.success("Preferences updated successfully");
    } catch {
      toast.error("Unable to save preferences right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-line/60 pb-3">
            <User className="w-5 h-5 text-terracotta" />
            <h3 className="font-serif text-lg font-medium text-ink">
              Contributor Profile
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold uppercase tracking-wider text-muted-foreground block">
                Display Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/80 text-sm border-line"
                placeholder="Your display name or pseudonym"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold uppercase tracking-wider text-muted-foreground block">
                Account Email
              </label>
              <Input
                value={user.email}
                disabled
                className="bg-paper-2/60 text-muted-foreground text-sm border-line cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">
                Your email is used for login and notifications. It is permanently private.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Preferred Primary Language
              </label>
              <Select
                value={preferredLanguage}
                onValueChange={(val) => setPreferredLanguage(val)}
              >
                <SelectTrigger className="bg-white/90 border-line">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Default Consent Settings */}
        <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-line/60 pb-3">
            <Settings className="w-5 h-5 text-moss" />
            <h3 className="font-serif text-lg font-medium text-ink">
              Default Consent & Privacy
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Default Story Visibility
              </label>
              <Select
                value={defaultPermission}
                onValueChange={(val) =>
                  setDefaultPermission(val as StoryPermission)
                }
              >
                <SelectTrigger className="bg-white/90 border-line">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public Archive (Discoverable worldwide)</SelectItem>
                  <SelectItem value="PRIVATE">Private Archive (Family only)</SelectItem>
                  <SelectItem value="RESEARCH_ONLY">Research Archive (Academic dataset only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Default Attribution
              </label>
              <Select
                value={defaultDisplay}
                onValueChange={(val) =>
                  setDefaultDisplay(val as DisplayPreference)
                }
              >
                <SelectTrigger className="bg-white/90 border-line">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NAMED">Named (Display your name)</SelectItem>
                  <SelectItem value="ANONYMOUS">Anonymous Contributor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPublicEmail}
                  onChange={(e) => setAllowPublicEmail(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-line text-terracotta accent-terracotta shrink-0"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Allow accredited oral history researchers to request direct contact via email (Default: disabled).
                </span>
              </label>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-terracotta hover:bg-terracotta/90 text-white rounded-xl text-xs gap-1.5 shadow-sm px-6"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Preferences</span>
        </Button>
      </form>
    </div>
  );
}
