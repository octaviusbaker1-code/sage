import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Download, Upload, Trash2, FolderOpen } from "lucide-react";
import type { ReadingState } from "@/lib/reading-engine";

export type ArchiveEntry = {
  id: string;
  savedAt: string;
  question: string;
  reading: ReadingState;
};

type ArchiveViewProps = {
  entries: ArchiveEntry[];
  onLoad: (entry: ArchiveEntry) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function formatCore(entry: ArchiveEntry) {
  if (!entry.reading.core?.name) return "—";
  return `${entry.reading.core.name}${entry.reading.core.reversed ? " reversed" : ""}`;
}

function formatCompletion(entry: ArchiveEntry) {
  const positions = Object.values(entry.reading.positions);
  const completed = positions.filter((p) => {
    return [p.arcana?.name, p.mask?.name, p.shield?.name].filter(Boolean).length === 3;
  }).length;

  return `${completed}/4 chambers`;
}

export default function ArchiveView({
  entries,
  onLoad,
  onDelete,
  onExport,
  onImport,
}: ArchiveViewProps) {
  return (
    <Card className="min-h-[78vh] rounded-[1.75rem] border border-amber-200/12 bg-stone-950/90 shadow-2xl">
      <CardHeader className="border-b border-amber-200/10 pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl text-amber-100 md:text-3xl">
            <Archive className="h-6 w-6 text-amber-300" />
            Reading Archive
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onExport}
              className="rounded-xl bg-stone-200 px-4 py-2 text-stone-950 hover:bg-stone-300"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <label className="inline-flex cursor-pointer items-center rounded-xl bg-amber-200/10 px-4 py-2 text-sm text-amber-100 hover:bg-amber-200/20">
              <Upload className="mr-2 h-4 w-4" />
              Import
              <input type="file" accept="application/json" className="hidden" onChange={onImport} />
            </label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="bg-stone-950/70 pb-6 pt-6">
        <ScrollArea className="h-[72vh] pr-2 md:pr-4">
          <div className="space-y-4">
            {entries.length === 0 && (
              <div className="rounded-xl border border-amber-200/10 bg-stone-900/80 p-6 text-center text-stone-400">
                No saved readings yet.
              </div>
            )}

            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-amber-200/12 bg-stone-900/85 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
              >
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="font-semibold text-amber-100">
                      {entry.question || "Untitled reading"}
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      {new Date(entry.savedAt).toLocaleString()}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge className="rounded-lg border border-amber-200/15 bg-amber-200/10 px-3 py-1 text-amber-100">
                        Core Six: {formatCore(entry)}
                      </Badge>
                      <Badge className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-1 text-stone-200">
                        {formatCompletion(entry)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => onLoad(entry)}
                      className="rounded-xl bg-amber-200/10 px-4 py-2 text-amber-100 hover:bg-amber-200/20"
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Load
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onDelete(entry.id)}
                      className="rounded-xl bg-stone-900 px-4 py-2 text-stone-300 hover:bg-stone-800 hover:text-red-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                {entry.reading.notes && (
                  <div className="rounded-lg border border-stone-800 bg-stone-950/70 px-4 py-3 text-sm leading-7 text-stone-300">
                    {entry.reading.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
