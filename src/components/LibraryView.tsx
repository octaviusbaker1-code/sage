import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Library, Search } from "lucide-react";

export type LibraryItem = {
  name: string;
  category: "Arcana" | "Mask" | "Shield" | "Core Six";
  meaning: string;
  reversed?: string;
};

type LibraryViewProps = {
  items: LibraryItem[];
};

export default function LibraryView({ items }: LibraryViewProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.category.toLowerCase().includes(normalized) ||
        item.meaning.toLowerCase().includes(normalized) ||
        item.reversed?.toLowerCase().includes(normalized)
      );
    });
  }, [items, query]);

  return (
    <Card className="min-h-[78vh] rounded-[1.75rem] border border-amber-200/12 bg-stone-950/90 shadow-2xl">
      <CardHeader className="border-b border-amber-200/10 pb-5">
        <CardTitle className="flex items-center gap-3 text-2xl text-amber-100 md:text-3xl">
          <Library className="h-6 w-6 text-amber-300" />
          Codex Library
        </CardTitle>
      </CardHeader>

      <CardContent className="bg-stone-950/70 pb-6 pt-6">
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards, categories, or meanings..."
            className="w-full border border-amber-200/12 bg-stone-900 pl-10 text-stone-100"
          />
        </div>

        <ScrollArea className="h-[72vh] pr-2 md:pr-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((item) => (
              <div
                key={`${item.category}-${item.name}`}
                className="rounded-xl border border-amber-200/12 bg-stone-900/85 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="font-semibold text-amber-100">{item.name}</div>
                  <Badge className="rounded-lg border border-amber-200/15 bg-amber-200/10 px-3 py-1 text-amber-100">
                    {item.category}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm leading-7 text-stone-300">
                  <div className="rounded-lg border border-stone-800 bg-stone-950/70 px-3 py-3">
                    <span className="text-stone-500">Upright:</span> {item.meaning}
                  </div>

                  <div className="rounded-lg border border-stone-800 bg-stone-950/70 px-3 py-3">
                    <span className="text-stone-500">Reversed:</span> {item.reversed || "No reversed meaning listed."}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-amber-200/10 bg-stone-900/80 p-6 text-center text-stone-400">
                No library entries match that search.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
