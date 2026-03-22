import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppNav } from "../App";
import type { UserAccount } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  nav: AppNav;
}

const ROLE_OPTIONS = [
  { value: "developer", label: "Developer" },
  { value: "admin", label: "Admin" },
  { value: "classTeacher", label: "Class Teacher" },
  { value: "teacher", label: "Other Teacher" },
];

const ROLE_BADGE: Record<string, string> = {
  developer: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  classTeacher: "bg-green-100 text-green-800",
  teacher: "bg-gray-100 text-gray-700",
};

const EMPTY_ACCOUNT: Omit<UserAccount, "assignedClass"> & {
  assignedClass: string;
} = {
  username: "",
  displayName: "",
  password: "",
  role: "teacher",
  assignedClass: "",
};

export default function UsersPage({ nav }: Props) {
  const { actor } = useActor();
  const qc = useQueryClient();
  const sessionToken = nav.session.sessionToken;

  const { data: users, isLoading } = useQuery<UserAccount[]>({
    queryKey: ["userAccounts", sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) return [];
      return actor.listUserAccounts(sessionToken);
    },
    enabled: !!actor && !!sessionToken,
  });

  const createMutation = useMutation({
    mutationFn: async (account: UserAccount) => {
      if (!actor) throw new Error("Not connected");
      await actor.createUserAccount(sessionToken, account);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userAccounts"] });
      toast.success("User created successfully");
    },
    onError: () => toast.error("Failed to create user"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteUserAccount(sessionToken, username);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userAccounts"] });
      toast.success("User deleted");
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const pwMutation = useMutation({
    mutationFn: async ({
      username,
      newPassword,
    }: { username: string; newPassword: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateUserPassword(sessionToken, username, newPassword);
    },
    onSuccess: () => toast.success("Password updated"),
    onError: () => toast.error("Failed to update password"),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_ACCOUNT });
  const [pwDialogUser, setPwDialogUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const handleCreate = async () => {
    if (
      !form.username.trim() ||
      !form.displayName.trim() ||
      !form.password.trim()
    ) {
      toast.error("Username, display name, and password are required");
      return;
    }
    const account: UserAccount = {
      username: form.username.trim(),
      displayName: form.displayName.trim(),
      password: form.password,
      role: form.role,
      assignedClass:
        form.role === "classTeacher" && form.assignedClass
          ? BigInt(form.assignedClass)
          : undefined,
    };
    await createMutation.mutateAsync(account);
    setCreateOpen(false);
    setForm({ ...EMPTY_ACCOUNT });
  };

  const handleChangePassword = async () => {
    if (!pwDialogUser || !newPassword.trim()) return;
    await pwMutation.mutateAsync({
      username: pwDialogUser,
      newPassword: newPassword.trim(),
    });
    setPwDialogUser(null);
    setNewPassword("");
  };

  return (
    <div data-ocid="users.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage teacher accounts and roles
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-ocid="users.open_modal_button">
              <Plus size={15} /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="users.dialog">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input
                  placeholder="e.g. teacher1"
                  value={form.username}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, username: e.target.value }))
                  }
                  data-ocid="users.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Display Name</Label>
                <Input
                  placeholder="e.g. Ramesh Kumar"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, displayName: e.target.value }))
                  }
                  data-ocid="users.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Set a password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  data-ocid="users.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}
                >
                  <SelectTrigger data-ocid="users.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.role === "classTeacher" && (
                <div className="space-y-1.5">
                  <Label>Assigned Class</Label>
                  <Select
                    value={form.assignedClass}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, assignedClass: v }))
                    }
                  >
                    <SelectTrigger data-ocid="users.select">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                        <SelectItem key={c} value={String(c)}>
                          Class {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  data-ocid="users.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  data-ocid="users.submit_button"
                >
                  {createMutation.isPending ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : null}
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2" data-ocid="users.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !users?.length ? (
            <div
              className="py-12 text-center text-muted-foreground"
              data-ocid="users.empty_state"
            >
              No users yet. Create the first user above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u, idx) => (
                  <TableRow
                    key={u.username}
                    data-ocid={`users.item.${idx + 1}`}
                  >
                    <TableCell className="font-mono text-sm">
                      {u.username}
                    </TableCell>
                    <TableCell>{u.displayName}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ROLE_OPTIONS.find((r) => r.value === u.role)?.label ??
                          u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {u.assignedClass !== undefined
                        ? `Class ${u.assignedClass}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPwDialogUser(u.username);
                            setNewPassword("");
                          }}
                          title="Change password"
                          data-ocid={`users.edit_button.${idx + 1}`}
                        >
                          <KeyRound size={13} />
                        </Button>
                        {u.username !== nav.session.displayName && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete user "${u.username}"?`)) {
                                deleteMutation.mutate(u.username);
                              }
                            }}
                            className="text-destructive hover:text-destructive"
                            data-ocid={`users.delete_button.${idx + 1}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Change password dialog */}
      <Dialog
        open={!!pwDialogUser}
        onOpenChange={(o) => {
          if (!o) setPwDialogUser(null);
        }}
      >
        <DialogContent data-ocid="users.dialog">
          <DialogHeader>
            <DialogTitle>Change Password — {pwDialogUser}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-ocid="users.input"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPwDialogUser(null)}
                data-ocid="users.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={pwMutation.isPending || !newPassword.trim()}
                data-ocid="users.save_button"
              >
                {pwMutation.isPending ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : null}
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
