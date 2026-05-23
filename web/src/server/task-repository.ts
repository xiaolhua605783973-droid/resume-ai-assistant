import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createEmptyTaskDraft, type TaskDraft, type TaskRecord } from "@/lib/mvp-types";

const dataDir = process.env.TASK_DATA_DIR?.trim()
  ? path.resolve(process.env.TASK_DATA_DIR)
  : path.join(process.cwd(), ".data", "tasks");

const ensureDataDir = async () => {
  await mkdir(dataDir, { recursive: true });
};

const getTaskFilePath = (taskId: string) => path.join(dataDir, `${taskId}.json`);

const withTimestamps = (draft: TaskDraft): TaskDraft => ({
  ...draft,
  updatedAt: new Date().toISOString(),
});

export const createTaskRecord = async () => {
  await ensureDataDir();

  const now = new Date().toISOString();
  const task: TaskRecord = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    draft: createEmptyTaskDraft(),
  };

  await writeFile(getTaskFilePath(task.id), JSON.stringify(task, null, 2), "utf8");
  return task;
};

export const readTaskRecord = async (taskId: string) => {
  await ensureDataDir();

  try {
    const content = await readFile(getTaskFilePath(taskId), "utf8");
    return JSON.parse(content) as TaskRecord;
  } catch {
    return null;
  }
};

export const saveTaskRecord = async (task: TaskRecord) => {
  await ensureDataDir();

  const nextTask: TaskRecord = {
    ...task,
    updatedAt: new Date().toISOString(),
    draft: withTimestamps(task.draft),
  };

  await writeFile(getTaskFilePath(task.id), JSON.stringify(nextTask, null, 2), "utf8");
  return nextTask;
};

export const updateTaskDraft = async (taskId: string, draft: TaskDraft) => {
  const currentTask = await readTaskRecord(taskId);

  if (!currentTask) {
    return null;
  }

  return saveTaskRecord({
    ...currentTask,
    draft,
  });
};
