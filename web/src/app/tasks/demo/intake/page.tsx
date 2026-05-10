"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FormField, TextArea, TextInput } from "@/components/form-field";
import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import type {
  BasicInfo,
  ExperienceItem,
  ProjectItem,
  SkillItem,
} from "@/lib/mvp-types";

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

export default function IntakePage() {
  const router = useRouter();
  const { draft, loaded, updateDraft } = useTaskDraft();

  if (!loaded) {
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
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <section className="mx-auto grid w-full max-w-5xl gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <SectionTitle
          eyebrow="Step 2"
          title="经历录入与简历解析确认"
          description="现在已经接入任务级草稿保存。先把真实经历录进去，后面的 JD 分析和简历生成都会复用它。"
        />

        <div className="rounded-[1.5rem] border border-orange-200 bg-orange-50 p-5 text-sm leading-7 text-orange-900">
          当前信息完整度：<span className="font-semibold">{completion}%</span>。填写越完整，后面的 JD 拆解和匹配判断越稳定。
        </div>

        <article className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
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

        <section className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-950">工作 / 实习经历</h2>
            <button
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
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
              添加经历
            </button>
          </div>

          {draft.experiences.map((item, index) => (
            <article key={item.id} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 md:grid-cols-2">
              <p className="md:col-span-2 text-sm font-semibold text-orange-700">经历 0{index + 1}</p>
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
                <FormField label="职责描述" hint="写你负责了什么、推进了什么、协作了哪些对象。">
                  <TextArea onChange={(event) => updateExperience(item.id, "responsibilityText", event.target.value)} value={item.responsibilityText} />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField label="成果描述" hint="尽量写出结果数字、效率提升、业务影响。">
                  <TextArea onChange={(event) => updateExperience(item.id, "achievementText", event.target.value)} value={item.achievementText} />
                </FormField>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-950">项目经历</h2>
            <button
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
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
              添加项目
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

        <div className="rounded-[1.5rem] border border-dashed border-orange-300 bg-orange-50 p-5 text-sm leading-7 text-orange-900">
          旧简历上传解析这一步暂时仍用占位交互，当前 MVP 先把手动录入和草稿保存闭环做稳。
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
            onClick={() => router.push("/tasks/demo/jd")}
            type="button"
          >
            下一步：JD拆解
          </button>
          <Link className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700" href="/tasks/new">
            返回上一步
          </Link>
        </div>
      </section>
    </main>
  );
}
