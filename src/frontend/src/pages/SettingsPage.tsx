import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AppNav } from "../App";
import { ExternalBlob } from "../backend";
import { useActor } from "../hooks/useActor";
import { canEdit } from "../hooks/useAuth";

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

export default function SettingsPage({ nav }: Props) {
  const { actor } = useActor();
  const isAdmin = canEdit(nav.session.role);
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
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>District</Label>
                <Input
                  data-ocid="settings.district.input"
                  value={settings.district}
                  onChange={(e) => set("district", e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input
                  data-ocid="settings.state.input"
                  value={settings.state}
                  onChange={(e) => set("state", e.target.value)}
                  className="h-11"
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
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Academic Year</Label>
              <Input
                data-ocid="settings.academic_year.input"
                value={settings.academicYear}
                onChange={(e) => set("academicYear", e.target.value)}
                placeholder="2025-26"
                className="h-11"
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
              <div className="flex flex-wrap items-center gap-3">
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
                  className="h-11"
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
              <div className="flex flex-wrap items-center gap-3">
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
                  className="h-11"
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
          className="h-11"
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
