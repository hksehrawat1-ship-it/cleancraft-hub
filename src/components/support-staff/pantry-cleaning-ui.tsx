import { Coffee, SprayCan, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { L, STATUS_LABEL, type Kind, type Lang, type Status } from "./pantry-cleaning-data";

export const tr = (lang: Lang) => (v: { en: string; hi: string }) => v[lang];

export function KindBadge({ kind, lang }: { kind: Kind; lang: Lang }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        kind === "pantry" ? "bg-amber-500/15 text-amber-700" : "bg-blue-500/15 text-blue-700"
      }`}
    >
      {kind === "pantry" ? <Coffee className="h-3.5 w-3.5" /> : <SprayCan className="h-3.5 w-3.5" />}
      {kind === "pantry" ? L.pantry[lang] : L.cleaning[lang]}
    </span>
  );
}

export function StatusBadge({ s, lang }: { s: Status; lang: Lang }) {
  const cls =
    s === "approved" || s === "completed"
      ? "bg-emerald-500/15 text-emerald-700"
      : s === "started"
        ? "bg-blue-500/15 text-blue-700"
        : s === "redo"
          ? "bg-destructive/15 text-destructive"
          : s === "review"
            ? "bg-amber-500/15 text-amber-700"
            : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {STATUS_LABEL[s][lang]}
    </span>
  );
}

export function AudioButton({ lang, className }: { lang: Lang; className?: string }) {
  return (
    <button
      type="button"
      aria-label={L.audio[lang]}
      onClick={() =>
        toast.info(lang === "hi" ? "आवाज़ निर्देश जल्द आएगा" : "Voice instruction coming soon")
      }
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ${className ?? ""}`}
    >
      <Volume2 className="h-5 w-5" />
    </button>
  );
}

export function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex overflow-hidden rounded-full border">
      {(["en", "hi"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-4 py-2 text-sm font-semibold ${
            lang === l ? "bg-primary text-primary-foreground" : "bg-background"
          }`}
        >
          {l === "en" ? "English" : "हिंदी"}
        </button>
      ))}
    </div>
  );
}
