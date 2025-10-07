import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export function QualitySelect() {
  return (
    <div className="ml-2 flex flex-col items-center justify-center gap-4">
      <p className="text-sm font-medium tracking-wide text-gray-300">Quality</p>
      <Select>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Quality" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Quality</SelectLabel>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
