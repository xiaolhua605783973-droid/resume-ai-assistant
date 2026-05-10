import { NextResponse } from "next/server";

import type { TaskDraft } from "@/lib/mvp-types";
import { readTaskRecord, updateTaskDraft } from "@/server/task-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { taskId } = await context.params;
  const task = await readTaskRecord(taskId);

  if (!task) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { taskId } = await context.params;
  const body = (await request.json()) as { draft?: TaskDraft };

  if (!body.draft) {
    return NextResponse.json({ message: "Draft payload is required." }, { status: 400 });
  }

  const task = await updateTaskDraft(taskId, body.draft);

  if (!task) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  return NextResponse.json({ task });
}
