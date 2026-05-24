"use client";

import { useEffect, useRef, useState } from "react";

import { DEMO_TASK_ID, createDemoTaskRecord } from "@/lib/demo-task";
import { analyzeJd, analyzeMatch, generateResumeDraft } from "@/lib/mvp-engine";
import {
  analyzeTask as analyzeTaskRequest,
  fetchTask,
  parseResumeFile,
  persistTaskDraft,
} from "@/lib/mvp-api";
import { getTaskDraft, saveTaskDraft } from "@/lib/mvp-store";
import type { TaskDraft, TaskRecord } from "@/lib/mvp-types";

export const useTaskDraft = (taskId: string | null) => {
  const isDemoTask = taskId === DEMO_TASK_ID;
  const [task, setTask] = useState<TaskRecord | null>(null);
  const [loaded, setLoaded] = useState(Boolean(!taskId || isDemoTask));
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

    if (isDemoTask) {
      const demoLoadTimer = window.setTimeout(() => {
        const demoRecord = createDemoTaskRecord();
        demoRecord.draft = getTaskDraft();
        demoRecord.updatedAt = demoRecord.draft.updatedAt;
        setTask(demoRecord);
        setError(null);
      }, 0);

      return () => {
        window.clearTimeout(demoLoadTimer);
      };
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
  }, [isDemoTask, taskId]);

  const queuePersist = (nextDraft: TaskDraft) => {
    if (!taskId) {
      return;
    }

    if (isDemoTask) {
      saveTaskDraft(nextDraft);
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
  };

  const requestAnalysis = async () => {
    if (!taskId) {
      return null;
    }

    if (isDemoTask) {
      let nextTask: TaskRecord | null = null;

      setTask((current) => {
        if (!current) {
          return current;
        }

        const jdAnalysis = analyzeJd(current.draft.jdText);
        const matchAnalysis = analyzeMatch(current.draft, jdAnalysis);
        const resumeDraft = generateResumeDraft(current.draft, jdAnalysis, matchAnalysis);
        const nextDraft = {
          ...current.draft,
          jdAnalysis,
          matchAnalysis,
          resumeDraft,
          updatedAt: new Date().toISOString(),
        };
        const updatedTask = {
          ...current,
          updatedAt: nextDraft.updatedAt,
          draft: nextDraft,
        };

        saveTaskDraft(nextDraft);
        nextTask = updatedTask;
        return updatedTask;
      });

      setError(null);
      return nextTask;
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
