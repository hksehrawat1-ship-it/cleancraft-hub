import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  History,
  KeyRound,
  Lock,
  LockOpen,
  Mail,
  Search,
  Send,
  Shield,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { MASTER_EMPLOYEES } from "./employee-data";
import {
  ACCOUNT_STATES,
  ACCOUNT_TONE,
  INVITE_TONE,
  ROLES,
  ROLE_SCOPE,
  SECURITY_NOTE,
  USER_ACCOUNTS,
  isSensitiveRole,
  nowStamp,
  plusDays,
  type AccountState,
  type RoleName,
  type UserAccount,
} from "./user-access-data";

const TONE: Record<string, string> = {
  done: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  active: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  pending: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  urgent: "border-destructive/50 bg-destructive/5 text-destructive",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

const Pill = ({ tone, children }: { tone: string; children: React.ReactNode }) => (
  <Badge variant="outline" className={`${TONE[tone] ?? TONE.muted} whitespace-nowrap`}>
    {children}
  </Badge>
);

const Row = ({ k, v }: { k: string; v?: React.ReactNode }) =>
  v ? (
    <div className="flex flex-wrap justify-between gap-2 border-b py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  ) : null;

const HR_USER = "Anjali Kapoor (HR Head)";

export function HrUserAccess() {
  const [accounts, setAccounts] = useState<UserAccount[]>(USER_ACCOUNTS);
  const [tab, setTab] = useState<AccountState | "All">("All");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const counts = useMemo(
    () => ({
      pending: accounts.filter((a) => a.account === "Pending Creation").length,
      invited: accounts.filter((a) => a.invite === "Sent" || a.invite === "Expired").length,
      active: accounts.filter((a) => a.account === "Active").length,
      locked: accounts.filter((a) => a.account === "Locked").length,
      resets: accounts.filter((a) => a.passwordResetRequested).length,
      deactivation: accounts.filter(
        (a) => a.account !== "Deactivated" && (a.employmentStatus === "Exited" || a.employmentStatus === "Notice Period"),
      ).length,
    }),
    [accounts],
  );

  const alerts = useMemo(() => {
    const out: { text: string; id?: string; tone: string }[] = [];
    accounts.forEach((a) => {
      if (a.account === "Pending Creation")
        out.push({ text: `${a.name} has joined but has no user account`, id: a.id, tone: "urgent" });
      if (a.invite === "Expired")
        out.push({ text: `Setup invitation expired for ${a.name} — resend required`, id: a.id, tone: "urgent" });
      if (a.invite === "Sent")
        out.push({ text: `${a.name} has not activated the account yet`, id: a.id, tone: "pending" });
      if (a.employmentStatus === "Exited" && a.account !== "Deactivated")
        out.push({ text: `Exited employee ${a.name} still has active access`, id: a.id, tone: "urgent" });
      if (a.failedLogins >= 3)
        out.push({ text: `${a.failedLogins} repeated failed login attempts for ${a.name}`, id: a.id, tone: "urgent" });
      if (a.extraRoles?.length)
        out.push({ text: `${a.name} holds conflicting roles: ${a.role} + ${a.extraRoles.join(", ")}`, id: a.id, tone: "pending" });
      if (a.roleRequest && a.roleRequest.stage === "Approval Pending" && isSensitiveRole(a.roleRequest.toRole))
        out.push({ text: `Privileged role awaiting ${a.roleRequest.approver} approval: ${a.name} → ${a.roleRequest.toRole}`, id: a.id, tone: "pending" });
      if (a.employmentStatus === "Notice Period" && a.account === "Active")
        out.push({ text: `${a.name} is on notice period — schedule access deactivation`, id: a.id, tone: "pending" });
    });
    out.push({ text: "Suspicious login monitoring is prepared but not activated yet", tone: "muted" });
    return out;
  }, [accounts]);

  const list = accounts.filter(
    (a) =>
      (tab === "All" || a.account === tab) &&
      (!q.trim() ||
        [a.name, a.empId, a.dept, a.designation, a.role, a.workEmail].some((s) =>
          s.toLowerCase().includes(q.toLowerCase()),
        )),
  );

  const update = (id: string, patch: Partial<UserAccount>, log?: string, reason?: string, by = HR_USER) =>
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, ...patch, audit: log ? [...a.audit, { at: nowStamp(), by, text: log, reason }] : a.audit }
          : a,
      ),
    );

  const current = accounts.find((a) => a.id === openId) ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Access</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage employee accounts, approved roles and access changes on joining, transfer and exit.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Create User Account
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard k="Accounts Pending Creation" v={counts.pending} onClick={() => setTab("Pending Creation")} />
        <KpiCard k="Invitations Sent" v={counts.invited} onClick={() => setTab("Invitation Sent")} />
        <KpiCard k="Active Accounts" v={counts.active} onClick={() => setTab("Active")} />
        <KpiCard k="Locked Accounts" v={counts.locked} onClick={() => setTab("Locked")} />
        <KpiCard k="Password-Reset Requests" v={counts.resets} onClick={() => setTab("All")} />
        <KpiCard k="Access Deactivation Pending" v={counts.deactivation} onClick={() => setTab("All")} />
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex gap-2 p-3 text-xs text-muted-foreground">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span>{SECURITY_NOTE}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Attention alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {alerts.map((a, i) => (
            <button
              key={i}
              disabled={!a.id}
              onClick={() => a.id && setOpenId(a.id)}
              className={`rounded-lg border p-2.5 text-left text-sm ${TONE[a.tone]} ${a.id ? "hover:opacity-80" : "cursor-default"}`}
            >
              {a.text}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as AccountState | "All")}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="All" className="text-xs">
              All
            </TabsTrigger>
            {ACCOUNT_STATES.map((s) => (
              <TabsTrigger key={s} value={s} className="text-xs">
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, role, department" className="pl-8" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => (
          <Card key={a.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {a.photo}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{a.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.empId}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.dept} · {a.designation}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Pill tone="active">{a.role}</Pill>
                <Pill tone={ACCOUNT_TONE[a.account]}>Account: {a.account}</Pill>
                <Pill tone={INVITE_TONE[a.invite]}>Invite: {a.invite}</Pill>
                <Pill tone="muted">Employment: {a.employmentStatus}</Pill>
              </div>
              <div className="text-xs text-muted-foreground">Last login: {a.lastLogin ?? "Never"}</div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenId(a.id)}>
                View Access
              </Button>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">No accounts in this view.</CardContent>
          </Card>
        )}
      </div>

      {current && <AccessSheet acc={current} onClose={() => setOpenId(null)} update={update} />}

      <CreateAccountDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        accounts={accounts}
        onCreate={(a) => setAccounts((prev) => [a, ...prev])}
        onActivateExisting={(id, patch, log) => update(id, patch, log)}
      />
    </div>
  );
}

function KpiCard({ k, v, onClick }: { k: string; v: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/60">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{v}</div>
    </button>
  );
}

/* ---------------- Access detail sheet ---------------- */

function AccessSheet({
  acc,
  onClose,
  update,
}: {
  acc: UserAccount;
  onClose: () => void;
  update: (id: string, patch: Partial<UserAccount>, log?: string, reason?: string, by?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [roleReq, setRoleReq] = useState<RoleName | "">("");
  const scope = ROLE_SCOPE[acc.role];

  const withReason = (fn: (r: string) => void) => {
    if (!reason.trim()) {
      toast.error("A reason is required and is recorded in the audit log");
      return;
    }
    fn(reason);
    setReason("");
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> {acc.name} — user access
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pb-10 pt-4">
          <div className="flex flex-wrap gap-1.5">
            <Pill tone={ACCOUNT_TONE[acc.account]}>Account: {acc.account}</Pill>
            <Pill tone={INVITE_TONE[acc.invite]}>Invite: {acc.invite}</Pill>
            <Pill tone="muted">Employment: {acc.employmentStatus}</Pill>
            <Pill tone={acc.mfaReady ? "done" : "muted"}>MFA {acc.mfaReady ? "ready" : "not set up"}</Pill>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Access details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Row k="Master employee record" v={`${acc.name} · ${acc.empId}`} />
              <Row k="Assigned role" v={acc.role} />
              <Row k="Additional roles" v={acc.extraRoles?.join(", ")} />
              <Row k="Department scope" v={scope.scope} />
              <Row k="Permitted modules" v={scope.modules.join(", ")} />
              <Row k="Reporting manager" v={acc.manager} />
              <Row k="Work email" v={acc.workEmail} />
              <Row k="Mobile" v={acc.mobile} />
              <Row k="Account created" v={acc.createdOn ?? "Not created"} />
              <Row k="Invitation expiry" v={acc.inviteExpiresOn} />
              <Row k="Last login" v={acc.lastLogin ?? "Never"} />
              <Row k="Failed login attempts" v={String(acc.failedLogins)} />
              <Row k="Deactivation due" v={acc.deactivationDue} />
              <p className="pt-2 text-[11px] text-muted-foreground">{scope.note}</p>
            </CardContent>
          </Card>

          {acc.roleRequest && (
            <Card className="border-amber-500/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Role change workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Row k="Requested change" v={`${acc.roleRequest.fromRole} → ${acc.roleRequest.toRole}`} />
                <Row k="Reason" v={acc.roleRequest.reason} />
                <Row k="Requested by" v={`${acc.roleRequest.requestedBy} · ${acc.roleRequest.requestedOn}`} />
                <Row k="Stage" v={acc.roleRequest.stage} />
                <Row k="Approver" v={acc.roleRequest.approver} />
                {acc.roleRequest.stage === "Approval Pending" && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        update(
                          acc.id,
                          {
                            role: acc.roleRequest!.toRole,
                            roleRequest: { ...acc.roleRequest!, stage: "Employee Notified" },
                            roleHistory: [
                              ...acc.roleHistory,
                              {
                                at: nowStamp(),
                                by: acc.roleRequest!.approver,
                                text: `Role changed: ${acc.roleRequest!.fromRole} → ${acc.roleRequest!.toRole}`,
                                reason: acc.roleRequest!.reason,
                              },
                            ],
                          },
                          `Role change approved by ${acc.roleRequest!.approver}; access updated and employee notified`,
                          acc.roleRequest!.reason,
                          acc.roleRequest!.approver,
                        )
                      }
                    >
                      <Check className="mr-2 h-4 w-4" /> Record {acc.roleRequest.approver} approval
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update(acc.id, { roleRequest: undefined }, "Role change request rejected by approver", undefined, acc.roleRequest!.approver)
                      }
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Sensitive roles require CEO or authorised-administrator approval. HR cannot approve its own request.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">HR actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1">
                <Label className="text-xs">Reason (recorded in the audit log)</Label>
                <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this access change needed?" />
              </div>

              <div className="flex flex-wrap gap-2">
                {(acc.account === "Pending Creation" || acc.invite === "Not Sent") && (
                  <Button
                    size="sm"
                    onClick={() =>
                      update(
                        acc.id,
                        {
                          account: "Invitation Sent",
                          invite: "Sent",
                          inviteSentOn: nowStamp(),
                          inviteExpiresOn: plusDays(7),
                          createdOn: acc.createdOn ?? nowStamp(),
                          invitations: [
                            ...acc.invitations,
                            { at: nowStamp(), by: HR_USER, text: "Setup invitation sent (single-use link, 7-day expiry)" },
                          ],
                        },
                        "Account created and secure setup invitation sent",
                      )
                    }
                  >
                    <Send className="mr-2 h-4 w-4" /> Send setup invitation
                  </Button>
                )}

                {(acc.invite === "Sent" || acc.invite === "Expired") && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update(
                          acc.id,
                          {
                            invite: "Sent",
                            inviteSentOn: nowStamp(),
                            inviteExpiresOn: plusDays(7),
                            invitations: [
                              ...acc.invitations,
                              { at: nowStamp(), by: HR_USER, text: "Invitation resent — previous link invalidated" },
                            ],
                          },
                          "Expired invitation resent (new single-use link)",
                        )
                      }
                    >
                      <Mail className="mr-2 h-4 w-4" /> Resend invitation
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update(
                          acc.id,
                          {
                            account: "Active",
                            invite: "Accepted",
                            lastLogin: nowStamp(),
                            invitations: [
                              ...acc.invitations,
                              { at: nowStamp(), by: acc.name, text: "Invitation accepted — password set by employee" },
                            ],
                          },
                          "Invitation accepted — employee set their own password",
                          undefined,
                          acc.name,
                        )
                      }
                    >
                      <Check className="mr-2 h-4 w-4" /> Record invitation accepted
                    </Button>
                  </>
                )}

                {acc.account !== "Pending Creation" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update(
                        acc.id,
                        {
                          passwordResetRequested: false,
                          resets: [
                            ...acc.resets,
                            { at: nowStamp(), by: HR_USER, text: "Secure password-reset link sent (single-use, expires)" },
                          ],
                        },
                        "Password-reset link sent — HR never sees or stores the password",
                      )
                    }
                  >
                    <KeyRound className="mr-2 h-4 w-4" /> Send password-reset link
                  </Button>
                )}

                {acc.account === "Active" && (
                  <Button size="sm" variant="outline" onClick={() => withReason((r) => update(acc.id, { account: "Locked" }, "Account locked", r))}>
                    <Lock className="mr-2 h-4 w-4" /> Lock account
                  </Button>
                )}

                {acc.account === "Locked" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => withReason((r) => update(acc.id, { account: "Active", failedLogins: 0 }, "Account unlocked and failed-login counter reset", r))}
                  >
                    <LockOpen className="mr-2 h-4 w-4" /> Unlock account
                  </Button>
                )}

                {acc.account !== "Suspended" && acc.account !== "Deactivated" && acc.account !== "Pending Creation" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => withReason((r) => update(acc.id, { account: "Suspended" }, "Account suspended", r))}
                  >
                    <Ban className="mr-2 h-4 w-4" /> Suspend account
                  </Button>
                )}

                {acc.account !== "Deactivated" && acc.account !== "Pending Creation" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() =>
                      withReason((r) =>
                        update(
                          acc.id,
                          {
                            account: "Deactivated",
                            sessions: acc.sessions.map((s) => ({ ...s, active: false })),
                            deactivations: [
                              ...acc.deactivations,
                              { at: nowStamp(), by: HR_USER, text: "Access deactivated and active sessions revoked", reason: r },
                            ],
                          },
                          "Access deactivated, active sessions revoked — account record and history preserved",
                          r,
                        ),
                      )
                    }
                  >
                    Deactivate access
                  </Button>
                )}
              </div>

              {!acc.roleRequest && (
                <div className="space-y-2 rounded-lg border p-3">
                  <Label className="text-xs">Request role change</Label>
                  <div className="flex flex-wrap gap-2">
                    <Select value={roleReq} onValueChange={(v) => setRoleReq(v as RoleName)}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder="Select new role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.filter((r) => r !== acc.role).map((r) => (
                          <SelectItem key={r} value={r}>
                            {r} {isSensitiveRole(r) ? "· approval required" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      disabled={!roleReq}
                      onClick={() =>
                        withReason((r) => {
                          const to = roleReq as RoleName;
                          const sensitive = isSensitiveRole(to);
                          update(
                            acc.id,
                            {
                              roleRequest: {
                                id: `RC${Date.now()}`,
                                fromRole: acc.role,
                                toRole: to,
                                reason: r,
                                requestedBy: HR_USER,
                                requestedOn: nowStamp(),
                                stage: sensitive ? "Approval Pending" : "Approved",
                                approver: sensitive ? "CEO" : "HR Head",
                              },
                              ...(sensitive
                                ? {}
                                : {
                                    role: to,
                                    roleHistory: [
                                      ...acc.roleHistory,
                                      { at: nowStamp(), by: HR_USER, text: `Role changed: ${acc.role} → ${to}`, reason: r },
                                    ],
                                  }),
                            },
                            sensitive
                              ? `Role change requested: ${acc.role} → ${to} — awaiting CEO approval`
                              : `Role changed: ${acc.role} → ${to}; access updated and employee notified`,
                            r,
                          );
                          setRoleReq("");
                          toast.success(sensitive ? "Sent for CEO approval" : "Role updated");
                        })
                      }
                    >
                      Submit request
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    CEO, HR Head, Sales Head and Administration Manager are sensitive roles — HR cannot grant them
                    without CEO or authorised-administrator approval.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {acc.sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions recorded.</p>}
              {acc.sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-2 text-xs">
                  <span>
                    {s.device} · {s.place}
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {s.at}
                    <Pill tone={s.active ? "done" : "muted"}>{s.active ? "Active" : "Ended"}</Pill>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <HistoryBlock title="Invitation history" items={acc.invitations} />
          <HistoryBlock title="Password-reset history" items={acc.resets} />
          <HistoryBlock title="Role-change history" items={acc.roleHistory} />
          <HistoryBlock title="Deactivation history" items={acc.deactivations} />
          <HistoryBlock title="Full audit log" items={acc.audit} icon />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HistoryBlock({
  title,
  items,
  icon,
}: {
  title: string;
  items: { at: string; by: string; text: string; reason?: string }[];
  icon?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon && <History className="h-4 w-4" />} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No records.</p>}
        {items.map((h, i) => (
          <div key={i} className="rounded-md border p-2 text-xs">
            <div className="font-medium">{h.text}</div>
            {h.reason && <div className="text-muted-foreground">Reason: {h.reason}</div>}
            <div className="text-muted-foreground">
              {h.at} · {h.by}
            </div>
          </div>
        ))}
        <p className="text-[11px] text-muted-foreground">User-access history is preserved permanently and never deleted.</p>
      </CardContent>
    </Card>
  );
}

/* ---------------- Create account wizard ---------------- */

const STEPS = [
  "Select Employee",
  "Confirm Work Email or Mobile",
  "Select Approved Role",
  "Review Permissions",
  "Send Setup Invitation",
] as const;

function CreateAccountDialog({
  open,
  onOpenChange,
  accounts,
  onCreate,
  onActivateExisting,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  accounts: UserAccount[];
  onCreate: (a: UserAccount) => void;
  onActivateExisting: (id: string, patch: Partial<UserAccount>, log: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [empId, setEmpId] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState<RoleName | "">("");

  const employee = MASTER_EMPLOYEES.find((e) => e.empId === empId);
  const existing = accounts.find((a) => a.empId === empId);
  const pendingRecord = existing && existing.account === "Pending Creation" ? existing : null;
  const blockedByExisting = !!existing && existing.account !== "Pending Creation";

  const dupEmail = accounts.find((a) => a.empId !== empId && a.workEmail.toLowerCase() === email.trim().toLowerCase());
  const dupMobile = accounts.find((a) => a.empId !== empId && a.mobile.replace(/\s/g, "") === mobile.replace(/\s/g, ""));

  const sensitive = role ? isSensitiveRole(role as RoleName) : false;

  const reset = () => {
    setStep(0);
    setEmpId("");
    setEmail("");
    setMobile("");
    setRole("");
  };

  const canNext =
    (step === 0 && !!empId && !blockedByExisting) ||
    (step === 1 && !!email.trim() && !!mobile.trim() && !dupEmail && !dupMobile) ||
    (step === 2 && !!role) ||
    step === 3 ||
    step === 4;

  const send = () => {
    const emp = employee!;
    const r = role as RoleName;
    const inviteLog = {
      at: nowStamp(),
      by: HR_USER,
      text: "Setup invitation sent (single-use link, 7-day expiry) — employee sets their own password",
    };
    if (pendingRecord) {
      onActivateExisting(
        pendingRecord.id,
        {
          role: r,
          workEmail: email,
          mobile,
          account: "Invitation Sent",
          invite: "Sent",
          createdOn: nowStamp(),
          inviteSentOn: nowStamp(),
          inviteExpiresOn: plusDays(7),
          invitations: [...pendingRecord.invitations, inviteLog],
          roleHistory: [...pendingRecord.roleHistory, { at: nowStamp(), by: HR_USER, text: `Role assigned: ${r}` }],
        },
        `Account created with role ${r} and secure setup invitation sent`,
      );
    } else {
      onCreate({
        id: `UA${Date.now()}`,
        empId: emp.empId,
        name: emp.name,
        photo: emp.photo,
        dept: emp.dept,
        designation: emp.designation,
        manager: emp.manager,
        employmentStatus: emp.status,
        workEmail: email,
        mobile,
        role: r,
        account: "Invitation Sent",
        invite: "Sent",
        inviteSentOn: nowStamp(),
        inviteExpiresOn: plusDays(7),
        createdOn: nowStamp(),
        failedLogins: 0,
        mfaReady: false,
        passwordResetRequested: false,
        sessions: [],
        invitations: [inviteLog],
        resets: [],
        roleHistory: [{ at: nowStamp(), by: HR_USER, text: `Role assigned: ${r}` }],
        deactivations: [],
        audit: [
          { at: nowStamp(), by: HR_USER, text: `Account created with role ${r}` },
          { at: nowStamp(), by: HR_USER, text: "Secure setup invitation sent" },
        ],
        roleRequest: sensitive
          ? {
              id: `RC${Date.now()}`,
              fromRole: "Employee",
              toRole: r,
              reason: "Privileged role assigned at account creation",
              requestedBy: HR_USER,
              requestedOn: nowStamp(),
              stage: "Approval Pending",
              approver: "CEO",
            }
          : undefined,
      });
    }
    toast.success(
      sensitive
        ? "Invitation sent — privileged role is pending CEO approval"
        : "Setup invitation sent to the employee",
    );
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create User Account</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <Badge key={s} variant="outline" className={i === step ? TONE.active : i < step ? TONE.done : TONE.muted}>
              {i + 1}. {s}
            </Badge>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          {step === 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Employee (master record required)</Label>
              <Select
                value={empId}
                onValueChange={(v) => {
                  setEmpId(v);
                  const emp = MASTER_EMPLOYEES.find((e) => e.empId === v);
                  setEmail(emp?.workEmail ?? "");
                  setMobile(emp?.mobile ?? "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {MASTER_EMPLOYEES.map((e) => (
                    <SelectItem key={e.empId} value={e.empId}>
                      {e.name} · {e.empId} · {e.dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Accounts can only be created for people with an approved employee record.
              </p>
              {employee && (
                <Card>
                  <CardContent className="p-3">
                    <Row k="Department" v={employee.dept} />
                    <Row k="Designation" v={employee.designation} />
                    <Row k="Reporting manager" v={employee.manager} />
                    <Row k="Employment status" v={employee.status} />
                  </CardContent>
                </Card>
              )}
              {blockedByExisting && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  This employee already has a primary user account ({existing?.account}). One employee may hold only one
                  primary account — manage the existing account instead.
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Work email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                {dupEmail && (
                  <p className="text-xs text-destructive">Duplicate: this email is already used by {dupEmail.name}.</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Mobile</Label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} />
                {dupMobile && (
                  <p className="text-xs text-destructive">Duplicate: this mobile is already used by {dupMobile.name}.</p>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                The setup link is sent to the work email. SMS and WhatsApp delivery are not activated yet.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label className="text-xs">Approved role</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-lg border p-2.5 text-left text-xs ${role === r ? TONE.active : "hover:bg-muted"}`}
                  >
                    {r}
                    {isSensitiveRole(r) && <Shield className="ml-1 inline h-3 w-3 text-amber-600" />}
                  </button>
                ))}
              </div>
              {sensitive && (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                  This is a privileged role. The account can be created, but the role stays pending until CEO or
                  authorised-administrator approval is recorded. HR cannot grant it silently.
                </div>
              )}
            </div>
          )}

          {step === 3 && role && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Permissions review (least privilege)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Row k="Employee" v={`${employee?.name} · ${employee?.empId}`} />
                <Row k="Assigned role" v={role} />
                <Row k="Department scope" v={ROLE_SCOPE[role as RoleName].scope} />
                <Row k="Permitted modules" v={ROLE_SCOPE[role as RoleName].modules.join(", ")} />
                <Row k="Reporting manager" v={employee?.manager} />
                <Row k="Approval required" v={sensitive ? "Yes — CEO" : "No"} />
                <p className="pt-2 text-[11px] text-muted-foreground">{ROLE_SCOPE[role as RoleName].note}</p>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-700 dark:text-blue-400">
                A secure, single-use setup link valid for 7 days will be sent to {email}. The employee sets their own
                strong password — HR never creates, views or stores it.
              </div>
              <Button onClick={send}>
                <Send className="mr-2 h-4 w-4" /> Send setup invitation
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button disabled={!canNext || step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
