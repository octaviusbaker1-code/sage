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

export type ThemeCluster = Record<string, string[]>;

export const COMBINATIONS: CombinationRule[] = [
  {
    cards: ["The Moon", "Shadow"],
    title: "Depth Combination",
    meaning:
      "Hidden emotional truth and submerged undercurrents are central. This combination deepens the reading and warns that surface appearances are not enough.",
  },
  {
    cards: ["The Emperor", "Sovereign"],
    title: "Authority Combination",
    meaning:
      "Embodied rulership, command, and rightful authority are emphasized. Questions of self-rule, power, and structure become load-bearing.",
  },
  {
    cards: ["Death", "Blade"],
    title: "Severance Combination",
    meaning:
      "A necessary ending or clean release is present. Something may need to be cut away rather than negotiated with.",
  },
  {
    cards: ["The Fool", "Gate"],
    title: "Threshold Combination",
    meaning:
      "A sacred beginning or first threshold is opening. The reading may point to a crossing that changes the path after it is taken.",
  },
  {
    cards: ["Temperance", "Weaver"],
    title: "Integration Combination",
    meaning:
      "Healing, weaving, and harmonizing forces are active. Separate pieces may belong to one larger design.",
  },
];

export const STOP_RULE_PACKS: StopRulePack[] = [
  {
    title: "Collapse + Obscuration",
    severity: "high",
    matches: ["The Tower", "Veil"],
    meaning:
      "Breakdown is interacting with concealment, fog, or incomplete visibility. Do not force certainty. Treat the reading as unstable until more is revealed.",
  },
  {
    title: "Deathwalker + Veil",
    severity: "high",
    matches: ["Depthwalker", "Veil"],
    meaning:
      "The spread is descending into shadow while clarity remains protected or obstructed. Go slower than you want to.",
  },
  {
    title: "Star Reversed + Veil",
    severity: "high",
    matches: ["The Star", "Veil"],
    requiresReversed: ["The Star"],
    meaning:
      "Hope is dimmed while the field is still veiled. This is not the moment to overpromise certainty, rescue, or clean resolution.",
  },
  {
    title: "Threshold Choice",
    severity: "medium",
    matches: ["The Lovers", "Gate"],
    meaning:
      "A consequential choice-point is active. The spread may be less about preference and more about irreversible alignment.",
  },
  {
    title: "Heat of Attachment",
    severity: "high",
    matches: ["The Devil", "Flame"],
    meaning:
      "Desire, fixation, or compulsion is energizing the reading. Passion may be real, but it may also be distorting proportion.",
  },
  {
    title: "Sovereign Threshold",
    severity: "medium",
    matches: ["Sovereign", "Gate"],
    meaning:
      "A crossing is demanding self-rule, clean authorship, and deliberate choice. The threshold should not be crossed from hunger or panic.",
  },
  {
    title: "Terminal Severance",
    severity: "high",
    matches: ["Death", "Blade"],
    meaning:
      "A clean cut, ending, or irreversible release is strongly emphasized. This is usually not a soft transition.",
  },
];

export const THEMES: ThemeCluster = {
  depth: ["The Moon", "Shadow", "Depthwalker", "Vessel", "The High Priestess"],
  structure: ["The Emperor", "Architect", "Stone", "Anchor", "Justice", "Sovereign"],
  movement: ["The Fool", "The Chariot", "Path", "Gate", "Flame-Bearer", "Arrow"],
  transformation: ["Death", "The Tower", "Breaker", "Blade", "Tide-Singer"],
  integration: ["Temperance", "Weaver", "Scale", "The World"],
};

