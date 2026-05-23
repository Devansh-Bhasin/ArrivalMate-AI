import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/profile/route";

describe("profile route", () => {
  it("rejects invalid onboarding payloads before touching the database", async () => {
    const request = new Request("http://localhost:3000/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "",
        city: "Surrey",
        selectedNeeds: [],
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(String(payload.error)).toContain("String must contain at least 2 character");
  });
});
