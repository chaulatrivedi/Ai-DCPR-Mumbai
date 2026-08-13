"use client";

import { useState } from "react";

import { InputWithUnit } from "@/components/ui/input-with-unit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { OCCUPANCY_TYPES } from "@/lib/occupancy-types";
import { USE_MIX_OPTIONS } from "@/lib/use-mix";
import type { Project } from "@/lib/projects";

// Shared by NewProjectForm and EditProjectForm — same field spec
// (Task 3.1), just with/without existing values to pre-populate.
export function ProjectFormFields({
  defaultValues,
}: {
  defaultValues?: Partial<Project>;
}) {
  // Tracks the live select value (not just defaultValues) so Use Mix
  // appears/disappears as the user changes Occupancy Type, not only on
  // initial render.
  const [occupancyType, setOccupancyType] = useState(
    defaultValues?.occupancy_type ?? "",
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Project Name</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="occupancyType">Occupancy Type</Label>
        <SelectNative
          id="occupancyType"
          name="occupancyType"
          required
          defaultValue={defaultValues?.occupancy_type ?? ""}
          onChange={(e) => setOccupancyType(e.target.value)}
        >
          <option value="" disabled>
            Select occupancy type
          </option>
          {OCCUPANCY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </SelectNative>
      </div>

      {occupancyType === "Mixed-Use" && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink">Use Mix (optional)</legend>
          <div className="flex flex-col gap-1.5">
            {USE_MIX_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-[14px] text-ink"
              >
                <input
                  type="checkbox"
                  name="useMix"
                  value={option}
                  defaultChecked={defaultValues?.use_mix?.includes(option) ?? false}
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="plotArea">Plot Area</Label>
        <InputWithUnit
          id="plotArea"
          name="plotArea"
          type="number"
          step="any"
          min="0"
          unit="sq.m"
          defaultValue={defaultValues?.plot_area ?? undefined}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="roadWidth">Road Width (optional)</Label>
        <InputWithUnit
          id="roadWidth"
          name="roadWidth"
          type="number"
          step="any"
          min="0"
          unit="m"
          defaultValue={defaultValues?.road_width ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="zoning">Zoning (optional)</Label>
        <Input id="zoning" name="zoning" defaultValue={defaultValues?.zoning ?? undefined} />
      </div>
    </>
  );
}
