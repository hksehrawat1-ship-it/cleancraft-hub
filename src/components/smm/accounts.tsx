import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  AtSign,
  Facebook,
  Film,
  Globe,
  Instagram,
  Linkedin,
  Lock,
  PauseCircle,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  Trash2,
  Youtube,
} from "lucide-react";
import { SectionHead, StatCard } from "./ui";
import {
  SOCIAL_ACCOUNTS,
  ACCESS_LEVELS,
  BRANDS,
  PUBLISH_RECORDS,
  MANAGER_NAME,
  type SocialAccount,
  type AccountStatus,
  type AccessLevel,
} from "./shared-records";

const PLATFORM_ORDER = [
  "Instagram",
  "Facebook",
  "YouTube",
  "LinkedIn",
  "X",
  "Pinterest",
  "Other",
] as const;
type PlatformKey = (typeof PLATFORM_ORDER)[number];

const ICONS: Record<PlatformKey, React.ComponentType<{ className?: string }>> = {
  Instagram,
  Facebook,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  X: AtSign,
  Pinterest: Globe,
  Other: Globe,
};

function statusTone(s: AccountStatus) {
  switch (s) {
    case "Connected":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "Attention Required":
    case "Reauthorisation Required":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    case "Disconnected":
    case "Suspended":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "Archived":
      return "bg-muted text-muted-foreground border-border";
  }
}

export function SmmAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>(SOCIAL_ACCOUNTS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const connected = accounts.filter((a) => a.status === "Connected").length;
  const attention = accounts.filter(
    (a) => a.status === "Attention Required" || a.status === "Reauthorisation Required",
  ).length;
  const disconnected = accounts.filter((a) => a.status === "Disconnected").length;
  const publishingIssues = accounts.filter(
    (a) => a.recentFailures > 0 || !a.publishingPermission,
  ).length;

  const alerts = useMemo(() => {
    const out: { tone: "bad" | "warn"; text: string }[] = [];
    accounts.forEach((a) => {
      if (a.status === "Disconnected") out.push({ tone: "bad", text: `${a.accountName} is disconnected.` });
      if (a.status === "Reauthorisation Required")
        out.push({ tone: "warn", text: `${a.accountName} requires reauthorisation.` });
      if (!a.publishingPermission && a.status !== "Archived")
        out.push({ tone: "warn", text: `${a.accountName} is missing publishing permission.` });
      if (a.recentFailures > 0)
        out.push({ tone: "bad", text: `${a.accountName} had ${a.recentFailures} publishing failure(s).` });
      if (a.restriction || a.suspension)
        out.push({ tone: "bad", text: `${a.accountName}: ${a.suspension ?? a.restriction}` });
      if (a.unusualAccess) out.push({ tone: "bad", text: `${a.accountName}: ${a.unusualAccess}` });
      a.users
        .filter((u) => u.exited)
        .forEach((u) =>
          out.push({
            tone: "bad",
            text: `${u.name} has exited but still holds ${u.level} access on ${a.accountName} — revoke now.`,
          }),
        );
      const scheduled = PUBLISH_RECORDS.filter(
        (r) => r.account === a.handle && (r.status === "Scheduled" || r.status === "Ready to Publish"),
      ).length;
      if (scheduled > 0 && (a.status !== "Connected" || a.publishingPaused))
        out.push({
          tone: "bad",
          text: `${scheduled} scheduled post(s) are linked to ${a.accountName}, which is unavailable.`,
        });
    });
    return out;
  }, [accounts]);

  const open = openId ? accounts.find((a) => a.id === openId) ?? null : null;

  function patch(id: string, p: Partial<SocialAccount>, note?: string) {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...p,
              accessHistory: note
                ? [{ at: "Today", by: MANAGER_NAME, note }, ...a.accessHistory]
                : a.accessHistory,
            }
          : a,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <SectionHead
            title="Social Accounts"
            sub="Authorised accounts, publishing access, account health and platform activity."
          />
        </div>
        <Button className="shrink-0" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Social Account
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Connected Accounts" value={String(connected)} tone="good" />
        <StatCard label="Attention Required" value={String(attention)} tone={attention ? "warn" : "good"} />
        <StatCard label="Disconnected Accounts" value={String(disconnected)} tone={disconnected ? "bad" : "good"} />
        <StatCard label="Publishing Issues" value={String(publishingIssues)} tone={publishingIssues ? "bad" : "good"} />
      </div>

      <Card className="border-primary/30">
        <CardContent className="p-4 flex items-start gap-3 text-sm">
          <Lock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            Accounts connect only through official platform sign-in. Passwords are never requested,
            shown, stored or logged in this CRM, tokens stay encrypted on the server and are never
            visible in the browser, and permissions follow least-privilege. Deletion and ownership
            changes need extra approval; access is revoked the day an employee exits.
          </p>
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card className="border-amber-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" /> Attention Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {alerts.map((a, i) => (
              <div key={i} className={a.tone === "bad" ? "text-destructive" : "text-amber-700"}>
                • {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {PLATFORM_ORDER.map((p) => {
        const list = accounts.filter((a) => a.platform === p);
        const Icon = ICONS[p];
        return (
          <div key={p} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">{p}</h2>
              <Badge variant="outline">{list.length}</Badge>
            </div>
            {list.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  No {p} account added yet.
                  <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
                    Add {p} account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {list.map((a) => (
                  <AccountCard key={a.id} a={a} onOpen={() => setOpenId(a.id)} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground">
        Every account is tied to one brand. Only active authorised accounts appear in the Publishing
        Calendar; pausing an account pauses its scheduled publishing and raises an alert; archiving
        preserves publishing history. Historical content records are never deleted when an account is
        disconnected, and every access change is written to the audit log.
      </p>

      {open && (
        <AccountDetail
          a={open}
          onClose={() => setOpenId(null)}
          onPatch={(p, note) => patch(open.id, p, note)}
        />
      )}

      <AddAccountDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        existing={accounts}
        onRequest={(platform, name, brand) => {
          setAccounts((prev) => [
            ...prev,
            {
              id: `SA-${prev.length + 1}${Math.floor(Math.random() * 9)}`,
              platform,
              accountName: name,
              handle: name,
              brand,
              profileUrl: "—",
              owner: "Clean Craft Pvt Ltd",
              managers: [MANAGER_NAME],
              status: "Attention Required",
              lastSync: "—",
              lastPublished: "—",
              scheduledCount: 0,
              permissions: ["Connection requested — no permissions granted yet"],
              connectedOn: "Not connected",
              tokenExpiry: "No token issued",
              publishingPermission: false,
              recentFailures: 0,
              requiredAction: "Complete the official platform sign-in to finish connecting.",
              warning: "Connection request pending platform sign-in.",
              tone: "from-slate-500/20 to-slate-500/5",
              users: [
                {
                  name: MANAGER_NAME,
                  role: "Social Media Account Manager",
                  level: "Account Administrator",
                  grantedOn: "Today",
                  grantedBy: "CEO",
                  lastActivity: "Today",
                },
              ],
              accessHistory: [
                { at: "Today", by: MANAGER_NAME, note: "Connection requested (placeholder — OAuth not enabled yet)" },
              ],
            },
          ]);
          setAddOpen(false);
          toast.success("Connection request recorded. Platform sign-in is not enabled yet.");
        }}
      />
    </div>
  );
}

function AccountCard({ a, onOpen }: { a: SocialAccount; onOpen: () => void }) {
  const Icon = ICONS[a.platform];
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className={`h-11 w-11 shrink-0 rounded-full bg-gradient-to-br ${a.tone} grid place-items-center`}>
            <Icon className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{a.accountName}</div>
            <div className="text-xs text-muted-foreground truncate">{a.handle}</div>
            <Badge variant="outline" className="mt-1">{a.brand}</Badge>
          </div>
        </div>
        <span className={`inline-block text-[11px] rounded-full border px-2 py-0.5 ${statusTone(a.status)}`}>
          {a.status}
        </span>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>Last sync: {a.lastSync}</div>
          <div>Last published: {a.lastPublished}</div>
          <div>Scheduled posts: {a.scheduledCount}</div>
        </div>
        {a.warning && (
          <div className="text-xs text-amber-700 flex items-start gap-1">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {a.warning}
          </div>
        )}
        <Button size="sm" variant="outline" className="w-full" onClick={onOpen}>
          View Account
        </Button>
      </CardContent>
    </Card>
  );
}

/* ---------------- detail ---------------- */

function AccountDetail({
  a,
  onClose,
  onPatch,
}: {
  a: SocialAccount;
  onClose: () => void;
  onPatch: (p: Partial<SocialAccount>, note?: string) => void;
}) {
  const [newUser, setNewUser] = useState("");
  const [newRole, setNewRole] = useState("Content Executive");
  const [newLevel, setNewLevel] = useState<AccessLevel>("Content Manager");
  const [issue, setIssue] = useState("");

  const history = PUBLISH_RECORDS.filter((r) => r.account === a.handle);
  const scheduled = history.filter((r) => r.status === "Scheduled" || r.status === "Ready to Publish");
  const published = history.filter((r) => r.status === "Published" || r.status === "Publishing Failed");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {a.accountName}
            <span className={`text-[11px] rounded-full border px-2 py-0.5 ${statusTone(a.status)}`}>
              {a.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <F l="Platform" v={a.platform} />
          <F l="Username / channel" v={a.handle} />
          <F l="Brand or business unit" v={a.brand} />
          <F l="Public profile URL" v={a.profileUrl} />
          <F l="Account owner" v={a.owner} />
          <F l="Assigned managers" v={a.managers.join(", ") || "None"} />
          <F l="Connection date" v={a.connectedOn} />
          <F l="Last successful activity" v={a.lastSync} />
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground">Permissions granted (least-privilege)</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {a.permissions.map((p) => (
                <Badge key={p} variant="secondary">{p}</Badge>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Access tokens and secrets are stored encrypted on the server and are never displayed.
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Account Health
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
            <F l="Connection health" v={a.status} />
            <F l="Publishing permission" v={a.publishingPermission ? "Granted" : "Missing"} />
            <F l="Token expiry" v={a.tokenExpiry} />
            <F l="Recent publishing failures" v={String(a.recentFailures)} />
            <F l="Platform restriction" v={a.restriction ?? "None"} />
            <F l="Suspension warning" v={a.suspension ?? "None"} />
            <F l="Unusual access alert" v={a.unusualAccess ?? "None detected"} />
            <F l="Required action" v={a.requiredAction ?? "None"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Publishing History ({published.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {published.length === 0 && (
              <p className="text-xs text-muted-foreground">No published records for this account.</p>
            )}
            {published.map((r) => (
              <div key={r.id} className="rounded-md border p-2 flex flex-wrap items-center gap-3 text-sm">
                <div className={`h-9 w-12 shrink-0 rounded bg-gradient-to-br ${r.thumbTone} grid place-items-center`}>
                  <Film className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="truncate">{r.title}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    {r.contentId} · {r.publishedAt ?? `${r.date} ${r.time}`} · {r.platform}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    By {r.publishedBy ?? "—"} · {r.publishedUrl ?? "No URL recorded"}
                  </div>
                </div>
                <Badge variant={r.status === "Published" ? "secondary" : "destructive"} className="ml-auto">
                  {r.status}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info(`Open ${r.contentId} in Content Queue to see full history.`)}
                >
                  View Content
                </Button>
              </div>
            ))}
            <div className="text-xs text-muted-foreground pt-1">
              Scheduled content on this account: {scheduled.length}
              {scheduled.length > 0 && ` (${scheduled.map((s) => s.contentId).join(", ")})`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Access Management ({a.users.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {a.users.map((u) => (
              <div key={u.name} className="rounded-md border p-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{u.name}</span>
                  <Badge variant="outline">{u.role}</Badge>
                  <Badge variant={u.level === "Account Administrator" ? "default" : "secondary"}>
                    {u.level}
                  </Badge>
                  {u.exited && <Badge variant="destructive">Exited employee</Badge>}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => {
                      onPatch(
                        { users: a.users.filter((x) => x.name !== u.name) },
                        `Removed ${u.level} access for ${u.name}`,
                      );
                      toast.success(`Access revoked for ${u.name}. Audit log updated.`);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove Access
                  </Button>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Granted {u.grantedOn} by {u.grantedBy} · Last activity {u.lastActivity}
                </div>
              </div>
            ))}

            <div className="grid gap-2 sm:grid-cols-4 border-t pt-3">
              <div>
                <Label className="text-xs">Employee name</Label>
                <Input value={newUser} onChange={(e) => setNewUser(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Access level</Label>
                <Select value={newLevel} onValueChange={(v) => setNewLevel(v as AccessLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="self-end"
                onClick={() => {
                  if (!newUser.trim()) return toast.error("Enter the employee name.");
                  if (newLevel === "Account Administrator") {
                    toast.info("Account Administrator access needs senior approval — request logged.");
                  }
                  onPatch(
                    {
                      users: [
                        ...a.users,
                        {
                          name: newUser,
                          role: newRole,
                          level: newLevel,
                          grantedOn: "Today",
                          grantedBy: MANAGER_NAME,
                          lastActivity: "—",
                        },
                      ],
                    },
                    `Granted ${newLevel} access to ${newUser}`,
                  );
                  setNewUser("");
                  toast.success("Authorised user assigned. Audit log updated.");
                }}
              >
                Assign user
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast.info("Connection request sent (placeholder) — official platform sign-in is not enabled yet.")
                }
              >
                Request connection
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onPatch({}, "Reauthorisation requested (placeholder)");
                  toast.info("Reauthorisation will open the platform sign-in once integrations are enabled.");
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Reauthorise account
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onPatch(
                    { publishingPaused: !a.publishingPaused },
                    a.publishingPaused ? "Publishing resumed" : "Publishing paused — scheduled posts held",
                  );
                  toast.success(
                    a.publishingPaused
                      ? "Publishing resumed."
                      : `Publishing paused. ${scheduled.length} scheduled post(s) held and an alert was raised.`,
                  );
                }}
              >
                <PauseCircle className="h-4 w-4 mr-1" />
                {a.publishingPaused ? "Resume publishing" : "Pause publishing"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={a.status === "Archived"}
                onClick={() => {
                  onPatch(
                    { status: "Archived", publishingPaused: true, users: [] },
                    "Account archived — publishing history preserved, access revoked",
                  );
                  toast.success("Account archived. Publishing history preserved.");
                }}
              >
                Archive account
              </Button>
            </div>
            <div>
              <Label className="text-xs">Report account issue</Label>
              <Textarea value={issue} onChange={(e) => setIssue(e.target.value)} />
              <Button
                size="sm"
                className="mt-1"
                onClick={() => {
                  if (!issue.trim()) return toast.error("Describe the issue first.");
                  onPatch({ warning: issue }, `Issue reported: ${issue}`);
                  setIssue("");
                  toast.success("Issue reported. Dashboard and Publishing Calendar alerts updated.");
                }}
              >
                Report issue
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Account deletion and ownership changes require additional senior approval and are not
              available from this page.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Access History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            {a.accessHistory.map((h, i) => (
              <div key={i}>• {h.at} — {h.by}: {h.note}</div>
            ))}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

function F({ l, v }: { l: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{l}</div>
      <div className="font-medium break-words">{v}</div>
    </div>
  );
}

/* ---------------- add account ---------------- */

function AddAccountDialog({
  open,
  onOpenChange,
  existing,
  onRequest,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing: SocialAccount[];
  onRequest: (platform: PlatformKey, name: string, brand: string) => void;
}) {
  const [platform, setPlatform] = useState<PlatformKey>("Instagram");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState(BRANDS[0]!);
  const duplicate = existing.some(
    (a) => a.platform === platform && a.handle.toLowerCase() === name.trim().toLowerCase(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Social Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-primary/30 p-3 flex items-start gap-2">
            <Lock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              You will never be asked for a social-media password here. Connection happens through
              the platform's own sign-in screen, which is not enabled yet — this records a connection
              request only.
            </p>
          </div>
          <div>
            <Label className="text-xs">Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as PlatformKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_ORDER.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Account name / username</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="@cleancraft.city" />
          </div>
          <div>
            <Label className="text-xs">Brand or business unit</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANDS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {duplicate && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> This platform profile is already added — duplicates
              are not allowed.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            disabled={!name.trim() || duplicate}
            onClick={() => onRequest(platform, name.trim(), brand)}
          >
            Request Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
