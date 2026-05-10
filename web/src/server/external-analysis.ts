import {
  analyzeJd,
  analyzeMatch,
  generateResumeDraft,
} from "@/lib/mvp-engine";
import type {
  AnalysisEvidence,
  JdAnalysis,
  MatchAnalysis,
  ResumeDraft,
  ResumeSection,
  TaskDraft,
} from "@/lib/mvp-types";

type ExternalAnalysisPayload = {
  jdAnalysis?: unknown;
  matchAnalysis?: unknown;
  resumeDraft?: unknown;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type AnalysisClientConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  path: string;
};

const trimString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.trim() || fallback : fallback;

const normalizeStringArray = (value: unknown, fallback: string[], limit: number) => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => trimString(item))
    .filter(Boolean)
    .slice(0, limit);

  return normalized.length ? normalized : fallback;
};

const normalizeEvidenceArray = (
  value: unknown,
  fallback: AnalysisEvidence[],
  limit: number,
): AnalysisEvidence[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const evidence = item as { title?: unknown; reason?: unknown };
      const title = trimString(evidence.title);
      const reason = trimString(evidence.reason);

      if (!title || !reason) {
        return null;
      }

      return { title, reason };
    })
    .filter((item): item is AnalysisEvidence => Boolean(item))
    .slice(0, limit);

  return normalized.length ? normalized : fallback;
};

const normalizeResumeSections = (
  value: unknown,
  fallback: ResumeSection[],
): ResumeSection[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const section = item as { title?: unknown; content?: unknown };
      const title = trimString(section.title);
      const content = trimString(section.content);

      if (!title || !content) {
        return null;
      }

      return { title, content };
    })
    .filter((item): item is ResumeSection => Boolean(item));

  return normalized.length ? normalized : fallback;
};

const normalizeJdAnalysis = (value: unknown, fallback: JdAnalysis): JdAnalysis => {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const analysis = value as Record<string, unknown>;

  return {
    targetCompany: trimString(analysis.targetCompany, fallback.targetCompany),
    targetRole: trimString(analysis.targetRole, fallback.targetRole),
    summary: trimString(analysis.summary, fallback.summary),
    coreResponsibilities: normalizeStringArray(
      analysis.coreResponsibilities,
      fallback.coreResponsibilities,
      5,
    ),
    hardRequirements: normalizeStringArray(
      analysis.hardRequirements,
      fallback.hardRequirements,
      5,
    ),
    bonusItems: normalizeStringArray(analysis.bonusItems, fallback.bonusItems, 4),
    atsKeywords: normalizeStringArray(analysis.atsKeywords, fallback.atsKeywords, 8),
    riskSignals: normalizeStringArray(analysis.riskSignals, fallback.riskSignals, 5),
  };
};

const normalizeMatchAnalysis = (
  value: unknown,
  fallback: MatchAnalysis,
): MatchAnalysis => {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const analysis = value as Record<string, unknown>;
  const matchLevel = analysis.matchLevel;

  return {
    matchLevel:
      matchLevel === "high" || matchLevel === "medium" || matchLevel === "low"
        ? matchLevel
        : fallback.matchLevel,
    matchScoreLabel: trimString(analysis.matchScoreLabel, fallback.matchScoreLabel),
    matchedItems: normalizeEvidenceArray(analysis.matchedItems, fallback.matchedItems, 8),
    missingItems: normalizeEvidenceArray(analysis.missingItems, fallback.missingItems, 6),
    riskItems: normalizeEvidenceArray(analysis.riskItems, fallback.riskItems, 6),
    gapItems: normalizeEvidenceArray(analysis.gapItems, fallback.gapItems, 6),
    atsTips: normalizeStringArray(analysis.atsTips, fallback.atsTips, 5),
  };
};

const normalizeResumeDraft = (value: unknown, fallback: ResumeDraft): ResumeDraft => {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const draft = value as Record<string, unknown>;

  return {
    headline: trimString(draft.headline, fallback.headline),
    summary: trimString(draft.summary, fallback.summary),
    sections: normalizeResumeSections(draft.sections, fallback.sections),
  };
};

const extractMessageText = (payload: ChatCompletionResponse) => {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (item.type === "text" ? item.text ?? "" : item.text ?? ""))
      .join("")
      .trim();
  }

  return "";
};

const extractJsonBlock = (content: string) => {
  const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i);

  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const startIndex = content.indexOf("{");
  const endIndex = content.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error("Analysis provider did not return valid JSON content.");
  }

  return content.slice(startIndex, endIndex + 1);
};

const parseExternalPayload = (content: string): ExternalAnalysisPayload => {
  const jsonBlock = extractJsonBlock(content);
  return JSON.parse(jsonBlock) as ExternalAnalysisPayload;
};

const getClientConfig = (): AnalysisClientConfig | null => {
  const baseUrl = process.env.ANALYSIS_API_BASE_URL?.trim();
  const apiKey = process.env.ANALYSIS_API_KEY?.trim();
  const model = process.env.ANALYSIS_API_MODEL?.trim();
  const path = process.env.ANALYSIS_API_PATH?.trim() || "/chat/completions";

  if (!baseUrl || !apiKey || !model) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey,
    model,
    path: path.startsWith("/") ? path : `/${path}`,
  };
};

const buildSystemPrompt = () => `你是一个高可信的简历决策分析引擎。
你只能基于用户提供的候选人信息和目标JD做判断，不能虚构经历、结果、技能或项目。
输出必须是一个 JSON 对象，且只能输出 JSON，不要输出 Markdown、解释文字、代码块前后缀。

JSON 顶层字段必须包含：jdAnalysis、matchAnalysis、resumeDraft。

jdAnalysis 结构：
- targetCompany: string
- targetRole: string
- summary: string
- coreResponsibilities: string[]
- hardRequirements: string[]
- bonusItems: string[]
- atsKeywords: string[]
- riskSignals: string[]

matchAnalysis 结构：
- matchLevel: "high" | "medium" | "low"
- matchScoreLabel: string
- matchedItems: Array<{ title: string; reason: string }>
- missingItems: Array<{ title: string; reason: string }>
- riskItems: Array<{ title: string; reason: string }>
- gapItems: Array<{ title: string; reason: string }>
- atsTips: string[]

resumeDraft 结构：
- headline: string
- summary: string
- sections: Array<{ title: string; content: string }>

要求：
- 输出语言使用简体中文。
- 如果证据不足，要明确放到 missingItems、riskItems 或 riskSignals，不要编造补全。
- matchedItems 必须只写候选人输入中确实出现过的能力或经历证明。
- 生成的简历文案必须尽量忠实于原始经历，只做表达优化，不做事实扩写。`;

const buildUserPrompt = (draft: TaskDraft) =>
  JSON.stringify(
    {
      task: "请基于候选人资料和目标JD，生成结构化JD分析、匹配分析和简历初稿。",
      candidateProfile: draft,
      outputConstraints: {
        maxCoreResponsibilities: 5,
        maxHardRequirements: 5,
        maxBonusItems: 4,
        maxAtsKeywords: 8,
        maxGapItems: 6,
        maxAtsTips: 5,
      },
    },
    null,
    2,
  );

const requestExternalAnalysis = async (config: AnalysisClientConfig, draft: TaskDraft) => {
  const response = await fetch(`${config.baseUrl}${config.path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(draft) },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });

  const payload = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "External analysis request failed.");
  }

  const content = extractMessageText(payload);

  if (!content) {
    throw new Error("Analysis provider returned empty content.");
  }

  return parseExternalPayload(content);
};

export const analyzeTaskWithProvider = async (draft: TaskDraft) => {
  const fallbackJdAnalysis = analyzeJd(draft.jdText);
  const fallbackMatchAnalysis = analyzeMatch(draft, fallbackJdAnalysis);
  const fallbackResumeDraft = generateResumeDraft(
    draft,
    fallbackJdAnalysis,
    fallbackMatchAnalysis,
  );
  const config = getClientConfig();

  if (!config) {
    return {
      jdAnalysis: fallbackJdAnalysis,
      matchAnalysis: fallbackMatchAnalysis,
      resumeDraft: fallbackResumeDraft,
      source: "local-fallback" as const,
    };
  }

  const externalPayload = await requestExternalAnalysis(config, draft);

  return {
    jdAnalysis: normalizeJdAnalysis(externalPayload.jdAnalysis, fallbackJdAnalysis),
    matchAnalysis: normalizeMatchAnalysis(
      externalPayload.matchAnalysis,
      fallbackMatchAnalysis,
    ),
    resumeDraft: normalizeResumeDraft(externalPayload.resumeDraft, fallbackResumeDraft),
    source: "external" as const,
  };
};