import { NextResponse } from "next/server";

import { parseResumeToDraft, extractResumeText, parseResumeWithLLM } from "@/server/resume-parser";
import { readTaskRecord, saveTaskRecord } from "@/server/task-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

function getAnalysisConfig() {
  const baseUrl = process.env.ANALYSIS_API_BASE_URL;
  const apiKey = process.env.ANALYSIS_API_KEY;
  const model = process.env.ANALYSIS_API_MODEL;
  const path = process.env.ANALYSIS_API_PATH || "/chat/completions";

  if (!baseUrl || !apiKey || !model) {
    return null;
  }

  return { baseUrl, apiKey, model, path };
}

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
    const config = getAnalysisConfig();
    
    let parsedDraft;
    if (config) {
      try {
        const llmParsed = await parseResumeWithLLM(content, config);
        // 合并 LLM 解析结果，补全 ID
        parsedDraft = {
          ...task.draft,
          basicInfo: { ...task.draft.basicInfo, ...llmParsed.basicInfo },
          experiences: (llmParsed.experiences || []).map((exp: any, i: number) => ({
            id: `exp-${Date.now()}-${i}`,
            companyName: exp.companyName || "",
            roleName: exp.roleName || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            responsibilityText: exp.responsibilityText || "",
            achievementText: exp.achievementText || "",
          })),
          projects: (llmParsed.projects || []).map((proj: any, i: number) => ({
            id: `proj-${Date.now()}-${i}`,
            projectName: proj.projectName || "",
            roleName: proj.roleName || "",
            projectPeriod: proj.projectPeriod || "",
            backgroundText: proj.backgroundText || "",
            contributionText: proj.contributionText || "",
            outcomeText: proj.outcomeText || "",
          })),
          skills: (llmParsed.skills || []).map((skill: any, i: number) => ({
            id: `skill-${Date.now()}-${i}`,
            skillName: skill.skillName || "",
            proficiency: skill.proficiency || "",
          })),
        };
      } catch (e) {
        console.error("LLM parse failed, falling back to heuristics:", e);
        parsedDraft = parseResumeToDraft(content, task.draft);
      }
    } else {
      parsedDraft = parseResumeToDraft(content, task.draft);
    }

    const nextTask = await saveTaskRecord({
      ...task,
      draft: parsedDraft,
    });

    return NextResponse.json({ task: nextTask, parsedPreview: content });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Resume parse failed.",
      },
      { status: 400 },
    );
  }
}
