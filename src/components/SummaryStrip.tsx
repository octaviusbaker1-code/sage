import React from "react";
import type { ReadingState } from "@/lib/reading-engine";
import { getCompletionStats } from "@/lib/reading-engine";

type MiniStatProps = {
  title: string;
  value: string;
  sub: string;
};

type SummaryStripProps = {
  reading: ReadingState;
};

function MiniStat({ title, value, sub }: MiniStatProps) {
  return (
    <div className="rounded-2xl border border-amber-200/12 bg-stone-950/80 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="text-xs uppercase tracking-[0.24em] text-stone-500">{title}</div>
      <div className="mt-3 text-2xl font-semibold text-amber-100">{value}</div>
      <div className="mt-2 text-sm leading-6 text-stone-400">{sub}</div>
    </div>
  );
}

export default function SummaryStrip({ reading }: SummaryStripProps) {
  const stats = getCompletionStats(reading);
  const selectedPool = [
    reading.core?.name,
    ...Object.values(reading.positions)
      .flatMap((p) => [p.arcana, p.mask, p.shield])
      .filter((slot) => slot?.name)
      .map((slot) => slot.name),
  ].filter(Boolean);

  const uniqueSelected = new Set(selectedPool).size;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MiniStat title="Progress" value={`${stats.percent}%`} sub={`${stats.filled}/${stats.total} fields`} />
      <MiniStat title="Completed Chambers" value={`${stats.completedChambers}/4`} sub="Ready for synthesis" />
      <MiniStat
        title="Core Six"
        value={reading.core?.name ? `${reading.core.name}${reading.core.reversed ? " reversed" : ""}` : "—"}
        sub={reading.core?.name ? "Override selected" : "Not chosen yet"}
      />
      <MiniStat title="Unique Symbols" value={String(uniqueSelected)} sub="Across all chambers" />
    </div>
  );
}
