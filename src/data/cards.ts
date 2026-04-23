import { Crown, Eye, KeyRound, TreePine } from "lucide-react";
import type { CardMeaning, PositionKey } from "@/lib/reading-engine";

export const ARCANA = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
] as const;

export const MASKS = [
  "Flame-Bearer",
  "Stone-Keeper",
  "Twin-Voice",
  "Vessel",
  "Sovereign",
  "Weaver",
  "Scale",
  "Depthwalker",
  "Arrow",
  "Architect",
  "Breaker",
  "Tide-Singer",
] as const;

export const SHIELDS = [
  "Gate",
  "Mirror",
  "Shadow",
  "Vessel",
  "Blade",
  "Path",
  "Tide",
  "Weaver",
  "Stone",
  "Anchor",
  "Beacon",
  "Flame",
] as const;

export const CORE_SIX = ["Spark", "Seed", "Veil", "Loom", "Echo", "Crown"] as const;

export const POSITION_META: Record<
  PositionKey,
  {
    subtitle: string;
    prompt: string;
    stem: string;
    icon: typeof Crown;
  }
> = {
  Crown: {
    subtitle: "Governing Truth",
    icon: Crown,
    prompt: "What truth governs the matter?",
    stem: "At the top of the spread, the governing truth gathers around",
  },
  Witness: {
    subtitle: "Revelation",
    icon: Eye,
    prompt: "What is being revealed?",
    stem: "In Witness, what comes into clearer view centers on",
  },
  Gateway: {
    subtitle: "Initiation",
    icon: KeyRound,
    prompt: "What threshold is opening?",
    stem: "At Gateway, the threshold opens through",
  },
  Root: {
    subtitle: "Becoming",
    icon: TreePine,
    prompt: "What is taking root beneath the surface?",
    stem: "At Root, what is quietly taking hold gathers around",
  },
};

export const ARCANA_MEANINGS: Record<string, CardMeaning> = {
  "The Fool": { upright: "beginning, trust, sacred risk", reversed: "hesitation at the threshold, fear of the leap, stalled beginning" },
  "The Magician": { upright: "will, manifestation, directed force", reversed: "scattered will, misfire, misdirected force" },
  "The High Priestess": { upright: "mystery, inner knowing, sacred concealment", reversed: "blocked intuition, over-withholding, hidden truth pressing upward" },
  "The Empress": { upright: "growth, nourishment, embodied creation", reversed: "depletion, smothering, creative stagnation" },
  "The Emperor": { upright: "authority, order, sovereignty", reversed: "rigidity, control strain, unstable command" },
  "The Hierophant": { upright: "sacred teaching, tradition, transmission", reversed: "misfit doctrine, broken guidance, refusal of the old form" },
  "The Lovers": { upright: "alignment, union, consequential choice", reversed: "misalignment, divided desire, unstable choice" },
  "The Chariot": { upright: "momentum, discipline, command", reversed: "loss of control, stalled movement, split direction" },
  Strength: { upright: "courage, restraint, inner mastery", reversed: "drained courage, inner strain, force without center" },
  "The Hermit": { upright: "solitude, wisdom, inward guidance", reversed: "withdrawal, over-isolation, wisdom not yet integrated" },
  "Wheel of Fortune": { upright: "cycles, fate, turning pattern", reversed: "resistance to the turning, stuck cycle, delayed shift" },
  Justice: { upright: "truth, balance, accountability", reversed: "imbalance, avoided truth, consequence deferred" },
  "The Hanged Man": { upright: "pause, surrender, transformed perspective", reversed: "stagnation, suspended tension, refusal to yield" },
  Death: { upright: "ending, release, transformation", reversed: "lingering attachment, resisted ending, incomplete release" },
  Temperance: { upright: "harmony, healing, integration", reversed: "disharmony, poor mixing, imbalance in the blend" },
  "The Devil": { upright: "attachment, distortion, entanglement", reversed: "recognition of bondage, loosening chains, unstable release" },
  "The Tower": { upright: "rupture, revelation, collapse", reversed: "internal collapse, dread before impact, resisted breakdown" },
  "The Star": { upright: "hope, renewal, guidance", reversed: "dimmed hope, doubt, recovery not yet trusted" },
  "The Moon": { upright: "mystery, intuition, undercurrents", reversed: "confusion thickening, illusion exposed, unstable intuition" },
  "The Sun": { upright: "illumination, vitality, open truth", reversed: "overexposure, false brightness, blocked joy" },
  Judgement: { upright: "awakening, reckoning, sacred recall", reversed: "avoided calling, delayed reckoning, refusal of the summons" },
  "The World": { upright: "completion, wholeness, fulfillment", reversed: "unfinished cycle, partial closure, near-completion without landing" },
};

export const MASK_MEANINGS: Record<string, CardMeaning> = {
  "Flame-Bearer": { upright: "fire, ignition, sacred beginning", reversed: "burnout, scattered fire, premature action" },
  "Stone-Keeper": { upright: "earth, grounding, endurance", reversed: "rigidity, stagnation, refusal to adapt" },
  "Twin-Voice": { upright: "duality, choice, mirrored paths", reversed: "indecision, split motives, false harmony" },
  Vessel: { upright: "emotion, depth, inward holding", reversed: "overflow, leakage, fragile containment" },
  Sovereign: { upright: "authority, presence, rightful power", reversed: "misused power, insecurity, unstable command" },
  Weaver: { upright: "fate, pattern, invisible design", reversed: "tangled pattern, crossed threads, distortion in the weave" },
  Scale: { upright: "balance, integration, recalibration", reversed: "imbalance, overcorrection, skewed measure" },
  Depthwalker: { upright: "shadow, reclamation, descent", reversed: "stuck descent, fear of depth, shadow without retrieval" },
  Arrow: { upright: "truth, clarity, precision", reversed: "misfire, blunt truth, direction lost" },
  Architect: { upright: "structure, design, formation", reversed: "faulty plan, unstable structure, weak foundations" },
  Breaker: { upright: "innovation, disruption, rupture", reversed: "chaos without purpose, needless fracture, destabilizing force" },
  "Tide-Singer": { upright: "release, flow, surrender", reversed: "backflow, emotional drag, refusal of release" },
};

export const SHIELD_MEANINGS: Record<string, CardMeaning> = {
  Gate: { upright: "entry, threshold, crossing", reversed: "refused threshold, blocked crossing, hesitant entry" },
  Mirror: { upright: "reflection, recognition, return", reversed: "distorted reflection, denial, self-misreading" },
  Shadow: { upright: "depth, concealment, buried truth", reversed: "spillage from the buried place, unstable concealment, hidden matter surfacing" },
  Vessel: { upright: "containment, holding, carrying", reversed: "fractured holding, overflow, weakened container" },
  Blade: { upright: "severance, distinction, boundary", reversed: "blunted boundary, messy severance, indecisive cut" },
  Path: { upright: "direction, route, unfolding course", reversed: "detour, loss of route, blocked direction" },
  Tide: { upright: "rhythm, cycle, emotional timing", reversed: "backwash, poor timing, emotional undertow" },
  Weaver: { upright: "integration, synthesis, joining", reversed: "fraying link, failed integration, split threads" },
  Stone: { upright: "stability, endurance, firmness", reversed: "instability, erosion, brittle endurance" },
  Anchor: { upright: "grounding, centering, settling", reversed: "drag, stuckness, poor anchoring" },
  Beacon: { upright: "illumination, signal, guidance", reversed: "false signal, dim light, guidance obscured" },
  Flame: { upright: "activation, quickening, motion", reversed: "misfire, overheating, wasted ignition" },
};

export const CORE_MEANINGS: Record<string, CardMeaning> = {
  Spark: {
    upright:
      "Spark means the whole field is waking. The reading may still be raw, but something undeniable has begun.",
    reversed:
      "The field wakes abruptly or chaotically; ignition without steadiness.",
  },
  Seed: {
    upright:
      "Seed means the whole field is formative. What is present is real, yet still becoming, and should not be forced into premature certainty.",
    reversed:
      "The field is still too early to finalize; form is real but immature.",
  },
  Veil: {
    upright:
      "Veil means the whole field includes concealment, protection, distortion, or sacred delay. Interpretation must remain humble and careful.",
    reversed:
      "Concealment, protection, distortion, or sacred delay governs the whole spread.",
  },
  Loom: {
    upright:
      "Loom means the whole field is patterned and interwoven. Individual placements are likely parts of one larger design.",
    reversed:
      "Everything is interwoven; one thread cannot be read apart from the larger pattern.",
  },
  Echo: {
    upright:
      "Echo means the whole field repeats. A lesson, dynamic, or emotional pattern is returning until it is recognized or transformed.",
    reversed:
      "Repetition is the law; lessons, attachments, and themes are returning for recognition.",
  },
  Crown: {
    upright:
      "Crown means the whole field ripens toward completion. The spread has weight, maturity, and an air of culmination or sovereign reckoning.",
    reversed:
      "The field ripens toward decisive culmination, sovereignty, and consequence.",
  },
};
