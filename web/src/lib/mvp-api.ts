import type { TaskDraft, TaskRecord } from "@/lib/mvp-types";

type TaskResponse = {
  task: TaskRecord;
  message?: string;
  parsedPreview?: string;
};

const parseResponse = async (response: Response) => {
  const payload = (await response.json()) as Partial<TaskResponse> & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }

  return payload as TaskResponse;
};

export const createTask = async () => {
  const response = await fetch("/api/tasks", { method: "POST" });
  return parseResponse(response);
};

export const fetchTask = async (taskId: string) => {
  const response = await fetch(`/api/tasks/${taskId}`, { cache: "no-store" });
  return parseResponse(response);
};

export const persistTaskDraft = async (taskId: string, draft: TaskDraft) => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ draft }),
  });

  return parseResponse(response);
};

export const analyzeTask = async (taskId: string) => {
  const response = await fetch(`/api/tasks/${taskId}/analyze`, {
    method: "POST",
  });

  return parseResponse(response);
};

export const parseResumeFile = async (taskId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/tasks/${taskId}/parse-resume`, {
    method: "POST",
    body: formData,
  });

  return parseResponse(response);
};

export const withTaskId = (path: string, taskId: string) => `${path}?taskId=${taskId}`;