"use client";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  initialValue?: number;
  min?: number;
  max?: number;
  incrementStep?: number;
  onChange?: (value: number) => void;
}

const AnimatedCounter = ({
  initialValue = 1,
  min = 0,
  max = 10,
  incrementStep = 1,
  onChange = () => {},
}: AnimatedCounterProps) => {
  const [count, setCount] = useState<number>(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setCount(initialValue);
  }, [initialValue]);

  const getDecimalPlaces = (value: number): number => {
    if (Math.floor(value) === value) return 0;
    return value.toString().split(".")[1]?.length || 0;
  };

  const decimalPlaces = getDecimalPlaces(incrementStep);

  const handleIncrement = () => {
    const newValue = parseFloat((count + incrementStep).toFixed(decimalPlaces));

    if (newValue <= max) {
      setIsAnimating(true);
      setCount(newValue);
      onChange(newValue);
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  const handleDecrement = () => {
    const newValue = parseFloat((count - incrementStep).toFixed(decimalPlaces));

    if (newValue >= min) {
      setIsAnimating(true);
      setCount(newValue);
      onChange(newValue);
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  const displayValue = count.toFixed(decimalPlaces);

  return (
    <div className="ml-2 flex flex-col items-center justify-center gap-4">
      <div className="relative flex h-8 w-16 items-center justify-center rounded-xl border border-accent bg-[#131312] p-1 text-sm transition-all duration-300">
        {/* Minus Button */}
        <button
          onClick={handleDecrement}
          disabled={count <= min}
          className={`flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200 ease-out ${
            count <= min
              ? "cursor-not-allowed text-gray-600 opacity-50"
              : "cursor-pointer text-accent hover:scale-110 hover:text-white active:scale-95"
          } `}
        >
          <Minus size={12} strokeWidth={2.5} />
        </button>

        {/* Counter Display */}
        <div
          className={`mx-1 flex h-full w-full items-center justify-center rounded-md text-[12px] font-semibold text-accent transition-all duration-200 ease-out ${isAnimating ? "scale-110 bg-[#404040] shadow-lg" : "scale-100"} `}
        >
          <span
            className={`transition-all duration-300 ease-out ${isAnimating ? "scale-125 transform" : "scale-100 transform"} `}
          >
            {/* Display the formatted value */}
            {displayValue}
          </span>
        </div>

        {/* Plus Button */}
        <button
          onClick={handleIncrement}
          disabled={count >= max}
          className={`flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200 ease-out ${
            count >= max
              ? "cursor-not-allowed text-gray-600 opacity-50"
              : "cursor-pointer text-accent hover:scale-110 hover:text-white active:scale-95"
          } `}
        >
          <Plus size={12} strokeWidth={2.5} />
        </button>

        {isAnimating && (
          <div className="pointer-events-none absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-accent/20 to-accent/10" />
        )}
      </div>
    </div>
  );
};

export default AnimatedCounter;
