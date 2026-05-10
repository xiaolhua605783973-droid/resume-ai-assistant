import path from "node:path";
import { pathToFileURL } from "node:url";

import type { TaskDraft } from "@/lib/mvp-types";

const phonePattern = /(?:(?:\+?86[-\s]?)?1[3-9]\d{9})/;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const cityPattern = /(北京|上海|深圳|广州|杭州|成都|苏州|南京|武汉|西安)/;
const pageMarkerPattern = /^--\s*\d+\s+of\s+\d+\s*--$/i;
const sectionHeaderPattern = /教育经历|教育背景|工作经历|实习经历|项目经历|项目经验|技能|专业技能|技能证书|证书|荣誉/;
const nonNameDocumentPattern = /pdf|file|document|resume|curriculum vitae|个人简历|简历/i;
const nameCandidatePattern = /^[A-Za-z\s.'-]+$|^[\u3400-\u9FFF·\s]{2,}$/u;

const normalizeLines = (content: string) =>
  content
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !pageMarkerPattern.test(line));

const findSection = (lines: string[], headers: string[]) => {
  const headerIndex = lines.findIndex((line) => headers.some((header) => line.includes(header)));

  if (headerIndex === -1) {
    return [];
  }

  const collected: string[] = [];

  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (/教育经历|工作经历|项目经历|技能|证书|荣誉|实习经历/.test(line)) {
      break;
    }

    collected.push(line);
  }

  return collected;
};

const parseEducationLevel = (lines: string[]) =>
  lines.find((line) => /博士|硕士|本科|大专|中专/.test(line))?.match(/博士|硕士|本科|大专|中专/)?.[0] ?? "";

const parseMajor = (lines: string[]) =>
  lines.find((line) => /专业/.test(line))?.replace(/.*专业[:：]?/, "").trim() ?? "";

const buildSingleExperience = (lines: string[]) => ({
  companyName: lines.find((line) => /公司|科技|网络|信息|集团/.test(line)) ?? "",
  roleName: lines.find((line) => /经理|专员|运营|产品|分析|工程师|实习/.test(line)) ?? "",
  startDate: "",
  endDate: "",
  responsibilityText: lines.slice(0, 3).join("；"),
  achievementText: lines.slice(3, 6).join("；"),
});

const buildSingleProject = (lines: string[]) => ({
  projectName: lines[0] ?? "",
  roleName: lines.find((line) => /负责人|成员|项目经理|产品/.test(line)) ?? "",
  projectPeriod: "",
  backgroundText: lines.slice(0, 2).join("；"),
  contributionText: lines.slice(2, 5).join("；"),
  outcomeText: lines.slice(5, 7).join("；"),
});

const isLikelyNameLine = (line: string) => {
  const normalized = line.trim();

  if (!normalized || normalized.length > 20) {
    return false;
  }

  if (phonePattern.test(normalized) || emailPattern.test(normalized)) {
    return false;
  }

  if (pageMarkerPattern.test(normalized) || sectionHeaderPattern.test(normalized)) {
    return false;
  }

  if (nonNameDocumentPattern.test(normalized)) {
    return false;
  }

  if (/\d/.test(normalized)) {
    return false;
  }

  return nameCandidatePattern.test(normalized);
};

const getPdfWorkerUrl = () =>
  pathToFileURL(path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs")).href;

export const extractResumeText = async (file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (file.type === "text/plain" || extension === "txt") {
    return buffer.toString("utf8");
  }

  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (file.type === "application/pdf" || extension === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    PDFParse.setWorker(getPdfWorkerUrl());
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText({ pageJoiner: "" });
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("当前仅支持 TXT、DOCX、PDF 简历导入。");
};

export const parseResumeToDraft = (content: string, currentDraft: TaskDraft): TaskDraft => {
  const lines = normalizeLines(content);
  const educationLines = findSection(lines, ["教育经历", "教育背景"]);
  const experienceLines = findSection(lines, ["工作经历", "实习经历"]);
  const projectLines = findSection(lines, ["项目经历", "项目经验"]);
  const skillLines = findSection(lines, ["技能", "专业技能", "技能证书"]);
  const phone = lines.join(" ").match(phonePattern)?.[0] ?? currentDraft.basicInfo.phone;
  const email = lines.join(" ").match(emailPattern)?.[0] ?? currentDraft.basicInfo.email;
  const city = lines.join(" ").match(cityPattern)?.[0] ?? currentDraft.basicInfo.city;
  const possibleName = lines.find(isLikelyNameLine) ?? currentDraft.basicInfo.name;

  const nextDraft: TaskDraft = {
    ...currentDraft,
    basicInfo: {
      ...currentDraft.basicInfo,
      name: currentDraft.basicInfo.name || possibleName,
      phone,
      email,
      city,
      educationLevel: currentDraft.basicInfo.educationLevel || parseEducationLevel(educationLines.length ? educationLines : lines),
      major: currentDraft.basicInfo.major || parseMajor(educationLines.length ? educationLines : lines),
    },
    experiences: experienceLines.length
      ? [
          {
            ...currentDraft.experiences[0],
            id: currentDraft.experiences[0]?.id ?? "experience-1",
            ...buildSingleExperience(experienceLines),
          },
        ]
      : currentDraft.experiences,
    projects: projectLines.length
      ? [
          {
            ...currentDraft.projects[0],
            id: currentDraft.projects[0]?.id ?? "project-1",
            ...buildSingleProject(projectLines),
          },
        ]
      : currentDraft.projects,
    skills: skillLines.length
      ? skillLines.slice(0, 6).map((line, index) => ({
          id: currentDraft.skills[index]?.id ?? `skill-${index + 1}`,
          skillName: line.split(/[：:]/).pop()?.trim() ?? line,
          skillType: index === 0 ? "导入解析" : currentDraft.skills[index]?.skillType ?? "",
          skillLevel: currentDraft.skills[index]?.skillLevel ?? "",
        }))
      : currentDraft.skills,
    updatedAt: new Date().toISOString(),
  };

  return nextDraft;
};
