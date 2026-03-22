import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Download, FileText, Plus, Trash2, X } from "lucide-react";
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

export default function NoticeBoardPage({ nav }: Props) {
  const queryClient = useQueryClient();
  const { actor, isFetching } = useActor();
  const fullActor = actor as unknown as BackendFull | null;
  const sessionToken = nav.session.sessionToken;
  const canPost =
    nav.session.role === "developer" || nav.session.role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: notices, isLoading } = useQuery({
    queryKey: ["notices", sessionToken],
    queryFn: async () => {
      if (!fullActor) return [];
      return fullActor.listNotices(sessionToken);
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
    setIsSubmitting(true);
    try {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      const postedAt = new Date().toLocaleDateString("en-IN");
      let fileBlob: ExternalBlob | null = null;
      let fileName = "";
      if (file) {
        fileBlob = ExternalBlob.fromBytes(
          new Uint8Array(await file.arrayBuffer()),
        );
        fileName = file.name;
      }
      await fullActor.postNotice(
        sessionToken,
        id,
        title.trim(),
        content.trim(),
        !!file,
        fileBlob,
        fileName,
        postedAt,
      );
      toast.success("Notice posted successfully");
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setTitle("");
      setContent("");
      setFile(null);
      setShowForm(false);
    } catch {
      toast.error("Failed to post notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!fullActor) return;
    if (!confirm("Delete this notice?")) return;
    try {
      await fullActor.deleteNotice(sessionToken, id);
      toast.success("Notice deleted");
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    } catch {
      toast.error("Failed to delete notice");
    }
  };

  return (
    <div className="space-y-6" data-ocid="noticeboard.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2">
            <Bell size={22} className="text-primary" />
            Notice Board
          </h1>
          <p className="text-sm text-muted-foreground">
            School announcements and important updates
          </p>
        </div>
        {canPost && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            data-ocid="noticeboard.open_modal_button"
            size="sm"
          >
            <Plus size={15} className="mr-1" /> Post Notice
          </Button>
        )}
      </div>

      {canPost && showForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Notice</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                data-ocid="noticeboard.close_button"
              >
                <X size={15} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="notice-title">Title *</Label>
                <Input
                  id="notice-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notice title"
                  data-ocid="noticeboard.title.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notice-content">Content</Label>
                <Textarea
                  id="notice-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Notice content..."
                  rows={4}
                  data-ocid="noticeboard.content.textarea"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notice-file">Attachment (optional)</Label>
                <Input
                  id="notice-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpeg,.jpg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  data-ocid="noticeboard.upload_button"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-ocid="noticeboard.submit_button"
                >
                  {isSubmitting ? "Posting..." : "Post Notice"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  data-ocid="noticeboard.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3" data-ocid="noticeboard.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !notices || notices.length === 0 ? (
        <Card>
          <CardContent
            className="py-12 text-center"
            data-ocid="noticeboard.empty_state"
          >
            <Bell size={32} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              No notices posted yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notices.map((notice, idx) => (
            <Card
              key={notice.id}
              data-ocid={`noticeboard.item.${idx + 1}`}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-sm">{notice.title}</h3>
                      {notice.hasFile && (
                        <Badge variant="secondary" className="text-[10px]">
                          <FileText size={10} className="mr-1" /> File
                        </Badge>
                      )}
                    </div>
                    {notice.content && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">
                        {notice.content}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Posted by: <strong>{notice.postedBy}</strong>
                      </span>
                      <span>{notice.postedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {notice.hasFile && notice.fileBlob && (
                      <a
                        href={notice.fileBlob.getDirectURL()}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={notice.fileName}
                        data-ocid={`noticeboard.download_button.${idx + 1}`}
                      >
                        <Button variant="outline" size="sm">
                          <Download size={13} className="mr-1" />
                          {notice.fileName || "Download"}
                        </Button>
                      </a>
                    )}
                    {canPost && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(notice.id)}
                        data-ocid={`noticeboard.delete_button.${idx + 1}`}
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
