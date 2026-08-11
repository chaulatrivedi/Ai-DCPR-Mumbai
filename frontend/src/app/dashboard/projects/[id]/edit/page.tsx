import { notFound } from "next/navigation";

import { getProject } from "@/lib/projects";
import { EditProjectForm } from "./edit-project-form";

export default async function EditProjectPage({
  params,
}: PageProps<"/dashboard/projects/[id]/edit">) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-page-heading font-semibold text-ink">Edit Project</h1>
        <p className="text-page-subheading text-muted-foreground">{project.name}</p>
      </div>
      <EditProjectForm project={project} />
    </div>
  );
}
