import { useCallback, useEffect, useState } from "react";
import type { ReminderSettings as ReminderSettingsType } from "../../shared/types";
import { loadReminderSettings, saveReminderSettings } from "../../shared/storage";

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 15, 30, 45];

function to12Hour(hour24: number): { hour12: number; ampm: "AM" | "PM" } {
  if (hour24 === 0) return { hour12: 12, ampm: "AM" };
  if (hour24 === 12) return { hour12: 12, ampm: "PM" };
  return { hour12: hour24 % 12, ampm: hour24 > 12 ? "PM" : "AM" };
}

function to24Hour(hour12: number, ampm: "AM" | "PM"): number {
  if (ampm === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function ReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettingsType>({
    enabled: false,
    hour: 9,
    minute: 0,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadReminderSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const { hour12, ampm } = to12Hour(settings.hour);

  const update = useCallback(
    (patch: Partial<ReminderSettingsType>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      saveReminderSettings(next);
    },
    [settings],
  );

  if (!loaded) return null;

  return (
    <div className="border-t border-[var(--border)] pt-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--foreground)]">
          Daily Reminder
        </span>
        <button
          onClick={() => update({ enabled: !settings.enabled })}
          className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
            settings.enabled ? "bg-lc-orange" : "bg-[var(--border)]"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
              settings.enabled ? "translate-x-[18px]" : "translate-x-[2px]"
            }`}
          />
        </button>
      </div>

      <div className={`flex items-center gap-2 ${!settings.enabled ? "opacity-40 pointer-events-none" : ""}`}>
        <select
          value={hour12}
          onChange={(e) =>
            update({ hour: to24Hour(Number(e.target.value), ampm) })
          }
          className="rounded border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] px-2 py-1 cursor-pointer"
        >
          {HOURS_12.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <span className="text-sm text-[var(--muted)]">:</span>

        <select
          value={settings.minute}
          onChange={(e) => update({ minute: Number(e.target.value) })}
          className="rounded border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] px-2 py-1 cursor-pointer"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}
            </option>
          ))}
        </select>

        <select
          value={ampm}
          onChange={(e) =>
            update({ hour: to24Hour(hour12, e.target.value as "AM" | "PM") })
          }
          className="rounded border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] px-2 py-1 cursor-pointer"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}

export default ReminderSettings;
