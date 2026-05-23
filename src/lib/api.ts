import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      error: message,
    },
    { status },
  );
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return error.issues
      .map((issue) => {
        const field = issue.path.length > 0 ? String(issue.path[0]) : "request";
        const message = issue.message === "Required" ? "is required" : issue.message;
        return `${field}: ${message}`;
      })
      .join("; ");
  }

  if (error instanceof SyntaxError) {
    return "Invalid JSON payload.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
