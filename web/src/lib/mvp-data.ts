export const mvpFlow = [
  {
    title: "经历录入",
    description: "录入基础信息、工作经历和项目经历，或上传旧简历解析。",
  },
  {
    title: "JD拆解",
    description: "将目标岗位JD结构化成职责、门槛、加分项和ATS关键词。",
  },
  {
    title: "匹配判断",
    description: "基于经历和JD输出匹配项、风险项和关键缺口。",
  },
  {
    title: "简历生成",
    description: "生成一版可投递简历，并给出ATS优化建议。",
  },
];

export const mvpRoutes = [
  {
    href: "/tasks/new",
    label: "新建任务",
    description: "开始一次新的JD定制简历流程。",
  },
  {
    href: "/tasks/demo/intake",
    label: "经历录入页",
    description: "收集基础信息、工作/项目经历和技能。",
  },
  {
    href: "/tasks/demo/jd",
    label: "JD拆解页",
    description: "粘贴目标JD并查看结构化结果。",
  },
  {
    href: "/tasks/demo/analysis",
    label: "匹配分析页",
    description: "查看匹配项、风险项、关键Gap和动作建议。",
  },
  {
    href: "/tasks/demo/resume",
    label: "简历编辑页",
    description: "查看简历预览、原文对照和导出入口。",
  },
];

export const keySignals = [
  "不得编造不存在的经历、项目或量化结果。",
  "匹配分析需要给出对应依据，而不是只给一个分数。",
  "Gap 只保留 3 到 5 条最关键的决策信息。",
];
