import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { IncompleteBadge } from "@/components/ui/incomplete-badge";
import { isProjectComplete, listProjects } from "@/lib/projects";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-heading font-semibold text-ink">Projects</h1>
          <p className="text-page-subheading text-muted-foreground">
            {projects.length === 0
              ? "You haven't created any projects yet."
              : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/projects/trash">
            <Button variant="brief-secondary">Trash</Button>
          </Link>
          <Link href="/dashboard/projects/new">
            <Button variant="brief-primary">New Project</Button>
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <p className="text-muted-body text-muted-foreground">
            Create your first project to get started.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="h-full transition-colors hover:border-terracotta">
                <div className="flex items-center gap-2">
                  <CardTitle>{project.name}</CardTitle>
                  {!isProjectComplete(project) && <IncompleteBadge />}
                </div>
                <p className="text-muted-body text-muted-foreground">
                  {project.occupancy_type} · {project.plot_area} sq.m
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
