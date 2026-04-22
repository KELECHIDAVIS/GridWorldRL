import React from "react";
import { Algorithm, type AlgorithmType } from "../types";

// 1. Define the Interface for your props
export interface RadioCardProps<T> {
  label: string;
  description: string;
  value: T; // Use the Type here
  selectedValue: T;
  onChange: (value: T) => void;
  name: string;
  disabled?: boolean;
}

// 2. Use the Interface in the component definition
export function RadioCard<T extends string | number>({
  label,
  description,
  value,
  selectedValue,
  onChange,
  name,
  disabled,
}: RadioCardProps<T>) {
  const isSelected = value === selectedValue;

  return (
    <label
      className={`group relative block ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        disabled={disabled}
        className="peer sr-only"
      />

      <div
        className={`
    p-4 rounded-lg border-2 transition-all duration-200
    bg-theme-panel border-theme-border text-theme-text
    peer-checked:border-accent
    peer-checked:bg-[var(--color-accent-glow)]
    peer-checked:shadow-[0_0_15px_var(--color-accent-glow)]
    ${
      disabled
        ? "opacity-40 pointer-events-none"
        : "opacity-70 group-hover:opacity-100 group-hover:border-theme-text/30 peer-checked:opacity-100"
    }
  `}
      >
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight">{label}</span>
          <span className="text-sm opacity-60 italic">{description}</span>
        </div>
      </div>

      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
          <span className="text-xs font-semibold text-theme-text/50 tracking-widest uppercase">
            Locked
          </span>
        </div>
      )}

      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-sky-400 opacity-0 peer-checked:opacity-100 transition-opacity" />
    </label>
  );
}

export default RadioCard;
