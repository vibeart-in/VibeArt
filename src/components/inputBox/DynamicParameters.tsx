"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import AnimatedCounter from "../ui/AnimatedCounter";
import { Input } from "../ui/input";
import {
  InputBoxParameter,
  NodeParam,
  SchemaParam,
} from "@/src/types/BaseType";
import { AnimatePresence, motion } from "motion/react";
import { IconTerminal } from "@tabler/icons-react";
import { Textarea } from "../ui/textarea";

interface DynamicParametersProps {
  parameters: InputBoxParameter[];
  onValuesChange: (values: Record<string, any> | NodeParam[]) => void;
  initialValues?: Record<string, any>;
}

const isSchemaStyle = (arr: InputBoxParameter[]) =>
  arr &&
  arr.length > 0 &&
  "type" in arr[0] &&
  "title" in (arr[0] as SchemaParam);

const parseFieldDataForEnum = (fieldData?: string): string[] | undefined => {
  if (!fieldData) return undefined;
  try {
    const parsed = JSON.parse(fieldData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      for (const item of parsed) {
        if (Array.isArray(item) && item.length > 0) {
          if (Array.isArray(item[0])) {
            const flattened = (item as any[])
              .flat(Infinity)
              .filter((s) => typeof s === "string");
            if (flattened.length) return flattened;
          } else {
            const strings = (item as any[]).filter(
              (s) => typeof s === "string"
            );
            if (strings.length) return strings;
          }
        }
      }
    }
    if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) {
      return parsed as string[];
    }
  } catch (e) {
    const cleaned = fieldData.trim();
    if (cleaned.includes("\n")) {
      return cleaned
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (cleaned.includes(",")) {
      return cleaned
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return undefined;
};

const DynamicParameters: React.FC<DynamicParametersProps> = ({
  parameters,
  onValuesChange,
  initialValues = {},
}) => {
  const schemaMode = useMemo(() => isSchemaStyle(parameters), [parameters]);

  /**
   * Normalize parameters into stable shape
   */
  const normalized = useMemo(() => {
    return parameters.map((p) => {
      if (schemaMode) {
        const s = p as SchemaParam;
        return {
          raw: p,
          key: s.title,
          label: s.title,
          type: s.type,
          enum: s.enum,
          default: s.default,
          description: s.description,
        };
      } else {
        const n = p as NodeParam;
        const enumOptions = parseFieldDataForEnum(n.fieldData);
        let inferredType = enumOptions ? "enum" : "string";
        if (!enumOptions) {
          if (n.fieldValue === "true" || n.fieldValue === "false")
            inferredType = "boolean";
          else if (!Number.isNaN(Number(n.fieldValue))) inferredType = "number";
        }
        return {
          raw: p,
          key: `${n.nodeId}:${n.fieldName}`,
          label: n.description || n.fieldName,
          type: inferredType,
          enum: enumOptions,
          default: n.fieldValue,
          nodeId: n.nodeId,
          fieldName: n.fieldName,
        };
      }
    });
  }, [parameters, schemaMode]);

  /**
   * Build initialState (object)
   */
  const initialState = useMemo(() => {
    const map: Record<string, any> = {};
    normalized.forEach((p) => {
      const provided = initialValues?.[p.key];
      if (provided !== undefined) {
        map[p.key] = provided;
      } else {
        map[p.key] = p.default ?? (p.type === "boolean" ? false : "");
      }
    });
    return map;
  }, [normalized, initialValues]);

  // JSON signature so we can compare initialState changes cheaply
  const initialStateJson = useMemo(
    () => JSON.stringify(initialState),
    [initialState]
  );

  // prev initialState signature
  const prevInitialStateJsonRef = useRef<string | null>(null);

  // Values state
  const [values, setValues] = useState<Record<string, any>>(initialState);

  // Re-init values only when initialState actually changed (deep compare via JSON)
  useEffect(() => {
    if (prevInitialStateJsonRef.current !== initialStateJson) {
      // parse back to object to avoid re-using the same reference
      try {
        setValues(JSON.parse(initialStateJson));
      } catch {
        setValues(initialState);
      }
      prevInitialStateJsonRef.current = initialStateJson;
    }
    // we intentionally do NOT include `values` in deps to avoid cycles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStateJson, parameters]);

  // Skip emitting on initial mount (avoids parent <-> child init loop)
  const didMountRef = useRef(false);

  // Whenever values change, call onValuesChange (but skip first mount)
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (schemaMode) {
      const out: Record<string, any> = {};
      normalized.forEach((p) => {
        out[p.key] = values[p.key];
      });
      onValuesChange(out);
    } else {
      const outNodes: NodeParam[] = (parameters as NodeParam[]).map((orig) => {
        const key = `${orig.nodeId}:${orig.fieldName}`;
        const newVal = values[key];
        return {
          ...orig,
          fieldValue:
            newVal === undefined || newVal === null
              ? orig.fieldValue
              : String(newVal),
        };
      });
      onValuesChange(outNodes);
    }
    // include onValuesChange in deps so linter is happy; parent should memoize it
  }, [values, schemaMode, parameters, normalized, onValuesChange]);

  const handleChange = (key: string, value: any) => {
    setValues((prev) => {
      // quick shallow check - if same, don't update (prevents extra renders)
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  };

  /**
   * Renderers
   */
  const renderControl = (p: any) => {
    if (p.enum && p.enum.length > 0) {
      const current = String(values[p.key] ?? p.default ?? p.enum[0]);
      return (
        <Select
          key={p.key}
          value={current}
          onValueChange={(v) => handleChange(p.key, v)}
        >
          <SelectTrigger className="w-full min-w-[110px]">
            <SelectValue placeholder={p.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{p.label}</SelectLabel>
              {p.enum.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }

    if (p.type === "boolean") {
      const checked = Boolean(
        values[p.key] ?? (p.default === "true" || p.default === true)
      );
      return (
        <div key={p.key} className="flex items-center gap-2">
          <Switch
            checked={checked}
            onCheckedChange={(v) => handleChange(p.key, v)}
          />
        </div>
      );
    }

    // number -> AnimatedCounter
    if (p.type === "number") {
      const initial = Number(values[p.key] ?? p.default ?? 1);
      return (
        <AnimatedCounter
          key={p.key}
          initialValue={initial}
          min={1}
          max={100}
          onChange={(val) => handleChange(p.key, Number(val))}
        />
      );
    }
  };

  const inputRender = () => {
    return (
      <div className="mt-2 flex z-20 flex-col items-center gap-2">
        <AnimatePresence>
          {normalized[0].label.toLowerCase() === "prompt" && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full"
            >
              <IconTerminal className="absolute top-2 left-4 text-white/80" />
              <Textarea
                value={normalized[0].default ?? ""}
                onChange={(e) => handleChange(normalized[0].key, e.target.value)}
                className="pl-12 hide-scrollbar min-w-[400px]"
                placeholder="A cute magical flying cat, cinematic, 4k"
                maxHeight={100}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* DESKTOP: Show parameters inline */}
        <div className="hidden md:flex flex-grow justify-center">
          {normalized.map((p) => renderControl(p))}
        </div>
      </div>
    );
  };

  console.log("NORMALIZED:", normalized);

  return (
    <div className="grid grid-cols-2 lg:flex lg:items-center justify-center gap-x-6 gap-y-4">
      {/* {normalized.map((p) => renderControl(p))} */}
      {inputRender()}
    </div>
  );
};

export default DynamicParameters;
