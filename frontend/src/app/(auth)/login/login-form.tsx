"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signIn } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  initialError,
  next,
}: {
  initialError?: string;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(signIn, undefined);
  const error = state?.error ?? initialError;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>
          Enter your email and password to continue.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in..." : "Log in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
