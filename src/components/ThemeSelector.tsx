import type { Theme } from "../types";

const themes: { id: Theme; label: string; swatch: string }[] = [
  { id: "white", label: "White", swatch: "white" },
  { id: "black", label: "Black", swatch: "black" },
  { id: "apple", label: "Apple Minimal", swatch: "apple" },
  { id: "glass", label: "Liquid Glass", swatch: "glass" },
];

interface Props {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export default function ThemeSelector({ theme, onChange }: Props) {
  return (
    <div className="theme-selector" role="group" aria-label="Card theme">
      {themes.map((option) => (
        <button
          key={option.id}
          className={`theme-option ${theme === option.id ? "selected" : ""}`}
          type="button"
          aria-pressed={theme === option.id}
          onClick={() => onChange(option.id)}
        >
          <span className={`theme-swatch swatch-${option.swatch}`} aria-hidden="true" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
