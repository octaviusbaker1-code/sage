export type ReadingMode = "keeper" | "codex";

export type CardMeaning = {
  upright: string;
  reversed: string;
};

export type CardSlot = {
  name: string;
  reversed: boolean;
};

export type PositionKey = "Crown" | "Witness" | "Gateway" | "Root";

export type PositionState = {
  arcana: CardSlot;
  mask: CardSlot;
  shield: CardSlot;
};

export type ReadingState = {
  question: string;
  notes: string;
  core: CardSlot;
  positions: Record<PositionKey, PositionState>;
};

export type CombinationRule = {
  cards: string[];
  title: string;
  meaning: string;
};

export type StopRulePack = {
  title: string;
  severity: "medium" | "high";
  matches: string[];
  meaning: string;
  requiresReversed?: string[];
};

export type TriggeredStopRule = {
  title: string;
  severity: "medium" | "high";
  meaning: string;
};

export type ThemeCluster = Record<string, string[]>;

export type LibraryMaps = {
  arcanaMeanings: Record<string, CardMeaning>;
  maskMeanings: Record<string, CardMeaning>;
  shieldMeanings: Record<string, CardMeaning>;
  coreMeanings: Record<string, CardMeaning>;
  positionMeta: Record<
    PositionKey,
    {
      subtitle: string;
      prompt: string;
      stem: string;
    }
  >;
};

export type RulesConfig = {
  combinations: CombinationRule[];
  stopRulePacks: StopRulePack[];
  themes: ThemeCluster;
};

export type CodexDiagnostics = {
  overview: {
    core: string | null;
    coreReversed: boolean;
    reversedTotal: number;
    completedChambers: number;
    dominantChamber: PositionKey | null;
  };
  slotsByPosition: Record<
    PositionKey,
    Array<{
      lane: "Arcana" | "Mask" | "Shield";
      slot: CardSlot;
    }>
  >;
  stopRules: TriggeredStopRule[];
  combinations: Array<{ title: string; meaning: string }>;
  clusters: Array<{ name: string; hits: string[] }>;
};

export type ReadingResults = {
  sections: Record<PositionKey, string>;
  stopRules: TriggeredStopRule[];
  combinations: Array<{ title: string; meaning: string }>;
  clusters: Array<{ name: string; hits: string[] }>;
  spread: string;
  keeper: string;
  codexDiagnostics: CodexDiagnostics;
};

const POSITION_LENS: Record<PositionKey, string> = {
  Crown:
    "Crown carries the law of the spread. It tells you what is truly governing the matter, whether or not it is the easiest truth to face.",
  Witness:
    "Witness brings the hidden thing nearer to the light. It shows what is revealing itself, emerging, or refusing to remain unnamed.",
  Gateway:
    "Gateway gathers the pressure of crossing. It points to the threshold, decision, or change-point that gives the spread consequence.",
  Root:
    "Root speaks beneath appearances. It shows what is quietly taking hold and what may still remain once the visible moment has passed.",
};

export function createEmptySlot(): CardSlot {
  return { name: "", reversed: false };
}

export function createEmptyReading(): ReadingState {
  return {
    question: "",
    notes: "",
    core: createEmptySlot(),
    positions: {
      Crown: { arcana: createEmptySlot(), mask: createEmptySlot(), shield: createEmptySlot() },
      Witness: { arcana: createEmptySlot(), mask: createEmptySlot(), shield: createEmptySlot() },
      Gateway: { arcana: createEmptySlot(), mask: createEmptySlot(), shield: createEmptySlot() },
      Root: { arcana: createEmptySlot(), mask: createEmptySlot(), shield: createEmptySlot() },
    },
  };
}

export function chamberCompletion(position: PositionState): number {
  return [position.arcana?.name, position.mask?.name, position.shield?.name].filter(Boolean).length;
}

export function getCompletionStats(reading: ReadingState) {
  const positionEntries = Object.values(reading.positions);
  const filledCore = reading.core?.name ? 1 : 0;
  const filledQuestion = reading.question.trim() ? 1 : 0;
  const filledNotes = reading.notes.trim() ? 1 : 0;
  const filledSelections = positionEntries.reduce((sum, p) => sum + chamberCompletion(p), 0);
  const total = 15;
  const filled = filledSelections + filledCore + filledQuestion + filledNotes;

  return {
    filled,
    total,
    percent: Math.round((filled / total) * 100),
    completedChambers: positionEntries.filter((p) => chamberCompletion(p) === 3).length,
  };
}

export function formatSlot(slot: CardSlot | undefined): string {
  if (!slot?.name) return "";
  return `${slot.name}${slot.reversed ? " reversed" : ""}`;
}

export function getMeaning(map: Record<string, CardMeaning>, slot: CardSlot | undefined): string {
  if (!slot?.name) return "";
  const entry = map[slot.name];
  if (!entry) return "";
  return slot.reversed ? entry.reversed : entry.upright;
}

function countReversals(...slots: CardSlot[]) {
  return slots.filter((slot) => slot?.reversed).length;
}

function chamberTone(reversedCount: number): string {
  if (reversedCount === 0) {
    return "This chamber feels comparatively direct. Its message may still be nuanced, but it is not especially trying to hide itself.";
  }
  if (reversedCount === 1) {
    return "Part of this chamber is visible, while another part is still turning inward. Read it as half-spoken rather than fully settled.";
  }
  if (reversedCount === 2) {
    return "Most of this chamber is working beneath the surface. The message is real, but it carries delay, inwardness, or emotional weight.";
  }
  return "This chamber is deeply internalized. It should be read carefully, because much of its truth is still forming below the obvious layer.";
}

function scoreChamber(position: PositionState, reading: ReadingState, rules: RulesConfig): number {
  const names = [position.arcana?.name, position.mask?.name, position.shield?.name].filter(Boolean) as string[];
  let score = names.length * 2;
  score += countReversals(position.arcana, position.mask, position.shield);

  for (const themeCards of Object.values(rules.themes)) {
    const hits = themeCards.filter((card) => names.includes(card)).length;
    if (hits >= 2) score += hits;
  }

  for (const combo of rules.combinations) {
    const hits = combo.cards.filter((card) => names.includes(card)).length;
    if (hits >= 2) score += 3;
  }

  for (const stopRule of rules.stopRulePacks) {
    const hits = stopRule.matches.filter((card) => names.includes(card) || reading.core?.name === card).length;
    if (hits >= 2) score += stopRule.severity === "high" ? 4 : 2;
  }

  return score;
}

function findDominantChamber(reading: ReadingState, rules: RulesConfig): PositionKey | null {
  const entries = Object.entries(reading.positions) as Array<[PositionKey, PositionState]>;
  const completed = entries.filter(([, p]) => chamberCompletion(p) === 3);
  if (!completed.length) return null;

  const scored = completed.map(([key, position]) => ({
    key,
    score: scoreChamber(position, reading, rules),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.key ?? null;
}

function buildInterChamberWeave(reading: ReadingState, dominantChamber: PositionKey | null) {
  const crown = reading.positions.Crown;
  const witness = reading.positions.Witness;
  const gateway = reading.positions.Gateway;
  const root = reading.positions.Root;

  const complete =
    chamberCompletion(crown) === 3 &&
    chamberCompletion(witness) === 3 &&
    chamberCompletion(gateway) === 3 &&
    chamberCompletion(root) === 3;

  if (!complete) return "";

  const dominantText = dominantChamber
    ? `${dominantChamber} carries the strongest pressure in the spread, so the other chambers should be read in relation to it.`
    : "";

  return `The movement of the spread runs from Crown into Witness, from Witness into Gateway, and from Gateway into Root. In other words: what governs eventually reveals itself, what reveals itself eventually asks for crossing, and what is crossed eventually takes root. ${dominantText}`;
}

function buildPosture(stopRules: TriggeredStopRule[], combinations: Array<{ title: string; meaning: string }>) {
  const severe = stopRules.find((rule) => rule.severity === "high");

  if (severe) {
    return `The posture here should be slower and more careful than usual. ${severe.title} is active, so this is not the kind of reading that should be flattened into a quick answer.`;
  }

  if (stopRules.length) {
    return "The spread still asks for care. Nothing here says panic, but it does say not to rush past the deeper implications.";
  }

  if (combinations.length >= 2) {
    return "The field is concentrated. Several combinations are sharpening the same territory, so the reading should be weighted toward what repeats most strongly.";
  }

  return "The field is comparatively open. It still deserves care, but it is not strongly resisting interpretation.";
}

function buildDominantChamberLine(dominantChamber: PositionKey | null) {
  if (!dominantChamber) return "";
  switch (dominantChamber) {
    case "Crown":
      return "Crown is the load-bearing chamber, so the spread should be read first through what governs, not first through what feels most urgent.";
    case "Witness":
      return "Witness is the load-bearing chamber, so revelation matters more than preference here; what is being shown carries extra weight.";
    case "Gateway":
      return "Gateway is the load-bearing chamber, so the threshold itself is the heart of the reading; consequence gathers there.";
    case "Root":
      return "Root is the load-bearing chamber, so what is taking hold beneath the surface matters more than the drama of the present moment.";
  }
}

export function sectionText(
  position: PositionKey,
  arcana: CardSlot,
  mask: CardSlot,
  shield: CardSlot,
  maps: LibraryMaps,
): string {
  if (!arcana?.name || !mask?.name || !shield?.name) {
    return "Complete this chamber to generate synthesis.";
  }

  const arcanaMeaning = getMeaning(maps.arcanaMeanings, arcana);
  const maskMeaning = getMeaning(maps.maskMeanings, mask);
  const shieldMeaning = getMeaning(maps.shieldMeanings, shield);
  const reversedCount = countReversals(arcana, mask, shield);

  return `${POSITION_LENS[position]} ${formatSlot(arcana)} sets the chamber’s central force through ${arcanaMeaning}. ${formatSlot(mask)} shapes how that force is carried, coloring it with ${maskMeaning}. ${formatSlot(shield)} shows where it lands, moves, or stabilizes through ${shieldMeaning}. ${chamberTone(reversedCount)}`;
}

export function detectStopRules(
  reading: ReadingState,
  rules: RulesConfig,
): TriggeredStopRule[] {
  const detected: TriggeredStopRule[] = [];
  const slots = Object.values(reading.positions).flatMap((p) => [p.arcana, p.mask, p.shield]).filter(Boolean);
  const pool = [reading.core?.name, ...slots.map((slot) => slot?.name)].filter(Boolean) as string[];

  (Object.entries(reading.positions) as Array<[PositionKey, PositionState]>).forEach(([name, p]) => {
    const trio = [p.arcana?.name, p.mask?.name, p.shield?.name].filter(Boolean);
    if (trio.length < 3) return;

    const reversedCount = countReversals(p.arcana, p.mask, p.shield);
    const structureHits = ["The Emperor", "Sovereign", "Stone"].filter((x) => trio.includes(x)).length;
    const depthHits = ["The Moon", "Depthwalker", "Shadow"].filter((x) => trio.includes(x)).length;
    const movementHits = ["The Fool", "Flame-Bearer", "Gate", "The Chariot", "Path", "Arrow"].filter((x) => trio.includes(x)).length;
    const collapseHits = ["The Tower", "Death", "Breaker", "Blade", "Veil"].filter((x) => trio.includes(x) || reading.core?.name === x).length;

    if (structureHits === 3) {
      detected.push({
        title: `${name}: Triple Alignment`,
        severity: "medium",
        meaning: "Structure and command dominate this chamber. Stability matters here, but so does the risk of becoming too rigid.",
      });
    }
    if (depthHits === 3) {
      detected.push({
        title: `${name}: Triple Alignment`,
        severity: "medium",
        meaning: "Depth material is fully active here. This chamber should be treated as psychologically or spiritually central.",
      });
    }
    if (movementHits >= 3) {
      detected.push({
        title: `${name}: Triple Alignment`,
        severity: "medium",
        meaning: "Movement is gathering quickly here. The spread may be urging motion before every condition is settled.",
      });
    }
    if (reversedCount >= 2) {
      detected.push({
        title: `${name}: Heavy Reversal Load`,
        severity: "medium",
        meaning: "This chamber is strongly internalized. What it says is real, but it may not yet be ready to act in a fully outward way.",
      });
    }
    if (collapseHits >= 3) {
      detected.push({
        title: `${name}: Collapse Pressure`,
        severity: "high",
        meaning: "This chamber carries rupture pressure. Interpret carefully before treating change here as casual or reversible.",
      });
    }
  });

  rules.stopRulePacks.forEach((rule) => {
    const hasMatches = rule.matches.every((item) => pool.includes(item));
    const hasRequiredReversals =
      !rule.requiresReversed ||
      rule.requiresReversed.every((item) => {
        if (reading.core?.name === item && reading.core?.reversed) return true;
        return slots.some((slot) => slot?.name === item && slot?.reversed);
      });

    if (hasMatches && hasRequiredReversals) {
      detected.push({
        title: rule.title,
        severity: rule.severity,
        meaning: rule.meaning,
      });
    }
  });

  if (reading.core?.name === "Veil") {
    detected.push({
      title: "Core Six Veil",
      severity: "medium",
      meaning: "The field asks for humility. Something is still hidden, protected, delayed, or not ready to be forced into full clarity.",
    });
  }
  if (reading.core?.name === "Echo") {
    detected.push({
      title: "Core Six Echo",
      severity: "medium",
      meaning: "Repetition matters here. The spread is likely circling something unfinished, familiar, or not yet transformed.",
    });
  }
  if (reading.core?.name === "Crown") {
    detected.push({
      title: "Core Six Crown",
      severity: "medium",
      meaning: "Completion energy is present. The spread carries added weight, consequence, and ripeness.",
    });
  }
  if (reading.core?.reversed && reading.core?.name) {
    detected.push({
      title: "Core Six Reversed",
      severity: "medium",
      meaning: "The spread-wide override is turned inward or obstructed. Read the field with extra care before assuming straightforward momentum.",
    });
  }

  const deduped: TriggeredStopRule[] = [];
  const seen = new Set<string>();
  for (const rule of detected) {
    const key = `${rule.title}-${rule.meaning}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(rule);
    }
  }

  return deduped;
}

export function detectCombinations(reading: ReadingState, rules: RulesConfig) {
  const slots = Object.values(reading.positions).flatMap((p) => [p.arcana, p.mask, p.shield]).filter(Boolean);
  const pool = [reading.core?.name, ...slots.map((slot) => slot?.name)].filter(Boolean) as string[];
  const found = rules.combinations.filter((combo) => combo.cards.every((c) => pool.includes(c)));

  if (pool.includes("The Tower") && pool.includes("Veil")) {
    found.push({
      title: "Collapse + Obscuration",
      meaning: "Breakdown is interacting with concealment or incomplete visibility. The spread should not be read as if everything is cleanly known yet.",
      cards: ["The Tower", "Veil"],
    });
  }
  if (pool.includes("Death") && pool.includes("Blade")) {
    found.push({
      title: "Terminal Severance",
      meaning: "A clean ending or decisive cutting-away is strongly emphasized.",
      cards: ["Death", "Blade"],
    });
  }
  if (pool.includes("The Lovers") && pool.includes("Gate")) {
    found.push({
      title: "Threshold Choice",
      meaning: "A choice-point is carrying real weight. Crossing it may reshape what comes after.",
      cards: ["The Lovers", "Gate"],
    });
  }
  if (pool.includes("The Devil") && pool.includes("Flame")) {
    found.push({
      title: "Heat of Attachment",
      meaning: "Desire, fixation, or emotional charge may be intensifying the spread beyond what is proportionate.",
      cards: ["The Devil", "Flame"],
    });
  }
  if (pool.includes("Sovereign") && pool.includes("Gate")) {
    found.push({
      title: "Sovereign Threshold",
      meaning: "A threshold is asking for self-rule, maturity, and ownership of consequence.",
      cards: ["Sovereign", "Gate"],
    });
  }

  const deduped: Array<{ title: string; meaning: string }> = [];
  const seen = new Set<string>();
  for (const combo of found) {
    const key = `${combo.title}-${combo.meaning}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push({ title: combo.title, meaning: combo.meaning });
    }
  }

  return deduped;
}

export function detectClusters(reading: ReadingState, rules: RulesConfig) {
  const pool = [
    reading.core?.name,
    ...Object.values(reading.positions).flatMap((p) => [p.arcana?.name, p.mask?.name, p.shield?.name]),
  ].filter(Boolean) as string[];

  return Object.entries(rules.themes)
    .map(([name, cards]) => ({ name, hits: cards.filter((c) => pool.includes(c)) }))
    .filter((x) => x.hits.length >= 3);
}

export function buildResults(
  reading: ReadingState,
  maps: LibraryMaps,
  rules: RulesConfig,
  mode: ReadingMode = "keeper",
): ReadingResults {
  const sections = Object.fromEntries(
    (Object.entries(reading.positions) as Array<[PositionKey, PositionState]>).map(([name, p]) => [
      name,
      sectionText(name, p.arcana, p.mask, p.shield, maps),
    ]),
  ) as Record<PositionKey, string>;

  const stopRules = detectStopRules(reading, rules);
  const combinations = detectCombinations(reading, rules);
  const clusters = detectClusters(reading, rules);
  const dominantChamber = findDominantChamber(reading, rules);

  const reversedTotal =
    (reading.core?.reversed ? 1 : 0) +
    Object.values(reading.positions)
      .flatMap((p) => [p.arcana, p.mask, p.shield])
      .filter((slot) => slot?.reversed).length;

  const slotsByPosition = Object.fromEntries(
    (Object.entries(reading.positions) as Array<[PositionKey, PositionState]>).map(([position, p]) => [
      position,
      [
        { lane: "Arcana" as const, slot: p.arcana },
        { lane: "Mask" as const, slot: p.mask },
        { lane: "Shield" as const, slot: p.shield },
      ].filter((x) => x.slot?.name),
    ]),
  ) as CodexDiagnostics["slotsByPosition"];

  const crown = reading.positions.Crown;
  const witness = reading.positions.Witness;
  const gateway = reading.positions.Gateway;
  const root = reading.positions.Root;

  const crownComplete = chamberCompletion(crown) === 3;
  const witnessComplete = chamberCompletion(witness) === 3;
  const gatewayComplete = chamberCompletion(gateway) === 3;
  const rootComplete = chamberCompletion(root) === 3;

  const codexSections: Record<PositionKey, string> = {
    Crown: crownComplete ? `Crown synthesis: ${sections.Crown}` : sections.Crown,
    Witness: witnessComplete ? `Witness synthesis: ${sections.Witness}` : sections.Witness,
    Gateway: gatewayComplete ? `Gateway synthesis: ${sections.Gateway}` : sections.Gateway,
    Root: rootComplete ? `Root synthesis: ${sections.Root}` : sections.Root,
  };

  const keeperSections: Record<PositionKey, string> = {
    Crown: crownComplete ? sections.Crown : sections.Crown,
    Witness: witnessComplete ? sections.Witness : sections.Witness,
    Gateway: gatewayComplete ? sections.Gateway : sections.Gateway,
    Root: rootComplete ? sections.Root : sections.Root,
  };

  const coreMeaning = getMeaning(maps.coreMeanings, reading.core);
  const chamberWeave = buildInterChamberWeave(reading, dominantChamber);
  const posture = buildPosture(stopRules, combinations);
  const dominantLine = buildDominantChamberLine(dominantChamber);

  const spreadCodex = reading.core?.name
    ? `Spread-wide synthesis: the override is ${formatSlot(reading.core)}. ${coreMeaning} ${dominantLine} ${
        reversedTotal
          ? `There are ${reversedTotal} reversed cards in play, which means the field should be read with depth and restraint.`
          : `The active field is comparatively direct, with less concealment or inward drag.`
      } ${
        clusters.length
          ? `The dominant pattern clusters are ${clusters.map((c) => c.name).join(", ")}.`
          : `No single pattern cluster fully dominates the spread.`
      } ${
        combinations.length
          ? `Key combinations include ${combinations.map((c) => c.title).join(", ")}.`
          : `No named combination fully overrides the spread.`
      } ${posture}`
    : "Select a Core Six card to generate the spread-wide synthesis.";

  const spreadKeeper = reading.core?.name
    ? `${formatSlot(reading.core)} governs the whole field. ${coreMeaning} ${dominantLine} ${
        reversedTotal
          ? `Because several cards are reversed, the truth here is not entirely outward; some of it is still buried, delayed, or turning inward.`
          : `The field is comparatively open, so the spread is speaking in a clearer voice.`
      } ${
        clusters.length
          ? `The strongest currents running through the reading are ${clusters.map((c) => c.name).join(", ")}.`
          : `No single theme overtakes the whole field, so the reading should stay layered.`
      } ${
        combinations.length
          ? `Certain combinations sharpen the message, especially ${combinations.map((c) => c.title).join(", ")}.`
          : `The message is being carried more by chamber interplay than by one named combination.`
      } ${posture}`
    : "Select a Core Six card to generate the spread-wide synthesis.";

  const keeperCodex =
    crownComplete && witnessComplete && gatewayComplete && rootComplete && reading.core?.name
      ? `Keeper synthesis: Crown establishes what governs through ${formatSlot(crown.arcana)}, ${formatSlot(crown.mask)}, and ${formatSlot(crown.shield)}. Witness answers by revealing itself through ${formatSlot(witness.arcana)}, ${formatSlot(witness.mask)}, and ${formatSlot(witness.shield)}. Gateway gathers the force of crossing through ${formatSlot(gateway.arcana)}, ${formatSlot(gateway.mask)}, and ${formatSlot(gateway.shield)}. Root shows what quietly takes hold through ${formatSlot(root.arcana)}, ${formatSlot(root.mask)}, and ${formatSlot(root.shield)}. ${coreMeaning} ${chamberWeave} ${dominantLine} ${posture} ${
          stopRules.length
            ? `The strongest stop-rule pressure is ${stopRules[0].title}: ${stopRules[0].meaning}`
            : `No severe stop-rule overrides the field.`
        }`
      : "Complete all four chambers and the Core Six to receive the Keeper synthesis.";

  const keeperVoice =
    crownComplete && witnessComplete && gatewayComplete && rootComplete && reading.core?.name
      ? `Keeper synthesis: this spread has one body, not four disconnected pieces. Crown tells you what truly rules the matter through ${formatSlot(crown.arcana)}, ${formatSlot(crown.mask)}, and ${formatSlot(crown.shield)}. Witness shows what is coming into clearer sight through ${formatSlot(witness.arcana)}, ${formatSlot(witness.mask)}, and ${formatSlot(witness.shield)}. Gateway marks where the reading becomes consequential through ${formatSlot(gateway.arcana)}, ${formatSlot(gateway.mask)}, and ${formatSlot(gateway.shield)}. Root reveals what is already beginning to live underneath the moment through ${formatSlot(root.arcana)}, ${formatSlot(root.mask)}, and ${formatSlot(root.shield)}. ${coreMeaning} ${chamberWeave} ${dominantLine} ${posture} ${
          stopRules.length
            ? `The spread carries real caution, especially through ${stopRules[0].title}.`
            : `The field is not heavily resisting interpretation, so its message can be spoken more directly.`
        } ${
          combinations.length
            ? `The sharpest concentration of meaning gathers around ${combinations.map((c) => c.title).join(", ")}.`
            : `Its meaning comes more from the relationship between chambers than from one singular named combination.`
        } Final Keeper charge: let what governs remain central, let what is revealing itself be honestly named, let the threshold be honored for what it costs, and let the root show you what will still be true after the moment moves on.`
      : "Complete all four chambers and the Core Six to receive the Keeper synthesis.";

  const codexDiagnostics: CodexDiagnostics = {
    overview: {
      core: reading.core?.name || null,
      coreReversed: !!reading.core?.reversed,
      reversedTotal,
      completedChambers: [crownComplete, witnessComplete, gatewayComplete, rootComplete].filter(Boolean).length,
      dominantChamber,
    },
    slotsByPosition,
    stopRules,
    combinations,
    clusters,
  };

  return {
    sections: mode === "codex" ? codexSections : keeperSections,
    stopRules,
    combinations,
    clusters,
    spread: mode === "codex" ? spreadCodex : spreadKeeper,
    keeper: mode === "codex" ? keeperCodex : keeperVoice,
    codexDiagnostics,
  };
}
