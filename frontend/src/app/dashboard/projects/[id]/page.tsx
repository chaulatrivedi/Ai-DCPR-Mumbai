import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IncompleteBadge } from "@/components/ui/incomplete-badge";
import { getProject, isProjectComplete } from "@/lib/projects";
import { ActionToast } from "./action-toast";
import { DeleteProjectButton } from "./delete-project-button";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-section-label uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="text-body text-ink">{value}</p>
    </div>
  );
}

export default async function ProjectPage({
  params,
}: PageProps<"/dashboard/projects/[id]">) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <ActionToast />
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-page-heading font-semibold text-ink">{project.name}</h1>
            {!isProjectComplete(project) && <IncompleteBadge />}
          </div>
          <p className="text-page-subheading text-muted-foreground">
            {project.occupancy_type}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Button variant="brief-secondary">Edit</Button>
          </Link>
          <DeleteProjectButton projectId={project.id} />
        </div>
      </div>

      <Card className="grid max-w-xl grid-cols-2 gap-4">
        <Field label="Project Name" value={project.name} />
        <Field label="Occupancy Type" value={project.occupancy_type} />
        <Field label="Plot Area" value={`${project.plot_area} sq.m`} />
        <Field
          label="Road Width"
          value={project.road_width !== null ? `${project.road_width} m` : "—"}
        />
        <Field label="Zoning" value={project.zoning ?? "—"} />
      </Card>

      <Card className="max-w-xl">
        <p className="text-card-title font-medium text-ink">Timeline</p>
        <div className="flex flex-col gap-2 text-muted-body text-muted-foreground">
          <p>Created {new Date(project.created_at).toLocaleString()}</p>
          <p>Last updated {new Date(project.updated_at).toLocaleString()}</p>
        </div>
      </Card>
    </div>
  );
}
