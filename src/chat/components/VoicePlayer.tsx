import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "../utils/cn";

/** Deterministic fake waveform bars from an id */
function barsFor(seed: number, count = 28): number[] {
  const out: number[] = [];
  let x = seed % 9999;
  for (let i = 0; i < count; i++) {
    x = (x * 9301 + 49297) % 233280;
    const v = (x / 233280) * 0.7 + 0.3;
    // emphasis near the middle
    const t = i / count;
    const env = 1 - Math.abs(t - 0.45) * 0.9;
    out.push(Math.max(0.2, Math.min(1, v * env)));
  }
  return out;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return `${String(m).replace(/\d/g, (d) => map[+d])}:${String(s).padStart(2, "0").replace(/\d/g, (d) => map[+d])}`;
}

export default function VoicePlayer({
  url,
  duration,
  seed,
  mine,
}: {
  url?: string;
  duration: number;
  seed: number;
  mine: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bars = useRef(barsFor(seed));

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggle = () => {
    if (!url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.ontimeupdate = () => {
        const a = audioRef.current!;
        setProgress(a.currentTime / (a.duration || duration || 1));
        setElapsed(a.currentTime);
      };
      audioRef.current.onended = () => {
        setPlaying(false);
        setProgress(0);
        setElapsed(0);
      };
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 py-0.5">
      <button
        onClick={toggle}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-transform active:scale-90",
          mine ? "bg-white/25 hover:bg-white/30" : "bg-brand-500 hover:bg-brand-600"
        )}
      >
        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
      </button>

      <div className="flex flex-1 items-center gap-2">
        <div className="flex h-8 flex-1 items-center gap-[2px]">
          {bars.current.map((h, i) => {
            const active = i / bars.current.length <= progress;
            return (
              <span
                key={i}
                className={cn(
                  "w-[3px] rounded-full transition-colors",
                  mine
                    ? active
                      ? "bg-white"
                      : "bg-white/40"
                    : active
                      ? "bg-brand-500"
                      : "bg-slate-300 dark:bg-slate-600"
                )}
                style={{ height: `${Math.round(h * 100)}%` }}
              />
            );
          })}
        </div>
        <span
          className={cn(
            "shrink-0 text-xs tabular-nums",
            mine ? "text-white/80" : "text-slate-500 dark:text-slate-400"
          )}
        >
          {fmt(playing || elapsed ? elapsed : duration)}
        </span>
      </div>
    </div>
  );
}
