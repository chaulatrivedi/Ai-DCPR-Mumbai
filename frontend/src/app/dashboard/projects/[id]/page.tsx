import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProject } from "@/lib/projects";
import { ActionToast } from "./action-toast";

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
          <h1 className="text-page-heading font-semibold text-ink">{project.name}</h1>
          <p className="text-page-subheading text-muted-foreground">
            {project.occupancy_type}
          </p>
        </div>
        <Link href={`/dashboard/projects/${project.id}/edit`}>
          <Button variant="brief-secondary">Edit</Button>
        </Link>
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
    </div>
  );
}
