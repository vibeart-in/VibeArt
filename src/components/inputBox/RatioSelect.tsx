import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export function RatioSelect() {
  return (
    <div className="ml-2 flex flex-col items-center justify-center gap-4">
      <p className="text-sm font-medium tracking-wide text-gray-300">Aspect Ratio</p>
      <Select>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Select an Ratio" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Ratios</SelectLabel>
            <SelectItem value="1:1">1:1 (Square)</SelectItem>
            <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
            <SelectItem value="3:4">3:4</SelectItem>
            <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
            <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
