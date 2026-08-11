import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { IncompleteBadge } from "@/components/ui/incomplete-badge";
import { isProjectComplete, type Project } from "@/lib/projects";

// Pure presentational component so the "reflects real project count /
// empty state" behavior (M2 Home page DoD) is unit-testable without a
// live Supabase-backed Server Component render.
export function ProjectsWidget({ projects }: { projects: Project[] }) {
  const recent = projects.slice(0, 4);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-card-title font-medium text-ink">Projects</h2>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/projects"
            className="text-muted-body text-muted-foreground hover:text-ink"
          >
            View all
          </Link>
          <Link href="/dashboard/projects/new">
            <Button variant="brief-primary">New Project</Button>
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <p className="text-muted-body text-muted-foreground">
            You don&apos;t have any projects yet. Create your first one to get started.
          </p>
        </Card>
      ) : (
        <>
          <p className="text-muted-body text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="h-full transition-colors hover:border-terracotta">
                  <div className="flex items-center gap-2">
                    <CardTitle>{project.name}</CardTitle>
                    {!isProjectComplete(project) && <IncompleteBadge />}
                  </div>
                  <p className="text-muted-body text-muted-foreground">
                    {project.occupancy_type}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
