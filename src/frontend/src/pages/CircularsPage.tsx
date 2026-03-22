import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Plus, Trash2, X } from "lucide-react";
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

export default function CircularsPage({ nav }: Props) {
  const queryClient = useQueryClient();
  const { actor, isFetching } = useActor();
  const fullActor = actor as unknown as BackendFull | null;
  const sessionToken = nav.session.sessionToken;
  const canUpload =
    nav.session.role === "developer" || nav.session.role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: circulars, isLoading } = useQuery({
    queryKey: ["circulars", sessionToken],
    queryFn: async () => {
      if (!fullActor) return [];
      return fullActor.listCirculars(sessionToken);
    },
    enabled: !!actor && !isFetching && !!sessionToken,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullActor) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!file) {
      toast.error("File is required for a circular");
      return;
    }
    setIsSubmitting(true);
    try {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      const uploadedAt = new Date().toLocaleDateString("en-IN");
      const fileBlob = ExternalBlob.fromBytes(
        new Uint8Array(await file.arrayBuffer()),
      );
      await fullActor.uploadCircular(
        sessionToken,
        id,
        title.trim(),
        description.trim(),
        fileBlob,
        file.name,
        uploadedAt,
      );
      toast.success("Circular uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["circulars"] });
      setTitle("");
      setDescription("");
      setFile(null);
      setShowForm(false);
    } catch {
      toast.error("Failed to upload circular");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!fullActor) return;
    if (!confirm("Delete this circular?")) return;
    try {
      await fullActor.deleteCircular(sessionToken, id);
      toast.success("Circular deleted");
      queryClient.invalidateQueries({ queryKey: ["circulars"] });
    } catch {
      toast.error("Failed to delete circular");
    }
  };

  return (
    <div className="space-y-6" data-ocid="circulars.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2">
            <FileText size={22} className="text-primary" />
            Circulars
          </h1>
          <p className="text-sm text-muted-foreground">
            Official school circulars and documents
          </p>
        </div>
        {canUpload && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            data-ocid="circulars.open_modal_button"
            size="sm"
          >
            <Plus size={15} className="mr-1" /> Upload Circular
          </Button>
        )}
      </div>

      {canUpload && showForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upload Circular</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                data-ocid="circulars.close_button"
              >
                <X size={15} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="circular-title">Title *</Label>
                <Input
                  id="circular-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Circular title"
                  data-ocid="circulars.title.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="circular-desc">Description</Label>
                <Textarea
                  id="circular-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  data-ocid="circulars.description.textarea"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="circular-file">File *</Label>
                <Input
                  id="circular-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpeg,.jpg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  data-ocid="circulars.upload_button"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-ocid="circulars.submit_button"
                >
                  {isSubmitting ? "Uploading..." : "Upload"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  data-ocid="circulars.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3" data-ocid="circulars.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : !circulars || circulars.length === 0 ? (
        <Card>
          <CardContent
            className="py-12 text-center"
            data-ocid="circulars.empty_state"
          >
            <FileText
              size={32}
              className="mx-auto mb-3 text-muted-foreground/40"
            />
            <p className="text-muted-foreground text-sm">
              No circulars uploaded yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {circulars.map((circular, idx) => (
            <Card
              key={circular.id}
              data-ocid={`circulars.item.${idx + 1}`}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <FileText size={14} className="text-primary shrink-0" />
                      <h3 className="font-semibold text-sm">
                        {circular.title}
                      </h3>
                      <Badge variant="outline" className="text-[10px]">
                        {circular.fileName.split(".").pop()?.toUpperCase()}
                      </Badge>
                    </div>
                    {circular.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {circular.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        By: <strong>{circular.uploadedBy}</strong>
                      </span>
                      <span>{circular.uploadedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={circular.fileBlob.getDirectURL()}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={circular.fileName}
                      data-ocid={`circulars.download_button.${idx + 1}`}
                    >
                      <Button variant="outline" size="sm">
                        <Download size={13} className="mr-1" /> Download
                      </Button>
                    </a>
                    {canUpload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(circular.id)}
                        data-ocid={`circulars.delete_button.${idx + 1}`}
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
