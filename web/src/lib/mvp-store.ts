import { createEmptyTaskDraft, type TaskDraft } from "@/lib/mvp-types";

const STORAGE_KEY = "ai-job-mvp-demo-task";
const EVENT_NAME = "ai-job-mvp-demo-task-change";
let cachedDraft: TaskDraft | null = null;
let cachedRawDraft: string | null = null;

const emitDraftChange = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(EVENT_NAME));
};

export const getTaskDraft = (): TaskDraft => {
  if (typeof window === "undefined") {
    return cachedDraft ?? createEmptyTaskDraft();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const initialDraft = createEmptyTaskDraft();
    const serializedDraft = JSON.stringify(initialDraft);
    window.localStorage.setItem(STORAGE_KEY, serializedDraft);
    cachedDraft = initialDraft;
    cachedRawDraft = serializedDraft;
    return initialDraft;
  }

  if (cachedDraft && cachedRawDraft === raw) {
    return cachedDraft;
  }

  try {
    const parsedDraft = JSON.parse(raw) as TaskDraft;
    cachedDraft = parsedDraft;
    cachedRawDraft = raw;
    return parsedDraft;
  } catch {
    const fallbackDraft = createEmptyTaskDraft();
    const serializedDraft = JSON.stringify(fallbackDraft);
    window.localStorage.setItem(STORAGE_KEY, serializedDraft);
    cachedDraft = fallbackDraft;
    cachedRawDraft = serializedDraft;
    return fallbackDraft;
  }
};

export const saveTaskDraft = (draft: TaskDraft) => {
  if (typeof window === "undefined") {
    return;
  }

  const nextDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };
  const serializedDraft = JSON.stringify(nextDraft);

  window.localStorage.setItem(STORAGE_KEY, serializedDraft);
  cachedDraft = nextDraft;
  cachedRawDraft = serializedDraft;
  emitDraftChange();
};

export const resetTaskDraft = () => {
  if (typeof window === "undefined") {
    return createEmptyTaskDraft();
  }

  const nextDraft = createEmptyTaskDraft();
  const serializedDraft = JSON.stringify(nextDraft);

  window.localStorage.setItem(STORAGE_KEY, serializedDraft);
  cachedDraft = nextDraft;
  cachedRawDraft = serializedDraft;
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
