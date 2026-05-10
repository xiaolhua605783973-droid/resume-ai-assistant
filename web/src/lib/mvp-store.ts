import { createEmptyTaskDraft, type TaskDraft } from "@/lib/mvp-types";

const STORAGE_KEY = "ai-job-mvp-demo-task";
const EVENT_NAME = "ai-job-mvp-demo-task-change";

const emitDraftChange = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(EVENT_NAME));
};

export const getTaskDraft = (): TaskDraft => {
  if (typeof window === "undefined") {
    return createEmptyTaskDraft();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const initialDraft = createEmptyTaskDraft();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDraft));
    return initialDraft;
  }

  try {
    return JSON.parse(raw) as TaskDraft;
  } catch {
    const fallbackDraft = createEmptyTaskDraft();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackDraft));
    return fallbackDraft;
  }
};

export const saveTaskDraft = (draft: TaskDraft) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...draft,
      updatedAt: new Date().toISOString(),
    }),
  );
  emitDraftChange();
};

export const resetTaskDraft = () => {
  if (typeof window === "undefined") {
    return createEmptyTaskDraft();
  }

  const nextDraft = createEmptyTaskDraft();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
  emitDraftChange();
  return nextDraft;
};

export const subscribeTaskDraft = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener = () => callback();
  window.addEventListener(EVENT_NAME, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(EVENT_NAME, listener);
    window.removeEventListener("storage", listener);
  };
};
