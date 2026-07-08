'use client';

const MOODS = ['😊', '😐', '😢', '😡', '🔥'];
const WEATHERS = ['☀️', '⛅', '🌧️', '❄️', '🌩️'];

type DayMetaProps = {
  date: string;
  mood: string | null;
  weather: string | null;
  onMoodChange: (v: string) => void;
  onWeatherChange: (v: string) => void;
};

export default function DayMeta({
  date,
  mood,
  weather,
  onMoodChange,
  onWeatherChange,
}: DayMetaProps) {
  return (
    <div className="contents">
      <div className="border border-border rounded-base px-2 h-7 flex items-center">
        <p className="text-sm text-foreground/90 whitespace-nowrap shrink-0">{date}</p>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      <div className="flex items-center gap-1">
        {WEATHERS.map((w) => (
          <button
            key={w}
            onClick={() => onWeatherChange(weather === w ? '' : w)}
            className={`w-7 h-7 text-base rounded-base flex items-center justify-center leading-none pt-0.5 transition-all ${
              weather === w
                ? 'opacity-100 bg-main'
                : 'opacity-40 hover:opacity-80'
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      <div className="flex items-center gap-1">
        {MOODS.map((m) => (
          <button
            key={m}
            onClick={() => onMoodChange(mood === m ? '' : m)}
            className={`w-7 h-7 text-base rounded-base flex items-center justify-center leading-none pt-0.5 transition-all ${
              mood === m
                ? 'opacity-100 bg-main'
                : 'opacity-40 hover:opacity-80'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
