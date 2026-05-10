import type {
  AnalysisEvidence,
  JdAnalysis,
  MatchAnalysis,
  ResumeDraft,
  TaskDraft,
} from "@/lib/mvp-types";

const keywordCatalog = [
  "SQL",
  "Python",
  "数据分析",
  "项目推进",
  "跨部门",
  "协同",
  "复盘",
  "需求拆解",
  "产品",
  "运营",
  "AI",
  "ToB",
  "增长",
  "自动化",
  "指标",
  "用户研究",
  "B端",
];

const normalizeLines = (value: string) =>
  value
    .split(/[\n。；;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const pickFirstLine = (value: string) => normalizeLines(value)[0] ?? "目标岗位";

const pickKeywords = (value: string) => {
  const unique = new Set<string>();

  for (const keyword of keywordCatalog) {
    if (value.toLowerCase().includes(keyword.toLowerCase())) {
      unique.add(keyword);
    }
  }

  return [...unique];
};

const buildEvidence = (title: string, reason: string): AnalysisEvidence => ({
  title,
  reason,
});

export const analyzeJd = (jdText: string): JdAnalysis => {
  const lines = normalizeLines(jdText);
  const roleSeed = pickFirstLine(jdText);
  const keywords = pickKeywords(jdText);
  const hardRequirements = lines.filter((line) =>
    /本科|年以上|熟悉|具备|掌握|经验|SQL|Python|数据分析|沟通/.test(line),
  );
  const bonusItems = lines.filter((line) => /加分|优先|AI|ToB|B端|自动化/.test(line));
  const responsibilities = lines.filter((line) => /负责|推进|协同|分析|制定|优化/.test(line));
  const riskSignals: string[] = [];

  if (!hardRequirements.length) {
    riskSignals.push("JD 没有清晰写出硬性门槛，建议人工确认岗位是否存在隐藏要求。");
  }

  if (!keywords.length) {
    riskSignals.push("JD 关键词不够集中，后续匹配判断会偏保守。");
  }

  return {
    targetCompany: jdText.includes("字节")
      ? "字节跳动"
      : jdText.includes("腾讯")
        ? "腾讯"
        : "目标公司",
    targetRole: roleSeed,
    summary: lines[0] ?? "这是一个围绕执行、分析和跨团队协作展开的岗位。",
    coreResponsibilities: responsibilities.slice(0, 5),
    hardRequirements: hardRequirements.slice(0, 5),
    bonusItems: bonusItems.slice(0, 4),
    atsKeywords: keywords.slice(0, 8),
    riskSignals,
  };
};

export const analyzeMatch = (draft: TaskDraft, jd: JdAnalysis): MatchAnalysis => {
  const profileText = [
    draft.basicInfo.major,
    ...draft.experiences.flatMap((item) => [item.roleName, item.responsibilityText, item.achievementText]),
    ...draft.projects.flatMap((item) => [item.projectName, item.backgroundText, item.contributionText, item.outcomeText]),
    ...draft.skills.flatMap((item) => [item.skillName, item.skillType]),
  ]
    .join(" ")
    .toLowerCase();

  const matchedItems = jd.atsKeywords
    .filter((keyword) => profileText.includes(keyword.toLowerCase()))
    .map((keyword) =>
      buildEvidence(keyword, `你的经历中已经体现了“${keyword}”相关内容，可以直接作为匹配证明。`),
    );

  const missingItems = jd.atsKeywords
    .filter((keyword) => !profileText.includes(keyword.toLowerCase()))
    .slice(0, 4)
    .map((keyword) =>
      buildEvidence(keyword, `当前输入内容里没有明显体现“${keyword}”，需要补经历表达或补真实能力证明。`),
    );

  const riskItems: AnalysisEvidence[] = [];

  if (!draft.experiences.some((item) => item.achievementText.trim())) {
    riskItems.push(
      buildEvidence("成果量化不足", "工作经历里缺少明确结果数字，容易被认为只写了职责没有写产出。"),
    );
  }

  if (!draft.projects.some((item) => item.contributionText.trim() || item.outcomeText.trim())) {
    riskItems.push(
      buildEvidence("项目贡献不清晰", "项目经历还没有形成个人贡献与结果闭环，解释层会偏弱。"),
    );
  }

  if (!draft.basicInfo.workYears.trim()) {
    riskItems.push(
      buildEvidence("年限信息缺失", "JD 常有硬性年限要求，当前未填写工作年限，匹配判断会保守。"),
    );
  }

  const gapItems = [...missingItems, ...riskItems].slice(0, 5);
  const coverage = matchedItems.length / Math.max(jd.atsKeywords.length || 1, 1);
  const matchLevel = coverage >= 0.6 ? "high" : coverage >= 0.3 ? "medium" : "low";

  return {
    matchLevel,
    matchScoreLabel:
      matchLevel === "high" ? "高匹配，建议优先投递" : matchLevel === "medium" ? "中等匹配，可投但建议补表达" : "低匹配，建议先补关键短板",
    matchedItems,
    missingItems,
    riskItems,
    gapItems,
    atsTips: [
      matchedItems.length
        ? `已命中 ${matchedItems.length} 个关键词，但还可以补强具体结果和工具场景。`
        : "当前 ATS 关键词命中很弱，先补关键词对应的真实经历表达。",
      "优先把职责描述改写成行动 + 结果，而不是堆积工作内容。",
      "如果 JD 有硬性工具要求，必须在技能或项目部分给出具体使用场景。",
    ],
  };
};

const buildExperienceSection = (draft: TaskDraft) =>
  draft.experiences
    .filter((item) => item.companyName || item.roleName || item.responsibilityText)
    .map((item) => {
      const responsibility = item.responsibilityText || "负责核心业务推进与协同。";
      const achievement = item.achievementText || "补充真实成果数据后可进一步强化。";

      return `${item.companyName || "目标公司相关经历"} | ${item.roleName || "相关岗位"}\n${responsibility}\n结果：${achievement}`;
    })
    .join("\n\n");

const buildProjectSection = (draft: TaskDraft) =>
  draft.projects
    .filter((item) => item.projectName || item.backgroundText || item.contributionText)
    .map((item) => {
      const background = item.backgroundText || "补充项目背景。";
      const contribution = item.contributionText || "补充个人贡献。";
      const outcome = item.outcomeText || "补充项目结果。";

      return `${item.projectName || "代表项目"} | ${item.roleName || "项目角色"}\n背景：${background}\n贡献：${contribution}\n结果：${outcome}`;
    })
    .join("\n\n");

export const generateResumeDraft = (draft: TaskDraft, jd: JdAnalysis, analysis: MatchAnalysis): ResumeDraft => {
  const skillSummary = draft.skills
    .filter((item) => item.skillName.trim())
    .map((item) => `${item.skillName}${item.skillLevel ? `（${item.skillLevel}）` : ""}`)
    .join(" / ");

  return {
    headline: `${draft.basicInfo.name || "候选人"} | ${jd.targetRole}`,
    summary:
      analysis.matchLevel === "high"
        ? `具备与 ${jd.targetRole} 高相关的项目推进与分析经验，可直接用于目标岗位投递。`
        : `当前正围绕 ${jd.targetRole} 做定向优化，核心价值在于快速补足关键词表达和结果证据。`,
    sections: [
      {
        title: "基础信息",
        content: [draft.basicInfo.phone, draft.basicInfo.email, draft.basicInfo.city].filter(Boolean).join(" | "),
      },
      {
        title: "工作/实习经历",
        content: buildExperienceSection(draft) || "请先补充至少一段真实工作或实习经历。",
      },
      {
        title: "项目经历",
        content: buildProjectSection(draft) || "请补充与目标JD最相关的项目经历。",
      },
      {
        title: "技能与关键词",
        content: [skillSummary, jd.atsKeywords.join(" / ")].filter(Boolean).join("\n建议强调："),
      },
      {
        title: "ATS 优化提醒",
        content: analysis.atsTips.join("\n"),
      },
    ],
  };
};