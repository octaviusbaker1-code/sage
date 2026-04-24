import { useEffect, useMemo, useState } from "react";

type ResultsPanelProps = {
  result?: any;
  results?: any;
  reading?: any;
  title?: string;
  subtitle?: string;
  onClear?: () => void;
  className?: string;
};

function cleanText(value: any): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value;

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean).join("\n\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        const text = cleanText(val);
        return text ? `${label}: ${text}` : "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return "";
}

function ResultsPanel({
  result,
  results,
  reading,
  title = "Reading Results",
  subtitle = "Your Twelvefold Keeper interpretation will appear here.",
  onClear,
  className = "",
}: ResultsPanelProps) {
  const [isReading, setIsReading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const content = result ?? results ?? reading ?? null;

  const readableText = useMemo(() => {
    return cleanText(content).replace(/\s+/g, " ").trim();
  }, [content]);

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
    if (!readableText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(readableText);

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

  const hasContent = Boolean(readableText);

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
        <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4">
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-white/90 sm:text-base">
            {cleanText(content)}
          </pre>
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
