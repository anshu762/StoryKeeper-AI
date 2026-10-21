"use client";

import React, { useState } from "react";
import {
  User,
  Settings,
  ShieldAlert,
  Save,
  Trash2,
  Lock,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserSettings } from "@/server/actions/user";
import { requestAccountDeletion, RetentionDisposition } from "@/server/actions/retention";
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
  const [preferredLanguage, setPreferredLanguage] = useState(user.preferredLanguage || "Hindi");
  const [defaultPermission, setDefaultPermission] = useState<StoryPermission>(user.defaultPermission || "PUBLIC");
  const [defaultDisplay, setDefaultDisplay] = useState<DisplayPreference>(user.defaultDisplay || "NAMED");
  const [allowPublicEmail, setAllowPublicEmail] = useState(user.allowPublicEmail || false);

  const [isSaving, setIsSaving] = useState(false);

  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDisposition, setDeleteDisposition] = useState<RetentionDisposition>("DELETE_ALL");
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDelete(true);
    try {
      const res = await requestAccountDeletion({
        disposition: deleteDisposition,
        reason: deleteReason,
        confirmEmail,
      });
      toast.success(res.message);
      setShowDeleteModal(false);
      setDeleteReason("");
      setConfirmEmail("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit deletion request");
    } finally {
      setIsSubmittingDelete(false);
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
                className="bg-paper text-sm border-line"
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
              <label className="font-semibold uppercase tracking-wider text-muted-foreground block">
                Preferred Primary Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full text-xs bg-paper border border-line rounded-xl px-3 py-2.5 text-ink cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
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
              <label className="font-semibold uppercase tracking-wider text-muted-foreground block">
                Default Story Visibility
              </label>
              <select
                value={defaultPermission}
                onChange={(e) =>
                  setDefaultPermission(e.target.value as StoryPermission)
                }
                className="w-full text-xs bg-paper border border-line rounded-xl px-3 py-2.5 text-ink cursor-pointer"
              >
                <option value="PUBLIC">Public Archive (Discoverable worldwide)</option>
                <option value="PRIVATE">Private Archive (Family only)</option>
                <option value="RESEARCH_ONLY">Research Archive (Academic dataset only)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold uppercase tracking-wider text-muted-foreground block">
                Default Attribution
              </label>
              <select
                value={defaultDisplay}
                onChange={(e) =>
                  setDefaultDisplay(e.target.value as DisplayPreference)
                }
                className="w-full text-xs bg-paper border border-line rounded-xl px-3 py-2.5 text-ink cursor-pointer"
              >
                <option value="NAMED">Named (Display your name)</option>
                <option value="ANONYMOUS">Anonymous Contributor</option>
              </select>
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

      {/* Danger Zone: Account Deletion */}
      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 space-y-3">
        <div className="flex items-center gap-2 text-red-900 font-medium text-sm">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Account Data Deletion</span>
        </div>
        <p className="text-xs text-red-800/80 leading-relaxed">
          Requesting deletion will permanently sever your contributor identity and soft-delete your account records according to our ethical data retention policy.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          className="border-red-200 text-red-700 hover:bg-red-100 text-xs gap-1.5 mt-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Request Account Deletion</span>
        </Button>
      </div>

      {/* Deletion Dialog Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-ink">
              Request Contributor Account Deletion
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In accordance with our Contributor Rights & GDPR policy, you have a <strong>30-day grace period</strong> to cancel your request by logging back in. Please choose how you would like your submitted oral histories to be stewarded:
            </p>

            <form onSubmit={handleDeleteRequest} className="space-y-4 pt-1">
              <div className="space-y-2.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Archival Story Disposition
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      deleteDisposition === "DELETE_ALL"
                        ? "border-red-400 bg-red-50/50"
                        : "border-line bg-white/50 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="disposition"
                      value="DELETE_ALL"
                      checked={deleteDisposition === "DELETE_ALL"}
                      onChange={() => setDeleteDisposition("DELETE_ALL")}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-ink block">
                        Option A: Delete my account and purge all stories
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Permanently deletes your account, all transcripts, and purges all original audio recordings from cloud storage.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      deleteDisposition === "KEEP_ANONYMOUS"
                        ? "border-moss bg-moss/5"
                        : "border-line bg-white/50 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="disposition"
                      value="KEEP_ANONYMOUS"
                      checked={deleteDisposition === "KEEP_ANONYMOUS"}
                      onChange={() => setDeleteDisposition("KEEP_ANONYMOUS")}
                      className="mt-0.5 text-moss focus:ring-moss"
                    />
                    <div>
                      <span className="text-xs font-semibold text-ink block">
                        Option B: Preserve public stories anonymously
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Removes your personal account and email. Published stories remain in the archive as a gift to future generations under anonymous attribution. Drafts and private stories are deleted.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Reason for leaving (Optional)
                </label>
                <Input
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g., Privacy request, no longer contributing"
                  className="text-xs bg-paper border-line"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Type your email to confirm: <strong>{user.email}</strong>
                </label>
                <Input
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={user.email}
                  className="text-xs bg-paper border-line"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                  className="border-line text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    isSubmittingDelete ||
                    confirmEmail.toLowerCase() !== user.email.toLowerCase()
                  }
                  className="bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  {isSubmittingDelete ? "Submitting..." : "Schedule Account Deletion"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
