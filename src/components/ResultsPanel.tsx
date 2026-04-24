import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, ScrollText, Volume2, Square, Copy } from "lucide-react";
import type { ReadingMode, ReadingState, ReadingResults } from "@/lib/reading-engine";
import { buildResults, chamberCompletion } from "@/lib/reading-engine";
import type { LibraryMaps } from "@/lib/reading-engine";
import type { RulesConfig } from "@/lib/reading-engine";

type ResultsPanelProps = {
  reading: ReadingState;
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  maps: LibraryMaps;
  rules: RulesConfig;
};

function ModeSwitch({
  mode,
  setMode,
}: {
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={() => setMode("keeper")}
        className={`rounded-xl px-4 py-2 ${
          mode === "keeper"
            ? "bg-amber-200/20 text-amber-100"
            : "bg-stone-900 text-stone-300 hover:bg-stone-800"
        }`}
      >
        <Bot className="mr-2 h-4 w-4" />
        SAGE Voice
      </Button>

      <Button
        type="button"
        onClick={() => setMode("codex")}
        className={`rounded-xl px-4 py-2 ${
          mode === "codex"
            ? "bg-amber-200/20 text-amber-100"
            : "bg-stone-900 text-stone-300 hover:bg-stone-800"
        }`}
      >
        <ScrollText className="mr-2 h-4 w-4" />
        Codex Mode
      </Button>
    </div>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-amber-200/15 bg-stone-900/80 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] md:p-6">
      <h3 className="mb-4 text-lg font-semibold text-amber-100">{title}</h3>
      {children}
    </div>
  );
}

function formatSlotLabel(name: string, reversed: boolean) {
  return `${name}${reversed ? " reversed" : ""}`;
}

function StopRuleBlock({ results }: { results: ReadingResults }) {
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-[0.24em] text-stone-500">Stop Rules</div>
      {results.stopRules.length ? (
        results.stopRules.map((rule) => (
          <div
            key={`${rule.title}-${rule.meaning}`}
            className={`rounded-xl border p-4 text-sm leading-7 ${
              rule.severity === "high"
                ? "border-red-300/20 bg-red-200/5 text-red-100"
                : "border-amber-300/15 bg-amber-200/5 text-amber-100"
            }`}
          >
            <div className="font-medium">{rule.title}</div>
            <div className="mt-2 opacity-90">{rule.meaning}</div>
          </div>
        ))
      ) : (
        <div className="rounded-xl border border-amber-200/10 bg-stone-950/70 p-4 text-sm text-stone-500">
          No stop rules triggered yet.
        </div>
      )}
    </div>
  );
}

function CombinationBlock({ results }: { results: ReadingResults }) {
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-[0.24em] text-stone-500">Special Combinations</div>
      {results.combinations.length ? (
        results.combinations.map((combo) => (
          <div
            key={combo.title}
            className="rounded-xl border border-amber-200/12 bg-stone-950/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
          >
            <div className="font-medium text-amber-100">{combo.title}</div>
            <div className="mt-2 text-sm leading-7 text-stone-300">{combo.meaning}</div>
          </div>
        ))
      ) : (
        <div className="rounded-xl border border-amber-200/10 bg-stone-950/70 p-4 text-sm text-stone-500">
          No listed combinations detected yet.
        </div>
      )}
    </div>
  );
}

function ClusterBlock({ results }: { results: ReadingResults }) {
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-[0.24em] text-stone-500">Pattern Clusters</div>
      <div className="flex flex-wrap gap-2">
        {results.clusters.length ? (
          results.clusters.map((cluster) => (
            <Badge key={cluster.name} className="rounded-lg bg-amber-200/10 px-3 py-1 text-amber-100">
              {cluster.name}: {cluster.hits.join(", ")}
            </Badge>
          ))
        ) : (
          <div className="rounded-xl border border-amber-200/10 bg-stone-950/70 p-4 text-sm text-stone-500">
            No dominant clusters yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPanel({ reading, mode, setMode, maps, rules }: ResultsPanelProps) {
  const results = useMemo(() => buildResults(reading, maps, rules, mode), [reading, maps, rules, mode]);
  const ready = Object.values(reading.positions).every((p) => chamberCompletion(p) === 3) && reading.core?.name;
  const diagnostics = results.codexDiagnostics;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const buildSpeechText = () => {
    const sectionText = Object.entries(results.sections)
      .map(([name, text]) => `${name}. ${text}`)
      .join(" ");

    return [
      reading.question ? `Question. ${reading.question}` : "",
      sectionText ? `Section by section synthesis. ${sectionText}` : "",
      results.spread ? `Spread wide synthesis. ${results.spread}` : "",
      results.keeper ? `Keeper synthesis. ${results.keeper}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const readAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Read aloud is not supported in this browser.");
      return;
    }

    const textToSpeak = buildSpeechText();

    if (!textToSpeak.trim()) {
      alert("There is no reading text to read yet.");
      return;
    }

    window.speechSynthesis.cancel();

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voices = window.speechSynthesis.getVoices();

      const preferredVoice =
        voices.find((voice) => voice.lang.toLowerCase().startsWith("en") && voice.name.toLowerCase().includes("female")) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us")) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speak();
      };

      setTimeout(() => {
        if (!window.speechSynthesis.speaking) {
          speak();
        }
      }, 500);
    } else {
      speak();
    }
  };

  const stopReading = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const copyReading = async () => {
    const sectionText = Object.entries(results.sections)
      .map(([name, text]) => `${name}\n${text}`)
      .join("\n\n");

    const fullText = [
      reading.question ? `Question\n${reading.question}` : "",
      sectionText ? `Section-by-Section Synthesis\n${sectionText}` : "",
      results.spread ? `Spread-Wide Synthesis\n${results.spread}` : "",
      results.keeper ? `Keeper Synthesis\n${results.keeper}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(fullText);
      alert("Reading copied.");
    } catch {
      alert("Could not copy the reading.");
    }
  };

  return (
    <Card className="min-h-[78vh] rounded-[1.75rem] border-amber-200/10 bg-stone-950/80 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl text-amber-100 md:text-3xl">
            <Sparkles className="h-6 w-6 text-amber-300" />
            SAGE Reading Engine
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            <ModeSwitch mode={mode} setMode={setMode} />

            <Button
              type="button"
              onClick={readAloud}
              className="rounded-xl bg-amber-200/10 px-4 py-2 text-amber-100 hover:bg-amber-200/20"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Read Aloud
            </Button>

            <Button
              type="button"
              onClick={copyReading}
              className="rounded-xl bg-stone-900 px-4 py-2 text-stone-300 hover:bg-stone-800"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Reading
            </Button>

            <Button
              type="button"
              onClick={stopReading}
              className="rounded-xl bg-stone-900 px-4 py-2 text-stone-300 hover:bg-stone-800"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          </div>
        </div>

        {isSpeaking && <p className="text-sm text-amber-200">SAGE is reading the synthesis aloud.</p>}
      </CardHeader>

      <CardContent className="pb-6">
        <ScrollArea className="h-[72vh] pr-2 md:pr-4">
          <div className="space-y-8">
            {!ready && (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-200/5 p-5 text-sm leading-7 text-amber-100">
                Fill each chamber and choose a Core Six card to unlock the full deep-reading synthesis.
              </div>
            )}

            {reading.question && (
              <SectionBlock title="Question">
                <p className="text-sm leading-8 text-stone-200">{reading.question}</p>
              </SectionBlock>
            )}

            <SectionBlock title="Section-by-Section Synthesis">
              <div className="space-y-5">
                {Object.entries(results.sections).map(([name, text]) => (
                  <div
                    key={name}
                    className="rounded-xl border border-amber-200/10 bg-stone-950/70 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]"
                  >
                    <h4 className="mb-3 text-base font-semibold text-amber-100">{name}</h4>
                    <p className="text-sm leading-8 text-stone-300">{text}</p>
                  </div>
                ))}
              </div>
            </SectionBlock>

            <SectionBlock title="Spread-Wide Synthesis">
              <p className="text-sm leading-8 text-stone-300">{results.spread}</p>
            </SectionBlock>

            <div className="rounded-2xl border border-amber-300/25 bg-amber-200/5 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
              <h3 className="mb-3 text-lg font-semibold text-amber-100">Keeper Synthesis</h3>
              <p className="text-sm leading-8 text-stone-200">{results.keeper}</p>
            </div>

            <Separator className="h-px bg-amber-200/20" />

            <SectionBlock title="SAGE Codex Panel">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-amber-200/12 bg-stone-950/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                    <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Core Six</div>
                    <div className="mt-2 text-lg font-semibold text-amber-100">
                      {diagnostics.overview.core || "—"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200/12 bg-stone-950/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                    <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Core Reversal</div>
                    <div className="mt-2 text-lg font-semibold text-amber-100">
                      {diagnostics.overview.coreReversed ? "Reversed" : "Upright"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200/12 bg-stone-950/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                    <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Reversed Cards</div>
                    <div className="mt-2 text-lg font-semibold text-amber-100">
                      {diagnostics.overview.reversedTotal}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200/12 bg-stone-950/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                    <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Completed Chambers</div>
                    <div className="mt-2 text-lg font-semibold text-amber-100">
                      {diagnostics.overview.completedChambers}/4
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-500">Triggered Symbols By Chamber</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(diagnostics.slotsByPosition).map(([position, items]) => (
                      <div
                        key={position}
                        className="rounded-xl border border-amber-200/12 bg-stone-950/70 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
                      >
                        <div className="mb-3 font-semibold text-amber-100">{position}</div>
                        <div className="space-y-3 text-sm text-stone-300">
                          {items.length ? (
                            items.map((item) => (
                              <div
                                key={`${position}-${item.lane}-${item.slot.name}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-amber-200/10 bg-stone-900/80 px-3 py-3"
                              >
                                <span className="text-stone-400">{item.lane}</span>
                                <span className="text-right text-stone-200">
                                  {formatSlotLabel(item.slot.name, item.slot.reversed)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-lg border border-amber-200/10 bg-stone-900/80 px-3 py-3 text-stone-500">
                              No symbols selected yet.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <StopRuleBlock results={results} />
                <CombinationBlock results={results} />
                <ClusterBlock results={results} />
              </div>
            </SectionBlock>

            {reading.notes && (
              <>
                <Separator className="h-px bg-amber-200/20" />
                <SectionBlock title="Notes">
                  <p className="text-sm leading-8 text-stone-300">{reading.notes}</p>
                </SectionBlock>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
