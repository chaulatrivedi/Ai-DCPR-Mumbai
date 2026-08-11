"use client";

import { useActionState } from "react";

import { createProject } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputWithUnit } from "@/components/ui/input-with-unit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { OCCUPANCY_TYPES } from "@/lib/occupancy-types";

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState(createProject, undefined);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New Project</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="occupancyType">Occupancy Type</Label>
            <SelectNative id="occupancyType" name="occupancyType" required defaultValue="">
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="plotArea">Plot Area</Label>
            <InputWithUnit
              id="plotArea"
              name="plotArea"
              type="number"
              step="any"
              min="0"
              unit="sq.m"
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
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="zoning">Zoning (optional)</Label>
            <Input id="zoning" name="zoning" />
          </div>

          {state?.error && (
            <p className="text-sm text-error">{state.error}</p>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" variant="brief-primary" disabled={pending}>
            {pending ? "Creating..." : "Create Project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
