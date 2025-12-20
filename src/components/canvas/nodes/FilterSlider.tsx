import React from 'react';
import { Slider } from '../../ui/slider';
import { LucideIcon } from 'lucide-react';

interface FilterSliderProps {
    label: string;
    icon: LucideIcon;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    defaultValue: number;
    unit?: string;
}

export default function FilterSlider({
    label,
    icon: Icon,
    value,
    onChange,
    min,
    max,
    defaultValue,
    unit = '%'
}: FilterSliderProps) {
    const isDefault = value === defaultValue;

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
                <span className={`text-sm font-mono ${isDefault ? 'text-gray-600' : 'text-white font-semibold'}`}>
                    {value}{unit}
                </span>
            </div>
            <Slider
                value={[value]}
                onValueChange={(vals) => onChange(vals[0])}
                min={min}
                max={max}
                step={1}
                className="w-full"
            />
        </div>
    );
}
