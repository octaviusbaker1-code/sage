import { useMemo, useState } from "react";
import ResultsPanel from "./components/ResultsPanel";

type SpreadPosition = "Core Six" | "Crown" | "Witness" | "Gateway" | "Root";

type ReadingState = Record<SpreadPosition, string>;

const EMPTY_READING: ReadingState = {
  "Core Six": "",
  Crown: "",
  Witness: "",
  Gateway: "",
  Root: "",
};

const SAMPLE_READING: ReadingState = {
  "Core Six": "Crown",
  Crown: "Judgement • Twin-Voice • Stone",
  Witness: "World • The Weaver • The Vessel",
  Gateway: "Hanged Man • Vessel • The Flame",
  Root: "Tower Reversed • The Sovereign • The Shadow",
};

const POSITIONS: SpreadPosition[] = [
  "Core Six",
  "Crown",
  "Witness",
  "Gateway",
  "Root",
];

function buildFullReading(reading: ReadingState): string {
  return POSITIONS.map((position) => {
    const value = reading[position]?.trim();
    return value ? `${position}\n${value}` : "";
  })
    .filter(Boolean)
    .join("\n\n");
}

function hasReading(reading: ReadingState): boolean {
  return POSITIONS.some((position) => reading[position].trim().length > 0);
}

function App() {
  const [draftReading, setDraftReading] = useState<ReadingState>(EMPTY_READING);
  const [submittedReading, setSubmittedReading] = useState<ReadingState | null>(
    null
  );

  const fullReadingText = useMemo(() => {
    if (!submittedReading) return "";
    return buildFullReading(submittedReading);
  }, [submittedReading]);

  const readingForPanel = useMemo(() => {
    if (!submittedReading) return null;

    return {
      "Core Six": submittedReading["Core Six"],
      Crown: submittedReading.Crown,
      Witness: submittedReading.Witness,
      Gateway: submittedReading.Gateway,
      Root: submittedReading.Root,
      fullReading: fullReadingText,
      reading: fullReadingText,
      interpretation: fullReadingText,
    };
  }, [submittedReading, fullReadingText]);

  const updatePosition = (position: SpreadPosition, value: string) => {
    setDraftReading((previous) => ({
      ...previous,
      [position]: value,
    }));
  };

  const generateReading = () => {
    if (!hasReading(draftReading)) return;

    setSubmittedReading({
      "Core Six": draftReading["Core Six"].trim(),
      Crown: draftReading.Crown.trim(),
      Witness: draftReading.Witness.trim(),
      Gateway: draftReading.Gateway.trim(),
      Root: draftReading.Root.trim(),
    });
  };

  const clearReading = () => {
    setDraftReading(EMPTY_READING);
    setSubmittedReading(null);
  };

  const loadSampleReading = () => {
    setDraftReading(SAMPLE_READING);
    setSubmittedReading(SAMPLE_READING);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-black/30 p-5 shadow-xl backdrop-blur sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
            Oracle of the Masked Keeper
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Twelvefold Keeper
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            Enter your Core Six, Crown, Witness, Gateway, and Root pulls below.
            The reading will pass directly into the Sage-style synthesis panel
            with stop rules, special combos, Keeper synthesis, and mobile
            read-aloud support.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-black/30 p-4 shadow-xl backdrop-blur sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Enter Reading</h2>
              <p className="mt-1 text-sm text-white/60">
                Example: Judgement • Twin-Voice • Stone
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadSampleReading}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 active:scale-95"
              >
                Load Test Reading
              </button>

              <button
                type="button"
                onClick={clearReading}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 active:scale-95"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {POSITIONS.map((position) => (
              <label key={position} className="block">
                <span className="mb-2 block text-sm font-bold text-white/90">
                  {position}
                </span>

                <textarea
                  value={draftReading[position]}
                  onChange={(event) =>
                    updatePosition(position, event.target.value)
                  }
                  placeholder={
                    position === "Core Six"
                      ? "Example: Crown"
                      : `Enter ${position} cards, masks, shields, or notes`
                  }
                  rows={position === "Core Six" ? 2 : 3}
                  className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/50 sm:text-base"
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={generateReading}
            disabled={!hasReading(draftReading)}
            className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black shadow-lg transition hover:bg-white/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40 sm:text-base"
          >
            Generate Sage-Style Keeper Synthesis
          </button>
        </section>

        <ResultsPanel
          reading={readingForPanel}
          result={readingForPanel}
          mode="twelvefold-keeper"
          title="Twelvefold Keeper Reading"
          subtitle="Sage-style synthesis with section links, stop rules, special combos, Keeper synthesis, and read aloud."
          onClear={clearReading}
        />
      </div>
    </main>
  );
}

export default App;
