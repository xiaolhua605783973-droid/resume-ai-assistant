import { NextResponse } from "next/server";

import { createTaskRecord } from "@/server/task-repository";

export const runtime = "nodejs";

export async function POST() {
  const task = await createTaskRecord();

  return NextResponse.json({ task });
}
