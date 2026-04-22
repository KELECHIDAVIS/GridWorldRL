import React from 'react';
import { Slider } from '@mui/material';

interface LabeledSliderProps {
  title: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (newValue: number) => void;
  color?: string; 
  disabled:boolean 
}

export const LabeledSlider: React.FC<LabeledSliderProps> = ({
  title,
  value,
  min,
  max,
  step = 1,
  onChange,
  color = 'var(--color-accent)', // Uses your global accent variable
  disabled
}) => {
  return (
    <div className="w-full mb-6">
      {/* Top Row: Simple divs inherit your index.css font settings */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-[0.85rem]  uppercase tracking-wider opacity-95">
          {title}
        </span>
        <span className="font-mono font-bold" style={{ color: color }}>
          {value.toFixed(step < 1 ? 2 : 0)} 
        </span>
      </div>

      {/* Bottom Row: The Slider */}
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, newValue) => onChange(newValue as number)}
        disabled = {disabled}
        sx={{
          color: color,
          padding: '13px 0', // MUI default padding
          '& .MuiSlider-thumb': {
            height: 14,
            width: 14,
            borderRadius: '2px', // Sharper square-ish look to match the "Book" feel
            '&:hover': {
              boxShadow: '0 0 0 8px var(--color-accent-glow)',
            },
          },
          '& .MuiSlider-rail': {
            opacity: 0.2,
            backgroundColor: 'var(--color-theme-text)',
          },
          '& .MuiSlider-track': {
            border: 'none',
          },
        }}
      />
    </div>
  );
};