import { beforeEach, describe, expect, it, vi } from "vitest";

// Task B: the NavBar "Welcome, [name]" greeting is read once by the
// server-rendered dashboard layout, so saving a new display name has to
// revalidate that layout's cache for the greeting to update immediately
// (rather than only after a hard refresh) — see SESSION_LOG.md.
const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...args: unknown[]) => revalidatePathMock(...args) }));

const updateUserMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { updateUser: (...args: unknown[]) => updateUserMock(...args) },
  }),
}));

import { updateDisplayName } from "../actions";

function nameFormData(displayName: string) {
  const formData = new FormData();
  formData.set("displayName", displayName);
  return formData;
}

describe("updateDisplayName", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    updateUserMock.mockReset();
  });

  it("revalidates the dashboard layout on success, so NavBar's greeting refreshes", async () => {
    updateUserMock.mockResolvedValue({ error: null });

    const state = await updateDisplayName(undefined, nameFormData("Chaula T."));

    expect(updateUserMock).toHaveBeenCalledWith({ data: { display_name: "Chaula T." } });
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard", "layout");
    expect(state).toEqual({ success: "Saved." });
  });

  it("does not revalidate when Supabase rejects the update", async () => {
    updateUserMock.mockResolvedValue({ error: { message: "Network error" } });

    const state = await updateDisplayName(undefined, nameFormData("Chaula T."));

    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(state).toEqual({ error: "Network error" });
  });

  it("rejects an empty display name without calling Supabase", async () => {
    const state = await updateDisplayName(undefined, nameFormData("   "));

    expect(updateUserMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(state).toEqual({ error: "Display name is required." });
  });
});
