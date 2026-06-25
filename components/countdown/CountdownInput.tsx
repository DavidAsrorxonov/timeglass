type CountdownValue = {
  hours: number;
  minutes: number;
  seconds: number;
};

type CountdownInputProps = CountdownValue & {
  onChange: (value: CountdownValue) => void;
  disabled?: boolean;
};

const TIME_FIELDS = [
  { key: "hours", label: "Hours", shortLabel: "HH", max: 23 },
  { key: "minutes", label: "Minutes", shortLabel: "MM", max: 59 },
  { key: "seconds", label: "Seconds", shortLabel: "SS", max: 59 },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CountdownInput({
  hours,
  minutes,
  seconds,
  onChange,
  disabled = false,
}: CountdownInputProps) {
  const values = { hours, minutes, seconds };

  const updateValue = (key: keyof CountdownValue, value: string) => {
    const numberValue = Number.parseInt(value, 10);
    const max = key === "hours" ? 23 : 59;

    onChange({
      ...values,
      [key]: Number.isNaN(numberValue) ? 0 : clamp(numberValue, 0, max),
    });
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {TIME_FIELDS.map((field) => (
        <label key={field.key} className="block">
          <span className="mb-2 block text-center text-xs uppercase tracking-[0.25em] text-(--text-muted)">
            {field.label}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={field.max}
            step={1}
            value={values[field.key]}
            disabled={disabled}
            aria-label={field.label}
            onChange={(event) => updateValue(field.key, event.target.value)}
            className="glass-panel min-h-16 w-full px-2 py-3 text-center font-mono text-2xl text-foreground outline-none transition [appearance:textfield] focus:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-50 sm:text-3xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder={field.shortLabel}
          />
        </label>
      ))}
    </div>
  );
}
