import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Save, RotateCcw, Wand2, Stars } from "lucide-react";
import PositionCard from "@/components/PositionCard";
import ResultsPanel from "@/components/ResultsPanel";
import LibraryView, { type LibraryItem } from "@/components/LibraryView";
import ArchiveView, { type ArchiveEntry } from "@/components/ArchiveView";
import SummaryStrip from "@/components/SummaryStrip";
import SpreadView from "@/components/SpreadView";
import {
  createEmptyReading,
  type LibraryMaps,
  type ReadingMode,
  type ReadingState,
  type RulesConfig,
  getCompletionStats,
} from "@/lib/reading-engine";
import {
  ARCANA,
  MASKS,
  SHIELDS,
  CORE_SIX,
  POSITION_META,
  ARCANA_MEANINGS,
  MASK_MEANINGS,
  SHIELD_MEANINGS,
  CORE_MEANINGS,
} from "@/data/cards";
import { COMBINATIONS, STOP_RULE_PACKS, THEMES } from "@/data/rules";

const STORAGE_KEYS = {
  archive: "twelvefold-archive",
  draft: "twelvefold-draft",
  mode: "twelvefold-reading-mode",
};

const MAPS: LibraryMaps = {
  arcanaMeanings: ARCANA_MEANINGS,
  maskMeanings: MASK_MEANINGS,
  shieldMeanings: SHIELD_MEANINGS,
  coreMeanings: CORE_MEANINGS,
  positionMeta: POSITION_META,
};

const RULES: RulesConfig = {
  combinations: COMBINATIONS,
  stopRulePacks: STOP_RULE_PACKS,
  themes: THEMES,
};

function safeJsonParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function exportArchive(entries: ArchiveEntry[]) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `twelvefold-archive-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function buildLibraryItems(): LibraryItem[] {
  return [
    ...ARCANA.map((name) => ({
      name,
      category: "Arcana" as const,
      meaning: ARCANA_MEANINGS[name].upright,
      reversed: ARCANA_MEANINGS[name].reversed,
    })),
    ...MASKS.map((name) => ({
      name,
      category: "Mask" as const,
      meaning: MASK_MEANINGS[name].upright,
      reversed: MASK_MEANINGS[name].reversed,
    })),
    ...SHIELDS.map((name) => ({
      name,
      category: "Shield" as const,
      meaning: SHIELD_MEANINGS[name].upright,
      reversed: SHIELD_MEANINGS[name].reversed,
    })),
    ...CORE_SIX.map((name) => ({
      name,
      category: "Core Six" as const,
      meaning: CORE_MEANINGS[name].upright,
      reversed: CORE_MEANINGS[name].reversed,
    })),
  ];
}

export default function App() {
  const [reading, setReading] = useState<ReadingState>(createEmptyReading());
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [readingMode, setReadingMode] = useState<ReadingMode>("keeper");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedArchive = safeJsonParse<ArchiveEntry[]>(localStorage.getItem(STORAGE_KEYS.archive), []);
    const storedDraft = safeJsonParse<ReadingState>(localStorage.getItem(STORAGE_KEYS.draft), createEmptyReading());
    const storedMode = localStorage.getItem(STORAGE_KEYS.mode);

    setArchive(Array.isArray(storedArchive) ? storedArchive : []);
    setReading(storedDraft && storedDraft.positions ? storedDraft : createEmptyReading());
    setReadingMode(storedMode === "codex" ? "codex" : "keeper");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.archive, JSON.stringify(archive));
  }, [archive, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(reading));
  }, [reading, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.mode, readingMode);
  }, [readingMode, hydrated]);

  const stats = useMemo(() => getCompletionStats(reading), [reading]);
  const libraryItems = useMemo(() => buildLibraryItems(), []);

  const saveReading = () => {
    const entry: ArchiveEntry = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      question: reading.question,
      reading,
    };
    setArchive((prev) => [entry, ...prev]);
  };

  const clearReading = () => setReading(createEmptyReading());

  const loadExample = () => {
    setReading({
      question: "What is the deeper shape of this threshold?",
      notes: "A sample reading to demonstrate the engine and layout.",
      core: { name: "Loom", reversed: false },
      positions: {
        Crown: {
          arcana: { name: "Strength", reversed: true },
          mask: { name: "Breaker", reversed: false },
          shield: { name: "Tide", reversed: false },
        },
        Witness: {
          arcana: { name: "The Hierophant", reversed: false },
          mask: { name: "Arrow", reversed: false },
          shield: { name: "Path", reversed: false },
        },
        Gateway: {
          arcana: { name: "Temperance", reversed: true },
          mask: { name: "Depthwalker", reversed: false },
          shield: { name: "Beacon", reversed: false },
        },
        Root: {
          arcana: { name: "The Chariot", reversed: false },
          mask: { name: "Flame-Bearer", reversed: false },
          shield: { name: "Flame", reversed: false },
        },
      },
    });
  };

  const importArchive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ArchiveEntry[];
      if (Array.isArray(parsed)) {
        setArchive(parsed);
      }
    } catch {
      window.alert("That file could not be imported.");
    }
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-neutral-950 to-stone-900 text-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-amber-200/10 bg-stone-950/80 p-6 shadow-2xl md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-3xl font-semibold text-amber-100 md:text-4xl">
                <Sparkles className="h-7 w-7 text-amber-300 md:h-8 md:w-8" />
                SAGE
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-base italic text-stone-300 md:text-lg">
                  The voice that witnesses the pattern.
                </p>
                <p className="text-sm leading-7 text-stone-400 md:text-base">
                  Companion to the Twelvefold Keeper with guided reading, deep synthesis, codex logic,
                  autosaved drafts, and archive support.
                </p>
                <p className="text-sm text-stone-500">Companion to the Twelvefold Keeper</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={loadExample} className="bg-amber-200/10 text-amber-100 hover:bg-amber-200/20">
                <Wand2 className="mr-2 h-4 w-4" />
                Load Example
              </Button>
              <Button onClick={saveReading} className="bg-amber-200/10 text-amber-100 hover:bg-amber-200/20">
                <Save className="mr-2 h-4 w-4" />
                Save Reading
              </Button>
              <Button
                variant="secondary"
                className="bg-stone-200 text-stone-950 hover:bg-stone-300"
                onClick={clearReading}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Reading
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <SummaryStrip reading={reading} />
        </div>

        <Tabs defaultValue="reading" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 gap-2 rounded-2xl bg-stone-900 p-2 text-stone-300">
            <TabsTrigger value="reading" className="rounded-xl px-4 py-3 hover:bg-stone-800">
              Reading
            </TabsTrigger>
            <TabsTrigger value="results" className="rounded-xl px-4 py-3 hover:bg-stone-800">
              Results
            </TabsTrigger>
            <TabsTrigger value="library" className="rounded-xl px-4 py-3 hover:bg-stone-800">
              Library
            </TabsTrigger>
            <TabsTrigger value="archive" className="rounded-xl px-4 py-3 hover:bg-stone-800">
              Archive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reading">
            <div className="rounded-[1.75rem] bg-stone-950/40 p-1">
              <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-8">
                  <Card className="rounded-[1.75rem] border-amber-200/10 bg-stone-950/80 shadow-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-2xl text-amber-100">
                        <Stars className="h-5 w-5 text-amber-300" />
                        New Session
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="grid gap-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm text-stone-300">Question or intention</label>
                          <Input
                            value={reading.question}
                            onChange={(e) => setReading((r) => ({ ...r, question: e.target.value }))}
                            placeholder="What is this reading about?"
                            className="w-full border-stone-700 bg-stone-900 text-stone-100"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm text-stone-300">Core Six — Override</label>
                          <select
                            value={reading.core?.name || ""}
                            onChange={(e) =>
                              setReading((r) => ({
                                ...r,
                                core: { name: e.target.value, reversed: false },
                              }))
                            }
                            className="w-full rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100"
                          >
                            <option value="">One card only</option>
                            {CORE_SIX.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              setReading((r) => ({
                                ...r,
                                core: { ...r.core, reversed: !r.core.reversed },
                              }))
                            }
                            className={`mt-2 w-full rounded-md border px-3 py-2 text-xs transition ${
                              reading.core?.name
                                ? "border-amber-300/20 bg-stone-950 text-stone-300 hover:border-amber-300/40"
                                : "border-stone-800 bg-stone-950/50 text-stone-600"
                            }`}
                            disabled={!reading.core?.name}
                          >
                            Core Six: {reading.core?.reversed ? "Reversed" : "Upright"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-stone-300">Notes</label>
                        <Textarea
                          value={reading.notes}
                          onChange={(e) => setReading((r) => ({ ...r, notes: e.target.value }))}
                          placeholder="Optional reading notes..."
                          className="min-h-[110px] w-full border-stone-700 bg-stone-900 text-stone-100"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-400">
                        <Badge className="bg-emerald-200/10 text-emerald-200">Draft autosaves locally</Badge>
                        <Badge className="bg-amber-200/10 text-amber-100">
                          Mode: {readingMode === "keeper" ? "SAGE Voice" : "Codex Mode"}
                        </Badge>
                        <span>
                          {stats.completedChambers === 4 && reading.core?.name
                            ? "Full synthesis ready."
                            : "Keep filling chambers to unlock full synthesis."}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6">
                    {(
                      Object.entries(reading.positions) as Array<
                        [keyof ReadingState["positions"], ReadingState["positions"][keyof ReadingState["positions"]]]
                      >
                    ).map(([name, value]) => (
                      <PositionCard
                        key={name}
                        name={name}
                        value={value}
                        onChange={(next) =>
                          setReading((r) => ({
                            ...r,
                            positions: { ...r.positions, [name]: next },
                          }))
                        }
                        arcana={ARCANA as unknown as string[]}
                        masks={MASKS as unknown as string[]}
                        shields={SHIELDS as unknown as string[]}
                      />
                    ))}
                  </div>
                </div>

                <div className="xl:sticky xl:top-6">
                  <SpreadView />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <div className="rounded-[1.75rem] bg-stone-950/60 p-1">
              <ResultsPanel reading={reading} mode={readingMode} setMode={setReadingMode} maps={MAPS} rules={RULES} />
            </div>
          </TabsContent>

          <TabsContent value="library">
            <div className="rounded-[1.75rem] bg-stone-950/60 p-1">
              <LibraryView items={libraryItems} />
            </div>
          </TabsContent>

          <TabsContent value="archive">
            <div className="rounded-[1.75rem] bg-stone-950/60 p-1">
              <ArchiveView
                entries={archive}
                onLoad={(entry) => setReading(entry.reading)}
                onDelete={(id) => setArchive((prev) => prev.filter((x) => x.id !== id))}
                onExport={() => exportArchive(archive)}
                onImport={importArchive}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
