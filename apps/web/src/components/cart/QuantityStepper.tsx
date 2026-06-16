import { Minus, Plus } from "lucide-react";
import React from "react";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
};

export function QuantityStepper({ value, onChange, max }: QuantityStepperProps) {
  function handleDecrease() {
    if (value > 1) {
      onChange(value - 1);
    }
  }

  function handleIncrease() {
    if (!max || value < max) {
      onChange(value + 1);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(event.target.value, 10);
    if (!isNaN(val)) {
      if (val < 1) {
        onChange(1);
      } else if (max && val > max) {
        onChange(max);
      } else {
        onChange(val);
      }
    } else {
       // if empty, let it be handled or just default to 1
       // Usually we might let empty string exist in a local state and sync on blur, 
       // but for simplicity, default to 1 if NaN
       onChange(1);
    }
  }

  return (
    <div className="flex h-11 items-center rounded-md border border-brand-coffee/20 bg-white">
      <button
        type="button"
        className="flex h-full w-10 items-center justify-center text-brand-coffee/70 transition-colors hover:bg-brand-coffee/5 hover:text-brand-coffee disabled:opacity-50"
        onClick={handleDecrease}
        disabled={value <= 1}
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        min={1}
        max={max}
        className="h-full w-14 border-x border-brand-coffee/10 bg-transparent text-center font-medium text-brand-coffee outline-none focus:ring-2 focus:ring-brand-mustard/50"
        value={value}
        onChange={handleChange}
      />
      <button
        type="button"
        className="flex h-full w-10 items-center justify-center text-brand-coffee/70 transition-colors hover:bg-brand-coffee/5 hover:text-brand-coffee disabled:opacity-50"
        onClick={handleIncrease}
        disabled={Boolean(max && value >= max)}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
