import React from 'react';
import { Algorithm, type AlgorithmType } from '../types';


// 1. Define the Interface for your props
export interface RadioCardProps {
  label: string;
  description: string;
  value: AlgorithmType; // Use the Type here
  selectedValue: AlgorithmType;
  onChange: (value: AlgorithmType) => void; 
}

// 2. Use the Interface in the component definition
const RadioCard: React.FC<RadioCardProps> = ({ 
  label, 
  description, 
  value, 
  selectedValue, 
  onChange 
}) => {
  const isSelected = value === selectedValue;

  return (
    <label className="group relative cursor-pointer block">
      <input
        type="radio"
        name="rl-algo"
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="peer sr-only" 
      />

      <div className={`
        p-4 rounded-lg border-2 transition-all duration-200
        bg-theme-panel border-theme-border text-theme-text opacity-70
        peer-checked:opacity-100 peer-checked:border-sky-400 peer-checked:bg-sky-900/40 
        peer-checked:shadow-[0_0_15px_rgba(56,189,248,0.4)]
        group-hover:opacity-100 group-hover:border-theme-text/30
      `}>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight">{label}</span>
          <span className="text-sm opacity-60 italic">{description}</span>
        </div>
      </div>

      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-sky-400 opacity-0 peer-checked:opacity-100 transition-opacity" />
    </label>
  );
};

export default RadioCard;