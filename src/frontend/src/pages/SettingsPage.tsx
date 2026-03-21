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
import { useIsAdmin } from "../hooks/useQueries";

const SETTINGS_KEY = "vkv_school_settings";

export interface SchoolSettings {
  schoolName: string;
  district: string;
  state: string;
  principalName: string;
  academicYear: string;
  logoUrl: string;
}

export function getSchoolSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as SchoolSettings;
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
  };
}

export function saveSchoolSettings(s: SchoolSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

interface Props {
  nav: AppNav;
}

export default function SettingsPage({ nav: _nav }: Props) {
  const { actor } = useActor();
  const { data: isAdmin } = useIsAdmin();
  const [settings, setSettings] = useState<SchoolSettings>(getSchoolSettings());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(getSchoolSettings());
  }, []);

  const set = (field: keyof SchoolSettings, val: string) =>
    setSettings((prev) => ({ ...prev, [field]: val }));

  const handleLogoUpload = async (file: File) => {
    if (!actor) return;
    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const blob = ExternalBlob.fromBytes(bytes);
      await actor.uploadStudyMaterial(
        "school-logo",
        "School Logo",
        blob,
        "School logo image",
      );
      const material = await actor.getStudyMaterial("school-logo");
      if (material) {
        const url = material.blob.getDirectURL();
        set("logoUrl", url);
        toast.success("Logo uploaded successfully");
      }
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
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

        {/* School Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">School Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="School Logo"
                className="w-24 h-24 object-contain border rounded"
              />
            )}
            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
              />
              <Button
                variant="outline"
                disabled={uploading || !isAdmin}
                onClick={() => fileRef.current?.click()}
                data-ocid="settings.logo.upload_button"
              >
                {uploading ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : (
                  <Upload size={14} className="mr-2" />
                )}
                {uploading ? "Uploading…" : "Upload Logo"}
              </Button>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground">Admin only</p>
              )}
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
