import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Eye, KeyRound, TreePine } from "lucide-react";
import type { CardSlot, PositionKey, PositionState } from "@/lib/reading-engine";

type PositionMeta = Record<
  PositionKey,
  {
    subtitle: string;
    prompt: string;
    icon: React.ComponentType<{ className?: string }>;
  }
>;

type PositionCardProps = {
  name: PositionKey;
  value: PositionState;
  onChange: (next: PositionState) => void;
  arcana: string[];
  masks: string[];
  shields: string[];
};

const POSITION_META: PositionMeta = {
  Crown: {
    subtitle: "Governing Truth",
    prompt: "What truth governs the matter?",
    icon: Crown,
  },
  Witness: {
    subtitle: "Revelation",
    prompt: "What is being revealed?",
    icon: Eye,
  },
  Gateway: {
    subtitle: "Initiation",
    prompt: "What threshold is opening?",
    icon: KeyRound,
  },
  Root: {
    subtitle: "Becoming",
    prompt: "What is taking root beneath the surface?",
    icon: TreePine,
  },
};

function formatSlot(slot: CardSlot | undefined): string {
  if (!slot?.name) return "";
  return `${slot.name}${slot.reversed ? " reversed" : ""}`;
}

function chamberCompletion(value: PositionState): number {
  return [value.arcana?.name, value.mask?.name, value.shield?.name].filter(Boolean).length;
}

function ChamberPreview({ value }: { value: PositionState }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 text-xs">
      {[value.arcana?.name, value.mask?.name, value.shield?.name].filter(Boolean).length === 0 ? (
        <span className="text-stone-500">No selections yet.</span>
      ) : (
        <>
          {value.arcana?.name && (
            <Badge className="rounded-lg border border-amber-200/15 bg-amber-200/10 px-3 py-1 text-amber-100">
              {formatSlot(value.arcana)}
            </Badge>
          )}
          {value.mask?.name && (
            <Badge className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-1 text-stone-200">
              {formatSlot(value.mask)}
            </Badge>
          )}
          {value.shield?.name && (
            <Badge className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-1 text-stone-200">
              {formatSlot(value.shield)}
            </Badge>
          )}
        </>
      )}
    </div>
  );
}

function ReversalToggle({
  slot,
  label,
  onToggle,
}: {
  slot: CardSlot;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`mt-3 w-full rounded-lg border px-3 py-2 text-xs transition ${
        slot.name
          ? "border-amber-300/20 bg-stone-950 text-stone-300 hover:border-amber-300/40"
          : "border-stone-800 bg-stone-950/50 text-stone-600"
      }`}
      disabled={!slot.name}
    >
      {label}: {slot.reversed ? "Reversed" : "Upright"}
    </button>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-amber-200/12 bg-stone-900 px-3 py-2.5 text-sm text-stone-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
    >
      <option value="">{placeholder}</option>
      {options.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

export default function PositionCard({
  name,
  value,
  onChange,
  arcana,
  masks,
  shields,
}: PositionCardProps) {
  const meta = POSITION_META[name];
  const Icon = meta.icon;
  const completed = chamberCompletion(value) === 3;

  const updateSlotName = (key: keyof PositionState, nextName: string) =>
    onChange({
      ...value,
      [key]: { name: nextName, reversed: false },
    });

  const toggleReversal = (key: keyof PositionState) =>
    onChange({
      ...value,
      [key]: { ...value[key], reversed: !value[key].reversed },
    });

  return (
    <Card className="rounded-[1.5rem] border border-amber-200/12 bg-stone-950/80 text-stone-100 shadow-2xl">
      <CardHeader className="border-b border-amber-200/10 pb-4">
        <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/15 bg-amber-200/5">
            <Icon className="h-5 w-5 text-amber-300" />
          </div>
          <span>{name}</span>
          <Badge className="rounded-lg border border-amber-200/15 bg-amber-200/10 px-3 py-1 text-amber-200">
            {meta.subtitle}
          </Badge>
          {completed && (
            <Badge className="rounded-lg border border-emerald-300/15 bg-emerald-200/10 px-3 py-1 text-emerald-200">
              Complete
            </Badge>
          )}
        </CardTitle>
        <p className="mt-2 text-sm leading-7 text-stone-400">{meta.prompt}</p>
        <ChamberPreview value={value} />
      </CardHeader>

      <CardContent className="grid gap-5 p-5 md:grid-cols-3">
        <div className="rounded-xl border border-amber-200/10 bg-stone-900/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
          <div className="mb-2 text-xs uppercase tracking-[0.22em] text-stone-500">Arcana</div>
          <NativeSelect
            value={value.arcana?.name || ""}
            onChange={(v) => updateSlotName("arcana", v)}
            options={arcana}
            placeholder="Arcana"
          />
          <ReversalToggle slot={value.arcana} label="Arcana" onToggle={() => toggleReversal("arcana")} />
        </div>

        <div className="rounded-xl border border-amber-200/10 bg-stone-900/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
          <div className="mb-2 text-xs uppercase tracking-[0.22em] text-stone-500">Mask</div>
          <NativeSelect
            value={value.mask?.name || ""}
            onChange={(v) => updateSlotName("mask", v)}
            options={masks}
            placeholder="Mask"
          />
          <ReversalToggle slot={value.mask} label="Mask" onToggle={() => toggleReversal("mask")} />
        </div>

        <div className="rounded-xl border border-amber-200/10 bg-stone-900/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
          <div className="mb-2 text-xs uppercase tracking-[0.22em] text-stone-500">Shield</div>
          <NativeSelect
            value={value.shield?.name || ""}
            onChange={(v) => updateSlotName("shield", v)}
            options={shields}
            placeholder="Shield"
          />
          <ReversalToggle slot={value.shield} label="Shield" onToggle={() => toggleReversal("shield")} />
        </div>
      </CardContent>
    </Card>
  );
}
