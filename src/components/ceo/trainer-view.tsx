import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Store, AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type TrainingKey =
  | "owner"
  | "manpower"
  | "machine"
  | "pos"
  | "customer";

type Issue = {
  store: string;
  type: string;
};

type Trainer = {
  id: string;
  name: string;
  initials: string;
  currentStores: number;
  training: Record<TrainingKey, number>;
  issues: Issue[];
};

const TRAINING_LABELS: { key: TrainingKey; label: string }[] = [
  { key: "owner", label: "Owner Training" },
  { key: "manpower", label: "Manpower Training" },
  { key: "machine", label: "Machine Training" },
  { key: "pos", label: "POS Training" },
  { key: "customer", label: "Customer Handling" },
];

const ISSUE_TYPES = [
  "Manpower not available",
  "Steam iron pending",
  "POS training incomplete",
  "Owner training",
  "Others",
];

const TRAINERS: Trainer[] = [
  {
    id: "aditi",
    name: "Aditi Sharma",
    initials: "AS",
    currentStores: 6,
    training: { owner: 100, manpower: 90, machine: 100, pos: 85, customer: 80 },
    issues: [
      { store: "Jaipur", type: "POS training incomplete" },
      { store: "Indore", type: "Steam iron pending" },
    ],
  },
  {
    id: "rohan",
    name: "Rohan Verma",
    initials: "RV",
    currentStores: 5,
    training: { owner: 95, manpower: 88, machine: 100, pos: 80, customer: 75 },
    issues: [
      { store: "Lucknow", type: "Manpower not available" },
      { store: "Kanpur", type: "Owner training" },
    ],
  },
  {
    id: "neha",
    name: "Neha Kulkarni",
    initials: "NK",
    currentStores: 7,
    training: { owner: 100, manpower: 92, machine: 95, pos: 90, customer: 85 },
    issues: [{ store: "Pune", type: "Steam iron pending" }],
  },
  {
    id: "karan",
    name: "Karan Bhatia",
    initials: "KB",
    currentStores: 4,
    training: { owner: 90, manpower: 80, machine: 100, pos: 70, customer: 78 },
    issues: [
      { store: "Chandigarh", type: "POS training incomplete" },
      { store: "Amritsar", type: "Manpower not available" },
    ],
  },
  {
    id: "priyanka",
    name: "Priyanka Nair",
    initials: "PN",
    currentStores: 6,
    training: { owner: 100, manpower: 95, machine: 100, pos: 92, customer: 88 },
    issues: [{ store: "Kochi", type: "Others" }],
  },
  {
    id: "sameer",
    name: "Sameer Khan",
    initials: "SK",
    currentStores: 5,
    training: { owner: 88, manpower: 82, machine: 90, pos: 75, customer: 70 },
    issues: [
      { store: "Hyderabad", type: "Owner training" },
      { store: "Vizag", type: "Steam iron pending" },
      { store: "Warangal", type: "Manpower not available" },
    ],
  },
  {
    id: "isha",
    name: "Isha Reddy",
    initials: "IR",
    currentStores: 8,
    training: { owner: 100, manpower: 96, machine: 100, pos: 94, customer: 90 },
    issues: [{ store: "Bengaluru", type: "POS training incomplete" }],
  },
  {
    id: "manish",
    name: "Manish Gupta",
    initials: "MG",
    currentStores: 4,
    training: { owner: 92, manpower: 85, machine: 90, pos: 80, customer: 76 },
    issues: [
      { store: "Bhopal", type: "Manpower not available" },
      { store: "Gwalior", type: "Others" },
    ],
  },
  {
    id: "shreya",
    name: "Shreya Menon",
    initials: "SM",
    currentStores: 6,
    training: { owner: 100, manpower: 90, machine: 100, pos: 88, customer: 82 },
    issues: [{ store: "Chennai", type: "Owner training" }],
  },
  {
    id: "vivek",
    name: "Vivek Singh",
    initials: "VS",
    currentStores: 5,
    training: { owner: 96, manpower: 87, machine: 95, pos: 82, customer: 79 },
    issues: [
      { store: "Patna", type: "Steam iron pending" },
      { store: "Ranchi", type: "POS training incomplete" },
    ],
  },
];

function progressColor(pct: number) {
  if (pct >= 95) return "bg-emerald-500";
  if (pct >= 85) return "bg-sky-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-red-500";
}

export function TrainerCeoView() {
  const [selected, setSelected] = useState<string>(TRAINERS[0].id);
  const trainer = TRAINERS.find((t) => t.id === selected)!;

  const issueCounts = ISSUE_TYPES.map((type) => ({
    type,
    count: trainer.issues.filter((i) => i.type === type).length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Trainer & Launch Executive Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            Select a trainer to view their store training progress and pending issues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {TRAINERS.map((t) => {
          const active = t.id === selected;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`text-left border rounded-lg p-3 transition-colors ${
                active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.currentStores} stores</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            No. of Current Stores — {trainer.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <div className="text-4xl font-semibold tabular-nums">{trainer.currentStores}</div>
            <div className="text-xs text-muted-foreground">stores currently being trained</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TRAINING_LABELS.map(({ key, label }) => {
            const pct = trainer.training[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="tabular-nums font-semibold">{pct}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${progressColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            Pending Issues in Stores Assigned
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {trainer.issues.length} open issue{trainer.issues.length === 1 ? "" : "s"} across assigned stores.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {issueCounts.map((ic) => (
              <div key={ic.type} className="border rounded-md p-2 bg-muted/20">
                <div className="text-[11px] text-muted-foreground line-clamp-2 min-h-[28px]">
                  {ic.type}
                </div>
                <div
                  className={`text-xl font-semibold tabular-nums mt-1 ${
                    ic.count > 0 ? "text-red-500" : "text-emerald-500"
                  }`}
                >
                  {ic.count}
                </div>
              </div>
            ))}
          </div>

          {trainer.issues.length > 0 ? (
            <div className="border rounded-md divide-y">
              {trainer.issues.map((iss, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <span className="font-medium">{iss.store}</span>
                  </div>
                  <span className="text-muted-foreground">{iss.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No pending issues.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
