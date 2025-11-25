type OnResult = (transcript: { interim: string; finals: string[] }) => void;
type OnError = (err: string) => void;

export type SpeechController = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  isRunning: () => boolean;
};

export function createSpeechRecognition(options?: {
  lang?: string;
  interim?: boolean;
  continuous?: boolean;
  autoRestart?: boolean;
  restartDelayMs?: number;
  onResult?: OnResult;
  onError?: OnError;
}): SpeechController | null {
  const lang = options?.lang || "vi-VN";
  const interim = options?.interim ?? true;
  const continuous = options?.continuous ?? true;
  const autoRestart = options?.autoRestart ?? false;
  const restartDelayMs = options?.restartDelayMs ?? 500;

  // Detect SpeechRecognition API
  const globalAny: any = typeof window !== "undefined" ? window : {};
  const SpeechRecognition = globalAny.SpeechRecognition || globalAny.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    options?.onError?.("Web Speech API is not supported in this browser.");
    return null;
  }

  const recog = new SpeechRecognition();
  recog.lang = lang;
  recog.interimResults = interim;
  recog.continuous = continuous;

  let running = false;
  let manualStop = false;
  let interimText = "";
  let finalSegments: string[] = [];

  // Keep track of the last processed result index to avoid re-processing
  let lastResultIndex = 0;

  recog.onresult = (ev: SpeechRecognitionEvent) => {
    interimText = "";
    const finalsThisEvent: string[] = [];

    // Process only results starting from ev.resultIndex to avoid duplicates
    const startIndex = typeof ev.resultIndex === "number" ? ev.resultIndex : lastResultIndex;
    for (let i = startIndex; i < ev.results.length; i++) {
      const res = ev.results[i];
      if (res.isFinal) {
        const txt = res[0].transcript.trim();
        if (txt) finalsThisEvent.push(txt);
      } else {
        interimText += res[0].transcript;
      }
    }

    // Update lastResultIndex for next event
    lastResultIndex = ev.results.length;

    // Append new finals without duplicating adjacent or highly-similar duplicates
    for (const seg of finalsThisEvent) {
      const normalized = seg.replace(/\s+/g, " ").trim();
      const last = finalSegments[finalSegments.length - 1];
      if (!last) {
        finalSegments.push(normalized);
        continue;
      }
      const lastNorm = last.replace(/\s+/g, " ").trim();
      // avoid exact duplicate or if new seg equals last trimmed or last contains new seg
      if (lastNorm === normalized) continue;
      if (lastNorm.endsWith(normalized) || normalized.endsWith(lastNorm)) continue;
      finalSegments.push(normalized);
    }

    options?.onResult?.({ interim: interimText, finals: [...finalSegments] });
  };

  recog.onerror = (ev: any) => {
    const msg = ev.error || ev.message || "Speech recognition error";
    options?.onError?.(msg.toString());
  };

  recog.onend = () => {
    running = false;
    options?.onResult?.({ interim: "", finals: [...finalSegments] });

    // Auto-restart behavior: if recognition ended unexpectedly (not manual stop)
    if (!manualStop && autoRestart) {
      try {
        setTimeout(() => {
          try {
            recog.start();
            running = true;
          } catch (e) {
            // ignore start errors
          }
        }, restartDelayMs);
      } catch (e) {
        // ignore
      }
    }
  };

  return {
    start() {
      try {
        manualStop = false;
        recog.start();
        running = true;
      } catch (e) {
        // start can throw if already started
      }
    },
    stop() {
      try {
        manualStop = true;
        recog.stop();
        running = false;
      } catch (e) {}
    },
    abort() {
      try {
        manualStop = true;
        recog.abort();
        running = false;
      } catch (e) {}
    },
    isRunning() {
      return running;
    },
  };
}

export default createSpeechRecognition;
