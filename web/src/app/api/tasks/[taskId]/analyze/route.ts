import { NextResponse } from "next/server";

import { analyzeTaskWithProvider } from "@/server/external-analysis";
import { readTaskRecord, saveTaskRecord } from "@/server/task-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const { taskId } = await context.params;
    const task = await readTaskRecord(taskId);

    if (!task) {
      return NextResponse.json({ message: "Task not found." }, { status: 404 });
    }

    if (!task.draft.jdText.trim()) {
      return NextResponse.json({ message: "JD text is required before analysis." }, { status: 400 });
    }

    const { jdAnalysis, matchAnalysis, resumeDraft, source } = await analyzeTaskWithProvider(
      task.draft,
    );

    const nextTask = await saveTaskRecord({
      ...task,
      draft: {
        ...task.draft,
        jdAnalysis,
        matchAnalysis,
        resumeDraft,
      },
    });

    return NextResponse.json({ task: nextTask, source });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "External analysis failed.",
      },
      { status: 502 },
    );
  }
}
