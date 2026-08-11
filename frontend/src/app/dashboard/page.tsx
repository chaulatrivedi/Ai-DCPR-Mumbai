import { listProjects } from "@/lib/projects";
import { ProjectsWidget } from "./projects-widget";
import { RecentCalculationsWidget, RecentChatsWidget } from "./recent-activity-widgets";

export default async function DashboardHomePage() {
  const projects = await listProjects();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-page-heading font-semibold text-ink">Home</h1>
        <p className="text-page-subheading text-muted-foreground">
          A summary of your work.
        </p>
      </div>

      <ProjectsWidget projects={projects} />
      <RecentChatsWidget />
      <RecentCalculationsWidget />
    </div>
  );
}
