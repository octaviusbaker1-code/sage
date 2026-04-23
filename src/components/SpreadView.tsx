import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const SPREAD_POSITIONS = [
  {
    name: "Crown",
    subtitle: "Governing Truth",
    prompt: "What truth governs the matter?",
  },
  {
    name: "Witness",
    subtitle: "Revelation",
    prompt: "What is being revealed?",
  },
  {
    name: "Gateway",
    subtitle: "Initiation",
    prompt: "What threshold is opening?",
  },
  {
    name: "Root",
    subtitle: "Becoming",
    prompt: "What is taking root beneath the surface?",
  },
] as const;

export default function SpreadView() {
  return (
    <Card className="rounded-[1.5rem] border border-amber-200/12 bg-stone-950/80 shadow-2xl">
      <CardHeader className="border-b border-amber-200/10 pb-4">
        <CardTitle className="flex items-center gap-2 text-amber-100">
          <BookOpen className="h-5 w-5 text-amber-300" />
          Official Spread Layout
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        {SPREAD_POSITIONS.map((position) => (
          <div
            key={position.name}
            className="rounded-xl border border-amber-200/12 bg-stone-900/75 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="font-semibold text-stone-100">{position.name}</div>
              <div className="text-sm text-amber-200">{position.subtitle}</div>
            </div>

            <p className="mb-4 text-sm leading-7 text-stone-400">{position.prompt}</p>

            <div className="grid grid-cols-3 gap-3">
              {["Arcana", "Mask", "Shield"].map((label) => (
                <div
                  key={label}
                  className="rounded-xl border border-amber-200/10 bg-stone-950/85 px-3 py-4 text-center text-sm text-stone-300"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-amber-300/20 bg-amber-200/5 p-4 text-center">
          <div className="mb-2 font-semibold text-amber-100">Core Six — Override</div>
          <div className="mx-auto max-w-sm rounded-xl border border-amber-300/20 bg-stone-950/90 px-3 py-4 text-sm text-stone-300">
            One Card Only
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
