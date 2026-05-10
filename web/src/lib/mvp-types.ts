export type BasicInfo = {
  name: string;
  phone: string;
  email: string;
  educationLevel: string;
  major: string;
  graduationDate: string;
  workYears: string;
  city: string;
};

export type ExperienceItem = {
  id: string;
  companyName: string;
  roleName: string;
  startDate: string;
  endDate: string;
  responsibilityText: string;
  achievementText: string;
};

export type ProjectItem = {
  id: string;
  projectName: string;
  roleName: string;
  projectPeriod: string;
  backgroundText: string;
  contributionText: string;
  outcomeText: string;
};

export type SkillItem = {
  id: string;
  skillName: string;
  skillType: string;
  skillLevel: string;
};

export type JdAnalysis = {
  targetCompany: string;
  targetRole: string;
  summary: string;
  coreResponsibilities: string[];
  hardRequirements: string[];
  bonusItems: string[];
  atsKeywords: string[];
  riskSignals: string[];
};

export type AnalysisEvidence = {
  title: string;
  reason: string;
};

export type MatchAnalysis = {
  matchLevel: "high" | "medium" | "low";
  matchScoreLabel: string;
  matchedItems: AnalysisEvidence[];
  missingItems: AnalysisEvidence[];
  riskItems: AnalysisEvidence[];
  gapItems: AnalysisEvidence[];
  atsTips: string[];
};

export type ResumeSection = {
  title: string;
  content: string;
};

export type ResumeDraft = {
  headline: string;
  summary: string;
  sections: ResumeSection[];
};

export type TaskDraft = {
  basicInfo: BasicInfo;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  jdText: string;
  jdAnalysis: JdAnalysis | null;
  matchAnalysis: MatchAnalysis | null;
  resumeDraft: ResumeDraft | null;
  updatedAt: string;
};

export const createEmptyTaskDraft = (): TaskDraft => ({
  basicInfo: {
    name: "",
    phone: "",
    email: "",
    educationLevel: "",
    major: "",
    graduationDate: "",
    workYears: "",
    city: "",
  },
  experiences: [
    {
      id: "experience-1",
      companyName: "",
      roleName: "",
      startDate: "",
      endDate: "",
      responsibilityText: "",
      achievementText: "",
    },
  ],
  projects: [
    {
      id: "project-1",
      projectName: "",
      roleName: "",
      projectPeriod: "",
      backgroundText: "",
      contributionText: "",
      outcomeText: "",
    },
  ],
  skills: [
    {
      id: "skill-1",
      skillName: "",
      skillType: "",
      skillLevel: "",
    },
  ],
  jdText: "",
  jdAnalysis: null,
  matchAnalysis: null,
  resumeDraft: null,
  updatedAt: new Date().toISOString(),
});
