import { createClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  occupancy_type: string;
  plot_area: number;
  road_width: number | null;
  zoning: string | null;
  use_mix: string[] | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

// A project is "complete" once every field a user can fill has a value —
// Road Width and Zoning are the two left optional at creation (Task 3.6).
export function isProjectComplete(project: Project): boolean {
  return project.road_width !== null && project.zoning !== null;
}

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Project[];
}

export async function listTrashedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return data as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data as Project | null;
}
