import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Download, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppNav } from "../App";
import {
  type backendInterface as BackendFull,
  ExternalBlob,
} from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  nav: AppNav;
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export default function StudyMaterialsPage({ nav }: Props) {
  const queryClient = useQueryClient();
  const { actor, isFetching } = useActor();
  const fullActor = actor as unknown as BackendFull | null;
  const sessionToken = nav.session.sessionToken;
  const role = nav.session.role;
  const canUpload =
    role === "developer" || role === "admin" || role === "classTeacher";
  const canDelete = role === "developer" || role === "admin";

  const [classFilter, setClassFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [classLevel, setClassLevel] = useState<string>(
    role === "classTeacher" && nav.session.assignedClass
      ? String(nav.session.assignedClass)
      : "1",
  );
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: materials, isLoading } = useQuery({
    queryKey: ["study-materials", sessionToken],
    queryFn: async () => {
      if (!fullActor) return [];
      return fullActor.listClassStudyMaterials(sessionToken);
    },
    enabled: !!actor && !isFetching && !!sessionToken,
  });

  const filtered =
    classFilter === "all"
      ? (materials ?? [])
      : (materials ?? []).filter((m) => String(m.classLevel) === classFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullActor) return;
    if (!title.trim() || !subject.trim()) {
      toast.error("Title and Subject are required");
      return;
    }
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setIsSubmitting(true);
    try {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      const uploadedAt = new Date().toLocaleDateString("en-IN");
      const fileBlob = ExternalBlob.fromBytes(
        new Uint8Array(await file.arrayBuffer()),
      );
      await fullActor.uploadClassStudyMaterial(
        sessionToken,
        id,
        title.trim(),
        BigInt(classLevel),
        subject.trim(),
        description.trim(),
        fileBlob,
        file.name,
        uploadedAt,
      );
      toast.success("Study material uploaded");
      queryClient.invalidateQueries({ queryKey: ["study-materials"] });
      setTitle("");
      setSubject("");
      setDescription("");
      setFile(null);
      setShowForm(false);
    } catch {
      toast.error("Failed to upload material");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!fullActor) return;
    if (!confirm("Delete this study material?")) return;
    try {
      await fullActor.deleteClassStudyMaterial(sessionToken, id);
      toast.success("Material deleted");
      queryClient.invalidateQueries({ queryKey: ["study-materials"] });
    } catch {
      toast.error("Failed to delete material");
    }
  };

  const classOptions =
    role === "classTeacher" && nav.session.assignedClass
      ? [Number(nav.session.assignedClass)]
      : [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-6" data-ocid="studymaterials.page">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2">
            <BookOpen size={22} className="text-primary" />
            Study Materials
          </h1>
          <p className="text-sm text-muted-foreground">
            Class-wise learning resources
          </p>
        </div>
        {canUpload && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            data-ocid="studymaterials.open_modal_button"
            size="sm"
          >
            <Plus size={15} className="mr-1" /> Upload Material
          </Button>
        )}
      </div>

      {canUpload && showForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upload Study Material</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                data-ocid="studymaterials.close_button"
              >
                <X size={15} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sm-title">Title *</Label>
                  <Input
                    id="sm-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chapter 3 Notes"
                    data-ocid="studymaterials.title.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sm-subject">Subject *</Label>
                  <Input
                    id="sm-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    data-ocid="studymaterials.subject.input"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Class *</Label>
                <Select
                  value={classLevel}
                  onValueChange={setClassLevel}
                  disabled={role === "classTeacher"}
                >
                  <SelectTrigger data-ocid="studymaterials.class.select">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((c) => (
                      <SelectItem key={c} value={String(c)}>
                        Class {ROMAN[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sm-desc">Description</Label>
                <Textarea
                  id="sm-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description (optional)"
                  rows={2}
                  data-ocid="studymaterials.description.textarea"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sm-file">File *</Label>
                <Input
                  id="sm-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpeg,.jpg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  data-ocid="studymaterials.upload_button"
                />
                <p className="text-xs text-muted-foreground">
                  Accepted: PDF, DOC, DOCX, XLS, XLSX, JPEG, JPG, PNG
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-ocid="studymaterials.submit_button"
                >
                  {isSubmitting ? "Uploading..." : "Upload"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  data-ocid="studymaterials.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">
          Filter:
        </span>
        <Button
          variant={classFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setClassFilter("all")}
          data-ocid="studymaterials.all.tab"
        >
          All Classes
        </Button>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
          <Button
            key={c}
            variant={classFilter === String(c) ? "default" : "outline"}
            size="sm"
            onClick={() => setClassFilter(String(c))}
            data-ocid={`studymaterials.class${c}.tab`}
          >
            Class {ROMAN[c]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="studymaterials.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent
            className="py-12 text-center"
            data-ocid="studymaterials.empty_state"
          >
            <BookOpen
              size={32}
              className="mx-auto mb-3 text-muted-foreground/40"
            />
            <p className="text-muted-foreground text-sm">
              {classFilter === "all"
                ? "No study materials uploaded yet."
                : `No materials for Class ${ROMAN[Number(classFilter)]}.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((material, idx) => (
            <Card
              key={material.id}
              data-ocid={`studymaterials.item.${idx + 1}`}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-sm">
                        {material.title}
                      </h3>
                      <Badge className="text-[10px]">
                        Class {ROMAN[Number(material.classLevel)]}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {material.subject}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {material.fileName.split(".").pop()?.toUpperCase()}
                      </Badge>
                    </div>
                    {material.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {material.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        By: <strong>{material.uploadedBy}</strong>
                      </span>
                      <span>{material.uploadedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={material.fileBlob.getDirectURL()}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={material.fileName}
                      data-ocid={`studymaterials.download_button.${idx + 1}`}
                    >
                      <Button variant="outline" size="sm">
                        <Download size={13} className="mr-1" /> Download
                      </Button>
                    </a>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(material.id)}
                        data-ocid={`studymaterials.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
