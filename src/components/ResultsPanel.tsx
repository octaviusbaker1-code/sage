import { useEffect, useMemo, useState } from "react";

type ResultsPanelProps = {
  result?: any;
  results?: any;
  reading?: any;
  mode?: string;
  title?: string;
  subtitle?: string;
  onClear?: () => void;
  className?: string;
  [key: string]: any;
};

type KeeperSection = {
  name: string;
  value: any;
  line: string;
  text: string;
};

const SECTION_NAMES = ["Core Six", "Crown", "Witness", "Gateway", "Root"];

const ARCANA_WORDS = [
  "fool",
  "magician",
  "high priestess",
  "empress",
  "emperor",
  "hierophant",
  "lovers",
  "chariot",
  "strength",
  "hermit",
  "wheel",
  "justice",
  "hanged man",
  "death",
  "deathwalker",
  "temperance",
  "devil",
  "tower",
  "star",
  "moon",
  "sun",
  "judgement",
  "judgment",
  "world",
];

const MASK_WORDS = [
  "flame-bearer",
  "flame bearer",
  "stone-keeper",
  "stone keeper",
  "twin-voice",
  "twin voice",
  "vessel",
  "sovereign",
  "depthwalker",
  "weaver",
  "breaker",
  "tide-singer",
  "tide singer",
  "architect",
  "anchor",
  "beacon",
  "shadow",
  "gate",
  "path",
  "mirror",
  "crown",
  "spark",
];

const SHIELD_WORDS = [
  "stone",
  "flame",
  "tide",
  "veil",
  "path",
  "gate",
  "vessel",
  "shadow",
  "weaver",
  "beacon",
  "anchor",
  "root",
  "wave",
  "echo",
  "star",
  "wind",
  "sigil",
  "blade",
];

function labelize(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function cleanText(value: any): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value;

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean).join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => {
        const text = cleanText(val);
        return text ? `${labelize(key)}: ${text}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function sentenceCase(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function findValueByPossibleKeys(source: any, possibleKeys: string[]): any {
  if (!source || typeof source !== "object") return undefined;

  const normalizedKeys = possibleKeys.map(normalize);

  for (const [key, value] of Object.entries(source)) {
    if (normalizedKeys.includes(normalize(key))) {
      return value;
    }
  }

  return undefined;
}

function getContentFromProps(props: ResultsPanelProps): any {
  return (
    props.result ??
    props.results ??
    props.reading ??
    props.output ??
    props.data ??
    props.content ??
    props.interpretation ??
    props.spread ??
    null
  );
}

function getSection(content: any, sectionName: string): any {
  if (!content) return null;

  const direct = findValueByPossibleKeys(content, [sectionName]);
  if (direct) return direct;

  const sections = findValueByPossibleKeys(content, [
    "sections",
    "spreadSections",
    "readingSections",
    "positions",
    "cards",
  ]);

  if (sections) {
    if (Array.isArray(sections)) {
      const found = sections.find((item) => {
        const name = cleanText(
          item?.name ?? item?.title ?? item?.position ?? item?.section ?? ""
        );
        return normalize(name) === normalize(sectionName);
      });

      if (found) return found;
    }

    if (typeof sections === "object") {
      const found = findValueByPossibleKeys(sections, [sectionName]);
      if (found) return found;
    }
  }

  return null;
}

function getMainText(content: any): string {
  if (!content) return "";

  const preferred =
    findValueByPossibleKeys(content, [
      "text",
      "body",
      "reading",
      "result",
      "interpretation",
      "mainInterpretation",
      "fullReading",
      "summary",
    ]) ?? content;

  return cleanText(preferred);
}

function cardLine(section: any): string {
  if (!section) return "";

  if (typeof section === "string") return section;

  if (Array.isArray(section)) return section.map(cleanText).filter(Boolean).join(" • ");

  const tarot =
    section.card ??
    section.tarot ??
    section.arcana ??
    section.majorArcana ??
    section.major ??
    section.tarotCard;

  const mask =
    section.mask ??
    section.archetype ??
    section.bone ??
    section.keeper ??
    section.face;

  const shield =
    section.shield ??
    section.suit ??
    section.domain ??
    section.element;

  const bridge =
    section.bridge ??
    section.path ??
    section.movement ??
    section.nextStep;

  const pieces = [tarot, mask, shield, bridge].map(cleanText).filter(Boolean);

  if (pieces.length > 0) return pieces.join(" • ");

  return cleanText(section);
}

function hasTerm(text: string, term: string): boolean {
  return text.toLowerCase().includes(term.toLowerCase());
}

function hasAll(text: string, terms: string[]): boolean {
  return terms.every((term) => hasTerm(text, term));
}

function countTerms(text: string, terms: string[]): string[] {
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term.toLowerCase()));
}

function isReversed(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("reversed") ||
    lower.includes("reverse") ||
    lower.includes("rx") ||
    lower.includes("inverted")
  );
}

function extractDominantThemes(fullText: string): string[] {
  const themes: string[] = [];
  const lower = fullText.toLowerCase();

  if (lower.includes("crown") || lower.includes("sovereign") || lower.includes("judgement") || lower.includes("judgment")) {
    themes.push("sovereignty and the call to answer from a higher place");
  }

  if (lower.includes("gateway") || lower.includes("gate") || lower.includes("threshold") || lower.includes("lovers")) {
    themes.push("a threshold where choice becomes consequence");
  }

  if (lower.includes("shadow") || lower.includes("devil") || lower.includes("tower") || lower.includes("veil")) {
    themes.push("hidden pressure, attachment, or material that cannot be bypassed");
  }

  if (lower.includes("weaver") || lower.includes("world") || lower.includes("loom")) {
    themes.push("patterns completing, integrating, or revealing their design");
  }

  if (lower.includes("vessel") || lower.includes("tide") || lower.includes("moon")) {
    themes.push("emotional containment, intuition, and the movement of feeling");
  }

  if (lower.includes("flame") || lower.includes("spark") || lower.includes("tower")) {
    themes.push("heat, ignition, disruption, or transformation through fire");
  }

  if (lower.includes("stone") || lower.includes("root") || lower.includes("anchor")) {
    themes.push("embodiment, grounding, and what becomes real after the reading settles");
  }

  return Array.from(new Set(themes));
}

function detectStopRules(fullText: string): string[] {
  const rules: string[] = [];

  if (hasAll(fullText, ["tower", "veil"])) {
    rules.push(
      "Collapse + Obscuration: Tower and Veil together warn that something unstable is not fully visible yet. The Keeper would slow the reading here and ask what is being softened, hidden, denied, or explained away."
    );
  }

  if (hasAll(fullText, ["deathwalker", "veil"])) {
    rules.push(
      "Deathwalker + Veil: A transformation is happening behind the curtain. This combination says the ending or rebirth may already be underway, even if the full meaning has not revealed itself."
    );
  }

  if (
    hasAll(fullText, ["star reversed", "veil"]) ||
    hasAll(fullText, ["star", "reversed", "veil"])
  ) {
    rules.push(
      "Rare Hope Obscuration: Star reversed with Veil suggests buried hope, spiritual fatigue, or a vision that cannot yet be trusted because the field is fogged."
    );
  }

  if (hasTerm(fullText, "tower reversed")) {
    rules.push(
      "Contained Collapse: Tower reversed signals an internalized disruption, delayed release, or a collapse being held inside instead of openly expressed."
    );
  }

  if (hasAll(fullText, ["devil", "flame"])) {
    rules.push(
      "Attachment + Heat: Devil with Flame warns of desire, fixation, temptation, urgency, or a heated attachment cycle. The Keeper asks whether the fire is sacred, reactive, or consuming."
    );
  }

  if (hasAll(fullText, ["lovers", "gateway"])) {
    rules.push(
      "Choice-Point Emphasis: Lovers in the Gateway makes the threshold relational, values-based, and difficult to cross unconsciously. This is not just a feeling. It is a choosing."
    );
  }

  if (hasAll(fullText, ["hanged man", "gateway"])) {
    rules.push(
      "Suspended Threshold: Hanged Man in the Gateway says forward movement may require surrender, perspective reversal, or a pause before action."
    );
  }

  if (hasAll(fullText, ["judgement", "crown"]) || hasAll(fullText, ["judgment", "crown"])) {
    rules.push(
      "Calling From Above: Judgement in the Crown signals awakening, reckoning, return, and the need to answer what is calling your name."
    );
  }

  if (hasAll(fullText, ["moon", "witness"])) {
    rules.push(
      "Moon-Witness Rule: The Witness position with Moon energy requires caution. The reading may reveal truth through feeling, dream, memory, or instinct, but not all signals are equally clear yet."
    );
  }

  if (hasAll(fullText, ["temperance reversed", "gateway"]) || hasAll(fullText, ["temperance", "reversed", "gateway"])) {
    rules.push(
      "Imbalance at the Threshold: Temperance reversed in the Gateway warns against crossing while dysregulated, rushed, split, or emotionally unblended."
    );
  }

  return rules;
}

function detectSpecialCombos(fullText: string): string[] {
  const combos: string[] = [];

  if (hasAll(fullText, ["sovereign", "crown"])) {
    combos.push(
      "Sovereign + Crown: A strong self-command signature. The reading emphasizes dignity, authority, and choosing from inner rulership instead of reaction."
    );
  }

  if (hasAll(fullText, ["world", "weaver"])) {
    combos.push(
      "World + Weaver: Completion is not random here. A larger pattern is closing, integrating, or revealing the design behind past events."
    );
  }

  if (hasAll(fullText, ["vessel", "flame"])) {
    combos.push(
      "Vessel + Flame: Emotion and fire are interacting. This can show passionate containment, emotional pressure, or feelings becoming fuel."
    );
  }

  if (hasAll(fullText, ["shadow", "root"])) {
    combos.push(
      "Shadow in the Root: The buried material is not decorative. It is foundational. What remains hidden underneath may shape the outcome."
    );
  }

  if (hasAll(fullText, ["stone", "judgement"]) || hasAll(fullText, ["stone", "judgment"])) {
    combos.push(
      "Judgement + Stone: A call is becoming solid. The awakening must be embodied, not just understood."
    );
  }

  if (hasTerm(fullText, "twin voice") || hasTerm(fullText, "twin-voice")) {
    combos.push(
      "Twin-Voice: A split signal is present. The Keeper asks you to listen for double meanings, mixed motives, mirrored truths, or two truths speaking at once."
    );
  }

  if (hasAll(fullText, ["gateway", "root"])) {
    combos.push(
      "Gateway to Root Emphasis: The decision point directly affects the becoming. What is crossed now becomes what is lived later."
    );
  }

  if (hasAll(fullText, ["depthwalker", "path"])) {
    combos.push(
      "Depthwalker + Path: The way forward is not shallow. The next movement requires descent, honesty, and willingness to walk through the deeper layer."
    );
  }

  if (hasAll(fullText, ["breaker", "gate"])) {
    combos.push(
      "Breaker + Gate: A threshold may open through disruption. What breaks may be the very thing that creates passage."
    );
  }

  if (hasAll(fullText, ["hermit", "sovereign"])) {
    combos.push(
      "Hermit + Sovereign: Inner wisdom is maturing into self-rule. The answer is not outside the self; it is being formed in solitude, discernment, and integrity."
    );
  }

  return combos;
}

function buildSectionSynthesis(section: KeeperSection, allSections: KeeperSection[], fullText: string): string {
  const name = section.name;
  const text = section.text;
  const line = section.line;

  const crown = allSections.find((item) => item.name === "Crown");
  const witness = allSections.find((item) => item.name === "Witness");
  const gateway = allSections.find((item) => item.name === "Gateway");
  const root = allSections.find((item) => item.name === "Root");
  const core = allSections.find((item) => item.name === "Core Six");

  const reversed = isReversed(text);
  const dominantWords = countTerms(text, [...ARCANA_WORDS, ...MASK_WORDS, ...SHIELD_WORDS]);
  const themes = extractDominantThemes(fullText);

  const reversalTone = reversed
    ? " Because reversal energy is present here, this does not simply point outward. It turns the lesson inward, showing where the pattern may be delayed, resisted, hidden, internalized, or asking for correction before it can express cleanly."
    : "";

  const themeSentence =
    themes.length > 0
      ? ` It participates in the larger field of ${themes.slice(0, 3).join(", ")}.`
      : "";

  if (name === "Core Six") {
    return `The Core Six is the override tone of the entire reading. With ${line}, the Keeper places this energy above the spread like a command seal. This is the lens through which the other positions must be read, not a side note. It tells us the reading wants to be understood through ${dominantWords.length ? dominantWords.slice(0, 3).join(", ") : "the central spiritual pattern that is currently active"}.${reversalTone}${themeSentence}`;
  }

  if (name === "Crown") {
    const witnessLine = witness?.line ? ` It leans directly into the Witness, because what appears above you is also being mirrored inside you through ${witness.line}.` : "";
    return `The Crown shows the higher pressure and the spiritual lesson pressing down on the reading. With ${line}, the field is asking what must be recognized from a higher vantage point before any action is taken. This is the part of the reading that names the call, the burden, the blessing, or the truth trying to rise above ordinary reaction.${witnessLine}${reversalTone}${themeSentence}`;
  }

  if (name === "Witness") {
    const crownLine = crown?.line ? ` It answers the Crown by showing the inner mechanism beneath ${crown.line}.` : "";
    const gatewayLine = gateway?.line ? ` It also prepares the Gateway, because what is witnessed here becomes the condition you carry into ${gateway.line}.` : "";
    return `The Witness is the diagnostic chamber of the spread. With ${line}, the Keeper is showing what is being observed inside the pattern: the motive, mirror, wound, memory, hesitation, or truth underneath the surface.${crownLine}${gatewayLine}${reversalTone}${themeSentence}`;
  }

  if (name === "Gateway") {
    const witnessLine = witness?.line ? ` The Gateway does not stand alone; it grows out of what the Witness exposed through ${witness.line}.` : "";
    const rootLine = root?.line ? ` This matters because the Root shows where this threshold wants to land: ${root.line}.` : "";
    return `The Gateway is the threshold of the reading. With ${line}, the Keeper is showing the place where the reading stops being information and becomes choice. This is where you either cross consciously, pause wisely, or refuse to carry an old pattern forward.${witnessLine}${rootLine}${reversalTone}${themeSentence}`;
  }

  if (name === "Root") {
    const gatewayLine = gateway?.line ? ` It is the consequence of the Gateway, meaning ${gateway.line} becomes embodied here.` : "";
    const coreLine = core?.line ? ` The Core Six still governs the Root, so ${core.line} tells us how this outcome should be held.` : "";
    return `The Root is what the reading becomes in the body, in behavior, and in lived reality. With ${line}, the Keeper is showing the final settling point of the pattern. This is not only the outcome; it is the embodiment of the choice, the lesson, and the energy that remains after the reading descends from symbol into life.${gatewayLine}${coreLine}${reversalTone}${themeSentence}`;
  }

  return `${name} carries ${line}.${reversalTone}${themeSentence}`;
}

function buildKeeperSynthesis(sections: KeeperSection[], stopRules: string[], combos: string[], fullText: string): string {
  const core = sections.find((item) => item.name === "Core Six" && item.line);
  const crown = sections.find((item) => item.name === "Crown" && item.line);
  const witness = sections.find((item) => item.name === "Witness" && item.line);
  const gateway = sections.find((item) => item.name === "Gateway" && item.line);
  const root = sections.find((item) => item.name === "Root" && item.line);

  const themes = extractDominantThemes(fullText);
  const reversedCount = sections.filter((section) => isReversed(section.text)).length;

  if (!sections.some((section) => section.line)) {
    return fullText
      ? "The Keeper can feel the reading as one continuous field, but the structured positions were not separately identified in the app data. The message should be read as a single current rather than a sectioned spread."
      : "No Keeper synthesis can be generated yet because no reading has been entered.";
  }

  const opening = core?.line
    ? `The Core Six places ${core.line} over the entire spread, so every card beneath it has to be interpreted through that command layer.`
    : "The reading opens without a separate Core Six override, so the spread must be read through the movement of the four main positions.";

  const crownMove = crown?.line
    ? ` In the Crown, ${crown.line} names the higher lesson or pressure above the reading.`
    : "";

  const witnessMove = witness?.line
    ? ` The Witness then brings the hidden mechanism forward through ${witness.line}, showing what the soul, mind, or pattern is actually doing beneath the surface.`
    : "";

  const gatewayMove = gateway?.line
    ? ` The Gateway becomes the active threshold through ${gateway.line}; this is where the reading asks for a conscious crossing instead of an automatic reaction.`
    : "";

  const rootMove = root?.line
    ? ` The Root settles the message into ${root.line}, showing what this becomes when it leaves the symbolic field and enters lived behavior.`
    : "";

  const themeMove =
    themes.length > 0
      ? ` The strongest currents moving through the spread are ${themes.join("; ")}.`
      : "";

  const reversalMove =
    reversedCount > 0
      ? ` There are ${reversedCount} reversal signals in the field, so the Keeper would not treat this as a simple outward prediction. Part of the work is internal: correction, delay, integration, shadow-contact, or the refusal to move before the energy is clean.`
      : " The energy is not dominated by reversal, so the spread reads more as movement, recognition, and embodiment than as blockage alone.";

  const stopMove =
    stopRules.length > 0
      ? ` The stop rules matter here. They ask you to slow down, because the reading contains a caution signature rather than only confirmation.`
      : " No major stop rule overtakes the spread, so the reading can be approached as guidance rather than a hard warning.";

  const comboMove =
    combos.length > 0
      ? ` The special combinations show that the cards are talking to each other, not sitting separately. The message is relational, layered, and sequential.`
      : " No special combination dominates the spread, so the message is carried mainly by the position flow.";

  const finalLine =
    "Keeper message: choose from sovereignty, not from hunger; move from clarity, not pressure; and let the threshold be crossed only by the part of you that can carry the consequence with integrity.";

  return `${opening}${crownMove}${witnessMove}${gatewayMove}${rootMove}${themeMove}${reversalMove}${stopMove}${comboMove}\n\n${finalLine}`;
}

function buildFullDisplayText(
  sections: KeeperSection[],
  stopRules: string[],
  combos: string[],
  keeper: string,
  fullText: string
): string {
  const sectionText = sections
    .filter((section) => section.line)
    .map((section) => {
      const synthesis = buildSectionSynthesis(section, sections, fullText);
      return `${section.name}\n${section.line}\n\nSage-Style Synthesis\n${synthesis}`;
    })
    .join("\n\n");

  const stopRuleText =
    stopRules.length > 0
      ? stopRules.join("\n")
      : "No major stop rule was detected from the current reading text.";

  const comboText =
    combos.length > 0
      ? combos.join("\n")
      : "No special combination was detected from the current reading text.";

  return [
    sectionText,
    `Stop Rules\n${stopRuleText}`,
    `Special Combos\n${comboText}`,
    `Keeper Synthesis\n${keeper}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function ReadingBlock({
  title,
  children,
}: {
  title: string;
  children: any;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <h3 className="mb-2 text-base font-bold text-white sm:text-lg">{title}</h3>
      <div className="whitespace-pre-wrap break-words text-sm leading-7 text-white/85 sm:text-base">
        {children}
      </div>
    </div>
  );
}

function ResultsPanel(props: ResultsPanelProps) {
  const {
    title = "Twelvefold Keeper Reading",
    subtitle = "Sage-style synthesis with section links, stop rules, special combos, and Keeper synthesis.",
    onClear,
    className = "",
  } = props;

  const [isReading, setIsReading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const content = getContentFromProps(props);

  const fullText = useMemo(() => {
    return getMainText(content).replace(/\s+/g, " ").trim();
  }, [content]);

  const sections: KeeperSection[] = useMemo(() => {
    return SECTION_NAMES.map((name) => {
      const value = getSection(content, name);
      const line = cardLine(value);
      const text = cleanText(value);

      return {
        name,
        value,
        line,
        text,
      };
    });
  }, [content]);

  const stopRules = useMemo(() => detectStopRules(fullText), [fullText]);
  const specialCombos = useMemo(() => detectSpecialCombos(fullText), [fullText]);

  const finalKeeperSynthesis = useMemo(() => {
    return buildKeeperSynthesis(sections, stopRules, specialCombos, fullText);
  }, [sections, stopRules, specialCombos, fullText]);

  const displayText = useMemo(() => {
    return buildFullDisplayText(
      sections,
      stopRules,
      specialCombos,
      finalKeeperSynthesis,
      fullText
    );
  }, [sections, stopRules, specialCombos, finalKeeperSynthesis, fullText]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopReading = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsReading(false);
  };

  const startReading = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!displayText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(displayText);

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en") &&
          voice.name.toLowerCase().includes("female")
      ) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleReading = () => {
    if (isReading) {
      stopReading();
    } else {
      startReading();
    }
  };

  const hasContent = Boolean(fullText || sections.some((section) => section.line));

  return (
    <section
      className={`w-full rounded-2xl border border-white/10 bg-black/30 p-4 shadow-lg backdrop-blur sm:p-6 ${className}`}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {speechSupported && hasContent && (
            <button
              type="button"
              onClick={toggleReading}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10 active:scale-95"
            >
              {isReading ? "Stop Reading" : "Read Aloud"}
            </button>
          )}

          {onClear && hasContent && (
            <button
              type="button"
              onClick={() => {
                stopReading();
                onClear();
              }}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 shadow-sm transition hover:bg-white/10 active:scale-95"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {hasContent ? (
        <div className="space-y-4">
          {sections.map((section) => {
            if (!section.line) return null;

            return (
              <ReadingBlock key={section.name} title={section.name}>
                <div className="mb-3 font-semibold text-white">{section.line}</div>
                <div>
                  <span className="font-bold text-white">Sage-Style Synthesis: </span>
                  {buildSectionSynthesis(section, sections, fullText)}
                </div>
              </ReadingBlock>
            );
          })}

          <ReadingBlock title="Stop Rules">
            {stopRules.length > 0 ? (
              <ul className="list-inside list-disc space-y-2">
                {stopRules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            ) : (
              "No major stop rule was detected from the current reading text."
            )}
          </ReadingBlock>

          <ReadingBlock title="Special Combos">
            {specialCombos.length > 0 ? (
              <ul className="list-inside list-disc space-y-2">
                {specialCombos.map((combo, index) => (
                  <li key={index}>{combo}</li>
                ))}
              </ul>
            ) : (
              "No special combination was detected from the current reading text."
            )}
          </ReadingBlock>

          <ReadingBlock title="Keeper Synthesis">{finalKeeperSynthesis}</ReadingBlock>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-6 text-center text-sm text-white/60">
          No reading has been generated yet.
        </div>
      )}
    </section>
  );
}

export { ResultsPanel };
export default ResultsPanel;
