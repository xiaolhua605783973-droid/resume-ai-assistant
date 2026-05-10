"use client";

import { startTransition, useEffect, useRef, useState } from "react";

import {
  analyzeTask as analyzeTaskRequest,
  fetchTask,
  parseResumeFile,
  persistTaskDraft,
} from "@/lib/mvp-api";
import type { TaskDraft, TaskRecord } from "@/lib/mvp-types";

export const useTaskDraft = (taskId: string | null) => {
  const [task, setTask] = useState<TaskRecord | null>(null);
  const [loaded, setLoaded] = useState(Boolean(!taskId));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const persistTimerRef = useRef<number | null>(null);
  const savingIndicatorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!taskId) {
      return;
    }

    let active = true;

    const loadTask = async () => {
      try {
        const response = await fetchTask(taskId);

        if (!active) {
          return;
        }

        setTask(response.task);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Task load failed.");
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    };

    void loadTask();

    return () => {
      active = false;

      if (persistTimerRef.current) {
        window.clearTimeout(persistTimerRef.current);
      }

      if (savingIndicatorTimerRef.current) {
        window.clearTimeout(savingIndicatorTimerRef.current);
      }
    };
  }, [taskId]);

  const queuePersist = (nextDraft: TaskDraft) => {
    if (!taskId) {
      return;
    }

    if (persistTimerRef.current) {
      window.clearTimeout(persistTimerRef.current);
    }

    if (savingIndicatorTimerRef.current) {
      window.clearTimeout(savingIndicatorTimerRef.current);
    }

    savingIndicatorTimerRef.current = window.setTimeout(() => {
      setIsSaving(true);
    }, 900);

    persistTimerRef.current = window.setTimeout(async () => {
      try {
        await persistTaskDraft(taskId, nextDraft);
        setError(null);
      } catch (persistError) {
        setError(persistError instanceof Error ? persistError.message : "Task save failed.");
      } finally {
        if (savingIndicatorTimerRef.current) {
          window.clearTimeout(savingIndicatorTimerRef.current);
          savingIndicatorTimerRef.current = null;
        }

        setIsSaving(false);
      }
    }, 350);
  };

  const updateDraft = (updater: (current: TaskDraft) => TaskDraft) => {
    startTransition(() => {
      setTask((current) => {
        if (!current) {
          return current;
        }

        const nextDraft = updater(current.draft);
        const nextTask = {
          ...current,
          draft: nextDraft,
        };

        queuePersist(nextDraft);
        return nextTask;
      });
    });
  };

  const requestAnalysis = async () => {
    if (!taskId) {
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await analyzeTaskRequest(taskId);
      setTask(response.task);
      return response.task;
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Analysis failed.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const importResume = async (file: File) => {
    if (!taskId) {
      return null;
    }

    setIsParsingResume(true);
    setError(null);

    try {
      const response = await parseResumeFile(taskId, file);
      setTask(response.task);
      return response;
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Resume parse failed.");
      return null;
    } finally {
      setIsParsingResume(false);
    }
  };

  return {
    task,
    draft: task?.draft ?? null,
    loaded,
    error,
    isSaving,
    isAnalyzing,
    isParsingResume,
    updateDraft,
    requestAnalysis,
    importResume,
  };
};
