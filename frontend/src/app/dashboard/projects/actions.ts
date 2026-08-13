"use server";

import { redirect } from "next/navigation";

import { isOccupancyType } from "@/lib/occupancy-types";
import { isUseMixOption } from "@/lib/use-mix";
import { createClient } from "@/lib/supabase/server";

export type ProjectActionState = { error?: string } | undefined;

function parseRequiredFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const occupancyType = String(formData.get("occupancyType") ?? "").trim();
  const plotAreaRaw = String(formData.get("plotArea") ?? "").trim();

  if (!name) return { error: "Project name is required." } as const;
  if (!occupancyType || !isOccupancyType(occupancyType)) {
    return { error: "Select a valid occupancy type." } as const;
  }
  const plotArea = Number(plotAreaRaw);
  if (!plotAreaRaw || !Number.isFinite(plotArea) || plotArea <= 0) {
    return { error: "Plot area must be a positive number." } as const;
  }

  return { name, occupancyType, plotArea } as const;
}

function parseOptionalFields(formData: FormData) {
  const roadWidthRaw = String(formData.get("roadWidth") ?? "").trim();
  const zoning = String(formData.get("zoning") ?? "").trim();

  let roadWidth: number | null = null;
  if (roadWidthRaw) {
    roadWidth = Number(roadWidthRaw);
    if (!Number.isFinite(roadWidth) || roadWidth <= 0) {
      return { error: "Road width must be a positive number." } as const;
    }
  }

  return { roadWidth, zoning: zoning || null } as const;
}

// Use Mix is only meaningful (and only shown) when Occupancy Type is
// "Mixed-Use"; ignore any submitted selections otherwise, and stay
// optional even then (Task 3.1 follow-up spec).
function parseUseMix(formData: FormData, occupancyType: string): string[] | null {
  if (occupancyType !== "Mixed-Use") return null;

  const values = formData.getAll("useMix").map(String).filter(isUseMixOption);
  return values.length > 0 ? values : null;
}

export async function createProject(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const required = parseRequiredFields(formData);
  if ("error" in required) return required;

  const optional = parseOptionalFields(formData);
  if ("error" in optional) return optional;
  const useMix = parseUseMix(formData, required.occupancyType);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: required.name,
      occupancy_type: required.occupancyType,
      plot_area: required.plotArea,
      road_width: optional.roadWidth,
      zoning: optional.zoning,
      use_mix: useMix,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/dashboard/projects/${data.id}?created=true`);
}

export async function updateProject(
  id: string,
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const required = parseRequiredFields(formData);
  if ("error" in required) return required;

  const optional = parseOptionalFields(formData);
  if ("error" in optional) return optional;
  const useMix = parseUseMix(formData, required.occupancyType);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      name: required.name,
      occupancy_type: required.occupancyType,
      plot_area: required.plotArea,
      road_width: optional.roadWidth,
      zoning: optional.zoning,
      use_mix: useMix,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  // RLS silently filters out rows you don't own rather than erroring, so a
  // successful-but-empty response means "not yours" or "doesn't exist".
  if (!data) return { error: "Project not found." };

  redirect(`/dashboard/projects/${id}?updated=true`);
}

// Standing decision (TASKS-M2-M3-loop-goal.md): delete is soft — sets
// deleted_at rather than removing the row. Recoverable from Trash for a
// 30-day window (automatic purge after that is out of scope for M3 — see
// SESSION_LOG.md).
export async function softDeleteProject(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);

  redirect(`/dashboard/projects?deleted=true`);
}

export async function restoreProject(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("projects")
    .update({ deleted_at: null })
    .eq("id", id)
    .not("deleted_at", "is", null);

  redirect(`/dashboard/projects/${id}?restored=true`);
}
