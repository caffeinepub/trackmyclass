import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Save, ShieldAlert, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AppNav } from "../App";
import { ExternalBlob } from "../backend";
import { UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

const SETTINGS_KEY = "vkv_school_settings";

export interface SchoolSettings {
  schoolName: string;
  district: string;
  state: string;
  principalName: string;
  academicYear: string;
  /** @deprecated use logoLeftUrl */
  logoUrl: string;
  logoLeftUrl: string;
  logoRightUrl: string;
}

export function getSchoolSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SchoolSettings;
      if (!parsed.logoLeftUrl && parsed.logoUrl)
        parsed.logoLeftUrl = parsed.logoUrl;
      if (!parsed.logoRightUrl) parsed.logoRightUrl = "";
      return parsed;
    }
  } catch {
    // ignore
  }
  return {
    schoolName: "VIVEKANANDA KENDRA VIDYALAYA RAGA",
    district: "KAMLE",
    state: "ARUNACHAL PRADESH",
    principalName: "",
    academicYear: "2025-26",
    logoUrl: "",
    logoLeftUrl: "",
    logoRightUrl: "",
  };
}

export function saveSchoolSettings(s: SchoolSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

interface Props {
  nav: AppNav;
}

function AdminSetupCard() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { refetch: refetchIsAdmin } = useIsAdmin();
  const [claimingAdmin, setClaimingAdmin] = useState(false);

  const { data: callerRole, isLoading: roleLoading } = useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return UserRole.user;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });

  if (!identity) {
    return (
      <Card className="border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="flex items-center gap-3 py-4">
          <ShieldAlert size={18} className="text-blue-600" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Please log in to manage admin access and add students.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (roleLoading) {
    return (
      <Card>
        <CardContent
          className="flex items-center gap-3 py-4"
          data-ocid="settings.admin_setup.loading_state"
        >
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Checking admin access…
          </span>
        </CardContent>
      </Card>
    );
  }

  if (callerRole === UserRole.admin) {
    return (
      <Card className="border-green-500/40 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle2 size={18} className="text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              Admin Access: Active
            </p>
            <p className="text-xs text-green-600/80 dark:text-green-500/80">
              You have full admin privileges. You can add and manage student
              records.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleClaimAdmin = async () => {
    if (!actor || !identity) {
      toast.error("Please log in first before claiming admin access.");
      return;
    }
    setClaimingAdmin(true);
    try {
      await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.admin);
      await queryClient.invalidateQueries({ queryKey: ["callerRole"] });
      await queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      await refetchIsAdmin();
      toast.success("Admin access granted. You can now add students.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to claim admin access. Try logging in again.");
    } finally {
      setClaimingAdmin(false);
    }
  };

  return (
    <Card
      className="border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20"
      data-ocid="settings.admin_setup.card"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
          <ShieldAlert size={18} />
          Admin Access Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-amber-700/90 dark:text-amber-300/80">
          You are currently logged in as a regular user. To add students and
          manage records, you need admin access.
        </p>
        <Button
          onClick={handleClaimAdmin}
          disabled={claimingAdmin}
          className="bg-amber-600 hover:bg-amber-700 text-white"
          data-ocid="settings.claim_admin.button"
        >
          {claimingAdmin ? (
            <Loader2 size={14} className="mr-2 animate-spin" />
          ) : (
            <ShieldAlert size={14} className="mr-2" />
          )}
          {claimingAdmin ? "Claiming Access…" : "Claim Admin Access"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage({ nav: _nav }: Props) {
  const { actor } = useActor();
  const { data: isAdmin } = useIsAdmin();
  const [settings, setSettings] = useState<SchoolSettings>(getSchoolSettings());
  const [uploadingLeft, setUploadingLeft] = useState(false);
  const [uploadingRight, setUploadingRight] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileLeftRef = useRef<HTMLInputElement>(null);
  const fileRightRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(getSchoolSettings());
  }, []);

  const set = (field: keyof SchoolSettings, val: string) =>
    setSettings((prev) => ({ ...prev, [field]: val }));

  const handleLogoUpload = async (file: File, side: "left" | "right") => {
    if (!actor) return;
    const key = side === "left" ? "school-logo-left" : "school-logo-right";
    if (side === "left") setUploadingLeft(true);
    else setUploadingRight(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const blob = ExternalBlob.fromBytes(bytes);
      await actor.uploadStudyMaterial(
        key,
        side === "left" ? "School Logo Left" : "School Logo Right",
        blob,
        `School logo ${side} side`,
      );
      const material = await actor.getStudyMaterial(key);
      if (material) {
        const url = material.blob.getDirectURL();
        if (side === "left") {
          set("logoLeftUrl", url);
          set("logoUrl", url);
        } else {
          set("logoRightUrl", url);
        }
        toast.success(
          `${side === "left" ? "Left" : "Right"} logo uploaded successfully`,
        );
      }
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      if (side === "left") setUploadingLeft(false);
      else setUploadingRight(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    saveSchoolSettings(settings);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved");
    }, 300);
  };

  return (
    <div data-ocid="settings.page">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Settings</h1>
        <p className="text-sm text-muted-foreground">
          School information and configuration
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Admin Setup Section */}
        <AdminSetupCard />

        {/* School Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>School Name</Label>
              <Input
                data-ocid="settings.school_name.input"
                value={settings.schoolName}
                onChange={(e) => set("schoolName", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>District</Label>
                <Input
                  data-ocid="settings.district.input"
                  value={settings.district}
                  onChange={(e) => set("district", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input
                  data-ocid="settings.state.input"
                  value={settings.state}
                  onChange={(e) => set("state", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Principal Name</Label>
              <Input
                data-ocid="settings.principal_name.input"
                value={settings.principalName}
                onChange={(e) => set("principalName", e.target.value)}
                placeholder="Name of the Principal"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Academic Year</Label>
              <Input
                data-ocid="settings.academic_year.input"
                value={settings.academicYear}
                onChange={(e) => set("academicYear", e.target.value)}
                placeholder="2025-26"
              />
            </div>
          </CardContent>
        </Card>

        {/* School Logos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">School Logos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Left Logo */}
            <div className="space-y-3">
              <Label className="font-semibold">
                Left Side Logo (Report Card Header)
              </Label>
              {settings.logoLeftUrl && (
                <img
                  src={settings.logoLeftUrl}
                  alt="School Logo Left"
                  className="w-24 h-24 object-contain border rounded"
                />
              )}
              <div className="flex items-center gap-3">
                <input
                  ref={fileLeftRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file, "left");
                  }}
                />
                <Button
                  variant="outline"
                  disabled={uploadingLeft || !isAdmin}
                  onClick={() => fileLeftRef.current?.click()}
                  data-ocid="settings.logo_left.upload_button"
                >
                  {uploadingLeft ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : (
                    <Upload size={14} className="mr-2" />
                  )}
                  {uploadingLeft ? "Uploading…" : "Upload Left Logo"}
                </Button>
                {!isAdmin && (
                  <p className="text-xs text-muted-foreground">Admin only</p>
                )}
              </div>
            </div>

            {/* Right Logo */}
            <div className="space-y-3">
              <Label className="font-semibold">
                Right Side Logo (Report Card Header)
              </Label>
              {settings.logoRightUrl && (
                <img
                  src={settings.logoRightUrl}
                  alt="School Logo Right"
                  className="w-24 h-24 object-contain border rounded"
                />
              )}
              <div className="flex items-center gap-3">
                <input
                  ref={fileRightRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file, "right");
                  }}
                />
                <Button
                  variant="outline"
                  disabled={uploadingRight || !isAdmin}
                  onClick={() => fileRightRef.current?.click()}
                  data-ocid="settings.logo_right.upload_button"
                >
                  {uploadingRight ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : (
                    <Upload size={14} className="mr-2" />
                  )}
                  {uploadingRight ? "Uploading…" : "Upload Right Logo"}
                </Button>
                {!isAdmin && (
                  <p className="text-xs text-muted-foreground">Admin only</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          data-ocid="settings.save.submit_button"
        >
          {saving ? (
            <Loader2 size={14} className="mr-2 animate-spin" />
          ) : (
            <Save size={14} className="mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
