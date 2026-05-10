"use client";

import { startTransition, useSyncExternalStore } from "react";

import {
  getTaskDraft,
  resetTaskDraft,
  saveTaskDraft,
  subscribeTaskDraft,
} from "@/lib/mvp-store";
import { createEmptyTaskDraft } from "@/lib/mvp-types";

export const useTaskDraft = () => {
  const draft = useSyncExternalStore(
    subscribeTaskDraft,
    getTaskDraft,
    createEmptyTaskDraft,
  );

  const updateDraft = (updater: (current: typeof draft) => typeof draft) => {
    startTransition(() => {
      saveTaskDraft(updater(getTaskDraft()));
    });
  };

  const restartDraft = () => {
    return resetTaskDraft();
  };

  return {
    draft,
    loaded: true,
    updateDraft,
    restartDraft,
  };
};
