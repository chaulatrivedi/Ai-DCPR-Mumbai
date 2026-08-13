import { beforeEach, describe, expect, it, vi } from "vitest";

// Task A fix: signIn() used to hardcode redirect("/dashboard"), ignoring the
// next= query param proxy.ts sets when bouncing an unauthenticated user away
// from a protected route. That extra unnecessary hop (dashboard, then click
// through to the originally-requested page again) was the window in which
// Next.js's router race ("An unexpected response was received from the
// server") was observed on /dashboard/profile — see SESSION_LOG.md.
const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({ redirect: (...args: unknown[]) => redirectMock(...args) }));

const signInWithPasswordMock = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { signInWithPassword: (...args: unknown[]) => signInWithPasswordMock(...args) },
  }),
}));

import { signIn } from "../actions";

function loginFormData(fields: Record<string, string>) {
  const formData = new FormData();
  formData.set("email", fields.email ?? "test@example.com");
  formData.set("password", fields.password ?? "password123");
  if (fields.next !== undefined) formData.set("next", fields.next);
  return formData;
}

describe("signIn redirect target", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  it("redirects to the requested next path on success", async () => {
    await signIn(undefined, loginFormData({ next: "/dashboard/profile" }));
    expect(redirectMock).toHaveBeenCalledWith("/dashboard/profile");
  });

  it("defaults to /dashboard when no next is given", async () => {
    await signIn(undefined, loginFormData({}));
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects an absolute URL next value (open-redirect guard)", async () => {
    await signIn(undefined, loginFormData({ next: "https://evil.example/phish" }));
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects a protocol-relative next value (open-redirect guard)", async () => {
    await signIn(undefined, loginFormData({ next: "//evil.example" }));
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("does not redirect at all when sign-in fails", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({ error: { message: "Invalid credentials" } });
    const state = await signIn(undefined, loginFormData({ next: "/dashboard/profile" }));
    expect(state).toEqual({ error: "Invalid credentials" });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
