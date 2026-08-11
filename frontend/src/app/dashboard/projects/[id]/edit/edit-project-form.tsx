"use client";

import { useActionState } from "react";

import { updateProject } from "../../actions";
import { ProjectFormFields } from "../../project-form-fields";
import type { Project } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EditProjectForm({ project }: { project: Project }) {
  const [state, formAction, pending] = useActionState(
    updateProject.bind(null, project.id),
    undefined,
  );

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Edit Project</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <ProjectFormFields defaultValues={project} />
          {state?.error && <p className="text-sm text-error">{state.error}</p>}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" variant="brief-primary" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
