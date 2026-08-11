import { NewProjectForm } from "./new-project-form";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-page-heading font-semibold text-ink">New Project</h1>
        <p className="text-page-subheading text-muted-foreground">
          Start a project with the essentials — you can fill in the rest later.
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}
