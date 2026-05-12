"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { FormField, TextArea, TextInput } from "@/components/form-field";
import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import { withTaskId } from "@/lib/mvp-api";
import type {
  BasicInfo,
  ExperienceItem,
  ProjectItem,
  SkillItem,
} from "@/lib/mvp-types";
import { GlobalStepper } from "@/components/global-stepper";

const basicFields: Array<{ key: keyof BasicInfo; label: string; hint?: string }> = [
  { key: "name", label: "姓名" },
  { key: "phone", label: "手机号" },
  { key: "email", label: "邮箱" },
  { key: "educationLevel", label: "最高学历" },
  { key: "major", label: "专业" },
  { key: "graduationDate", label: "毕业时间" },
  { key: "workYears", label: "工作年限", hint: "例如 0年 / 2年 / 3-5年" },
  { key: "city", label: "所在城市" },
];

function IntakePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const {
    draft,
    loaded,
    error,
    isSaving,
    isParsingResume,
    updateDraft,
    importResume,
  } = useTaskDraft(taskId);

  if (!taskId) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <GlobalStepper />
        <div className="mx-auto max-w-4xl px-6 py-20">
          <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <SectionTitle
              eyebrow="Error"
              title="缺少任务上下文"
              description="请先从新建任务页面创建一个服务端任务，再回来录入经历。"
            />
            <Link className="mx-auto mt-4 rounded-full bg-slate-950 px-8 py-3 text-sm font-bold text-white transition hover:bg-slate-800" href="/tasks/new">
              ← 返回新建任务
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (!loaded || !draft) {
    return null;
  }

  const filledBasics = basicFields.filter(({ key }) => draft.basicInfo[key].trim()).length;
  const completion = Math.round((filledBasics / basicFields.length) * 100);

  const updateBasic = (key: keyof BasicInfo, value: string) => {
    updateDraft((current) => ({
      ...current,
      basicInfo: {
        ...current.basicInfo,
        [key]: value,
      },
    }));
  };

  const updateExperience = (id: string, key: keyof ExperienceItem, value: string) => {
    updateDraft((current) => ({
      ...current,
      experiences: current.experiences.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateProject = (id: string, key: keyof ProjectItem, value: string) => {
    updateDraft((current) => ({
      ...current,
      projects: current.projects.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateSkill = (id: string, key: keyof SkillItem, value: string) => {
    updateDraft((current) => ({
      ...current,
      skills: current.skills.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <GlobalStepper />

      <div className="mx-auto flex max-w-[1600px] gap-6 p-6">
        {/* 左侧：表单录入区 */}
        <section className={`flex-1 transition-all duration-300 ${showRaw ? "max-w-[calc(100%-450px)]" : "max-w-4xl mx-auto"}`}>
          <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <SectionTitle
                eyebrow="Step 2"
                title="经历录入与解析确认"
                description="请校验解析结果，补充关键信息。信息越完整，后期的匹配分析就越精准。"
              />
              <div className="flex flex-col items-end gap-2">
                <div className="flex h-9 items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 border border-slate-100">
                  {isSaving ? (
                    <span className="flex items-center gap-1.5 text-cyan-600">
                      <span className="h-1 w-1 animate-ping rounded-full bg-cyan-500" />
                      正在实时保存...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      草稿已自动缓存 (本地)
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => {
                    if (confirm("确定要销毁一切缓存数据并返回首页吗？此操作不可逆。")) {
                      localStorage.clear();
                      window.location.href = "/";
                    }
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  一键销毁我的所有数据
                </button>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] border border-dashed border-cyan-200 bg-cyan-50/50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="group flex cursor-pointer items-center gap-2 rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-cyan-700 active:scale-95 shadow-lg shadow-cyan-200">
                    <span>导入旧简历</span>
                    <input
                      accept=".txt,.pdf,.docx"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const response = await importResume(file);
                        if (response?.parsedPreview) {
                          setRawText(response.parsedPreview);
                          setShowRaw(true);
                          setUploadMessage(`已解析 ${file.name}，可对照右侧原文检查。`);
                        }
                        event.target.value = "";
                      }}
                      type="file"
                    />
                  </label>
                  <div className="flex flex-col gap-1.5">
                    <span className="max-w-xs text-xs leading-relaxed text-cyan-800/80 font-medium">
                      支持 TXT, PDF, DOCX。AI 将自动提取工作及项目经历。
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      纯前端处理，退出即焚，绝不上传您的简历
                    </span>
                  </div>
                </div>
                {rawText && (
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      showRaw 
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                      : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {showRaw ? "隐藏原文" : "对照原文"}
                  </button>
                )}
              </div>
              
              {uploadMessage || error || isParsingResume ? (
                <div className="mt-2 flex flex-col gap-1">
                  {uploadMessage && <p className="text-xs font-medium text-cyan-700">{uploadMessage}</p>}
                  {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
                  {isParsingResume && (
                    <div className="flex items-center gap-2 py-1">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                      <p className="text-xs font-semibold text-cyan-700">正在深度提取结构化经历...</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* 基础信息 */}
            <article className="grid gap-5 rounded-[1.5rem] border border-slate-100 bg-slate-50/50 p-6 md:grid-cols-2">
              <div className="md:col-span-2 flex items-center gap-2 border-b border-slate-200/50 pb-2">
                <span className="h-4 w-1 rounded-full bg-slate-950" />
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-widest">基础信息</h3>
              </div>
              {basicFields.map((field) => (
                <FormField key={field.key} hint={field.hint} label={field.label}>
                  <TextInput
                    onChange={(event) => updateBasic(field.key, event.target.value)}
                    placeholder={`请输入${field.label}`}
                    value={draft.basicInfo[field.key]}
                  />
                </FormField>
              ))}
            </article>

            {/* 编辑表单逻辑保持不变，但增加视觉分隔 */}
            <div className="space-y-12">
              <section className="grid gap-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-orange-500" />
                    <h2 className="text-lg font-bold text-slate-950 px-2">工作 / 实习经历</h2>
                  </div>
                  <button
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
                    onClick={() => {
                      updateDraft((current) => ({
                        ...current,
                        experiences: [
                          ...current.experiences,
                          {
                            id: `experience-${Date.now()}`,
                            companyName: "",
                            roleName: "",
                            startDate: "",
                            endDate: "",
                            responsibilityText: "",
                            achievementText: "",
                          },
                        ],
                      }));
                    }}
                    type="button"
                  >
                    + 添加经历
                  </button>
                </div>

                {draft.experiences.map((item, index) => (
                  <article key={item.id} className="relative grid gap-5 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <span className="absolute -left-2 top-6 flex h-6 w-8 items-center justify-center rounded-r-full bg-orange-100 text-[10px] font-bold text-orange-700">
                      0{index + 1}
                    </span>
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField label="公司名">
                        <TextInput onChange={(event) => updateExperience(item.id, "companyName", event.target.value)} value={item.companyName} />
                      </FormField>
                      <FormField label="岗位名称">
                        <TextInput onChange={(event) => updateExperience(item.id, "roleName", event.target.value)} value={item.roleName} />
                      </FormField>
                      <FormField label="开始时间">
                        <TextInput onChange={(event) => updateExperience(item.id, "startDate", event.target.value)} value={item.startDate} />
                      </FormField>
                      <FormField label="结束时间">
                        <TextInput onChange={(event) => updateExperience(item.id, "endDate", event.target.value)} value={item.endDate} />
                      </FormField>
                      <div className="md:col-span-2">
                        <FormField label="职责描述" hint="负责了什么、推进了什么、协作了哪些对象。">
                          <TextArea onChange={(event) => updateExperience(item.id, "responsibilityText", event.target.value)} value={item.responsibilityText} />
                        </FormField>
                      </div>
                      <div className="md:col-span-2">
                        <FormField label="成果描述" hint="写出结果数字、效率提升、业务影响。">
                          <TextArea onChange={(event) => updateExperience(item.id, "achievementText", event.target.value)} value={item.achievementText} />
                        </FormField>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <section className="grid gap-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-blue-500" />
                    <h2 className="text-lg font-bold text-slate-950 px-2">项目经历</h2>
                  </div>
                  <button
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
                    onClick={() => {
                      updateDraft((current) => ({
                        ...current,
                        projects: [
                          ...current.projects,
                          {
                            id: `project-${Date.now()}`,
                            projectName: "",
                            roleName: "",
                            projectPeriod: "",
                            backgroundText: "",
                            contributionText: "",
                            outcomeText: "",
                          },
                        ],
                      }));
                    }}
                    type="button"
                  >
                    + 添加项目
                  </button>
                </div>

                {draft.projects.map((item, index) => (
                  <article key={item.id} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 md:grid-cols-2">
                    <p className="md:col-span-2 text-sm font-semibold text-orange-700">项目 0{index + 1}</p>
                    <FormField label="项目名称">
                      <TextInput onChange={(event) => updateProject(item.id, "projectName", event.target.value)} value={item.projectName} />
                    </FormField>
                    <FormField label="你的角色">
                      <TextInput onChange={(event) => updateProject(item.id, "roleName", event.target.value)} value={item.roleName} />
                    </FormField>
                    <div className="md:col-span-2">
                      <FormField label="项目周期">
                        <TextInput onChange={(event) => updateProject(item.id, "projectPeriod", event.target.value)} value={item.projectPeriod} />
                      </FormField>
                    </div>
                    <div className="md:col-span-2">
                      <FormField label="项目背景">
                        <TextArea onChange={(event) => updateProject(item.id, "backgroundText", event.target.value)} value={item.backgroundText} />
                      </FormField>
                    </div>
                    <div className="md:col-span-2">
                      <FormField label="个人贡献">
                        <TextArea onChange={(event) => updateProject(item.id, "contributionText", event.target.value)} value={item.contributionText} />
                      </FormField>
                    </div>
                    <div className="md:col-span-2">
                      <FormField label="结果产出">
                        <TextArea onChange={(event) => updateProject(item.id, "outcomeText", event.target.value)} value={item.outcomeText} />
                      </FormField>
                    </div>
                  </article>
                ))}
              </section>

              <section className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-950">技能与证书</h2>
                  <button
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                    onClick={() => {
                      updateDraft((current) => ({
                        ...current,
                        skills: [
                          ...current.skills,
                          {
                            id: `skill-${Date.now()}`,
                            skillName: "",
                            skillType: "",
                            skillLevel: "",
                          },
                        ],
                      }));
                    }}
                    type="button"
                  >
                    添加技能
                  </button>
                </div>

                {draft.skills.map((item, index) => (
                  <article key={item.id} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 md:grid-cols-3">
                    <p className="md:col-span-3 text-sm font-semibold text-orange-700">技能 0{index + 1}</p>
                    <FormField label="技能名称">
                      <TextInput onChange={(event) => updateSkill(item.id, "skillName", event.target.value)} value={item.skillName} />
                    </FormField>
                    <FormField label="技能类型">
                      <TextInput onChange={(event) => updateSkill(item.id, "skillType", event.target.value)} value={item.skillType} />
                    </FormField>
                    <FormField label="熟练度">
                      <TextInput onChange={(event) => updateSkill(item.id, "skillLevel", event.target.value)} value={item.skillLevel} />
                    </FormField>
                  </article>
                ))}
              </section>
            </div>

            <footer className="mt-12 flex justify-between border-t border-slate-100 pt-8">
              <Link className="rounded-full px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 active:scale-95" href="/tasks/new">
                ← 返回重选 JD
              </Link>
              <button
                className="rounded-full bg-slate-950 px-10 py-3 text-sm font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95"
                onClick={() => router.push(withTaskId("/tasks/demo/jd", taskId))}
                type="button"
              >
                下一步：JD 核心拆解 →
              </button>
            </footer>
          </div>
      </section>

      {/* 右侧：简历原文对照区（Sticky） */}
      {showRaw && rawText && (
        <aside className="sticky top-24 h-[calc(100vh-8rem)] w-[450px] shrink-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-[10px] font-bold text-white">TXT</span>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">简历原文对照</h4>
            </div>
            <button 
              onClick={() => setShowRaw(false)}
              className="rounded-full p-1 hover:bg-slate-200 transition-colors"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6 font-mono text-[11px] leading-relaxed text-slate-600 selection:bg-cyan-100 italic">
            <pre className="whitespace-pre-wrap">{rawText}</pre>
          </div>
          <div className="border-t border-slate-100 bg-white p-4">
            <p className="text-center text-[10px] font-medium text-slate-400">
              💡 遇到解析不准的地方？直接在左侧表单修改即可自动保存。
            </p>
          </div>
        </aside>
      )}
      </div>
    </main>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={null}>
      <IntakePageContent />
    </Suspense>
  );
}
