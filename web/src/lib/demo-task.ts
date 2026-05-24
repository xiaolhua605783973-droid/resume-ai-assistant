import { analyzeJd, analyzeMatch, generateResumeDraft } from "@/lib/mvp-engine";
import { createEmptyTaskDraft, type TaskDraft, type TaskRecord } from "@/lib/mvp-types";

export const DEMO_TASK_ID = "demo-task-id";

export const createDemoTaskDraft = (): TaskDraft => {
  const updatedAt = new Date().toISOString();
  const jdText = [
    "字节跳动 数据分析产品经理",
    "负责业务指标体系搭建、核心数据看板设计与异常分析，支持产品和运营决策。",
    "需要熟悉 SQL、Python 或其他数据分析工具，能够独立拆解需求并推进跨部门协同。",
    "有 A/B 测试、自动化分析、ToB/B端产品或 AI 场景经验优先。",
  ].join("\n");

  const draft: TaskDraft = {
    ...createEmptyTaskDraft(),
    basicInfo: {
      name: "陈一鸣",
      phone: "138-0000-2048",
      email: "chenyiming@example.com",
      educationLevel: "本科",
      major: "信息管理与信息系统",
      graduationDate: "2022-06",
      workYears: "3年",
      city: "上海",
    },
    experiences: [
      {
        id: "experience-demo-1",
        companyName: "某智能 SaaS 公司",
        roleName: "数据分析师 / 产品分析",
        startDate: "2022-07",
        endDate: "至今",
        responsibilityText:
          "负责增长与留存分析，搭建业务周报体系，拆解销售与运营提出的分析需求，并与产品、研发协同推进数据埋点优化。",
        achievementText:
          "主导 3 个核心看板重构，将周报人工整理时间从 4 小时缩短到 30 分钟；通过漏斗分析定位关键流失环节，推动注册转化率提升 12%。",
      },
    ],
    projects: [
      {
        id: "project-demo-1",
        projectName: "线索分层与商机评分模型",
        roleName: "项目负责人",
        projectPeriod: "2023-09 至 2024-02",
        backgroundText:
          "销售线索质量波动较大，团队缺少统一评估标准，导致高意向客户跟进不及时。",
        contributionText:
          "联合销售运营梳理评分规则，用 SQL + Python 回溯关键行为特征，输出线索评分模型，并协调产品补充关键埋点。",
        outcomeText:
          "帮助团队将高质量线索识别提前到首日，重点商机跟进时效提升 35%，模型结果被纳入日常销售看板。",
      },
    ],
    skills: [
      {
        id: "skill-demo-1",
        skillName: "SQL",
        skillType: "数据分析",
        skillLevel: "熟练",
      },
      {
        id: "skill-demo-2",
        skillName: "Python",
        skillType: "数据分析",
        skillLevel: "熟练",
      },
      {
        id: "skill-demo-3",
        skillName: "A/B 测试",
        skillType: "增长分析",
        skillLevel: "掌握",
      },
    ],
    jdText,
    updatedAt,
    jdAnalysis: null,
    matchAnalysis: null,
    resumeDraft: null,
  };

  const jdAnalysis = analyzeJd(jdText);
  const matchAnalysis = analyzeMatch(draft, jdAnalysis);
  const resumeDraft = generateResumeDraft(draft, jdAnalysis, matchAnalysis);

  return {
    ...draft,
    jdAnalysis,
    matchAnalysis,
    resumeDraft,
  };
};

export const createDemoTaskRecord = (): TaskRecord => {
  const timestamp = new Date().toISOString();

  return {
    id: DEMO_TASK_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
    draft: createDemoTaskDraft(),
  };
};