import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/tasks/update/route";

describe("tasks update route", () => {
  it("rejects invalid payloads before updating persistence", async () => {
    const request = new Request("http://localhost:3000/api/tasks/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: "",
        completed: "yes",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(String(payload.error)).toContain("String must contain at least 1 character");
  });
});
