import Link from "next/link";

import { restoreProject } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { listTrashedProjects } from "@/lib/projects";

export default async function TrashPage() {
  const projects = await listTrashedProjects();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-heading font-semibold text-ink">Trash</h1>
          <p className="text-page-subheading text-muted-foreground">
            Deleted projects are kept here and can be restored.
          </p>
        </div>
        <Link href="/dashboard/projects">
          <Button variant="brief-secondary">Back to Projects</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <p className="text-muted-body text-muted-foreground">Trash is empty.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{project.name}</CardTitle>
                <p className="text-muted-body text-muted-foreground">
                  {project.occupancy_type} · deleted{" "}
                  {new Date(project.deleted_at as string).toLocaleDateString()}
                </p>
              </div>
              <form action={restoreProject.bind(null, project.id)}>
                <Button type="submit" variant="brief-primary">
                  Restore
                </Button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
