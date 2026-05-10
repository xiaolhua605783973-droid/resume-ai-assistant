import { NextResponse } from "next/server";

import { parseResumeToDraft, extractResumeText } from "@/server/resume-parser";
import { readTaskRecord, saveTaskRecord } from "@/server/task-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { taskId } = await context.params;
  const task = await readTaskRecord(taskId);

  if (!task) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Resume file is required." }, { status: 400 });
  }

  try {
    const content = await extractResumeText(file);
    const parsedDraft = parseResumeToDraft(content, task.draft);
    const nextTask = await saveTaskRecord({
      ...task,
      draft: parsedDraft,
    });

    return NextResponse.json({ task: nextTask, parsedPreview: content.slice(0, 600) });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Resume parse failed.",
      },
      { status: 400 },
    );
  }
}