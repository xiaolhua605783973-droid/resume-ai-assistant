"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { FormField, TextArea } from "@/components/form-field";
import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import { withTaskId } from "@/lib/mvp-api";
import type { ResumeSection, TaskDraft } from "@/lib/mvp-types";

const splitContentBlocks = (content: string) =>
  content
    .split(/\n{2,}/)
    .map((block) => block.split("\n").map((line) => line.trim()).filter(Boolean))
    .filter((block) => block.length > 0);

function ResumePreview({ draft }: { draft: TaskDraft }) {
  const resumeDraft = draft.resumeDraft;

  if (!resumeDraft) {
    return null;
  }

  const contactItems = [
    draft.basicInfo.phone,
    draft.basicInfo.email,
    draft.basicInfo.city,
    draft.basicInfo.educationLevel,
  ].filter(Boolean);

  return (
    <div className="resume-print-stage">
      <div className="resume-screen-note mb-4 flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div>
          <p className="font-semibold text-slate-900">A4 导出预览</p>
          <p className="mt-1">当前导出的 PDF 将以右侧版式为准，适合 MVP 演示和直接截图展示。</p>
        </div>
        <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          Demo PDF
        </div>
      </div>

      <article className="resume-paper mx-auto w-full max-w-[210mm] rounded-[1.5rem] border border-slate-200 bg-white px-10 py-9 text-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
        <header className="border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">
                {draft.basicInfo.name || "候选人姓名"}
              </h1>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.24em] text-cyan-700">
                {resumeDraft.headline || "目标岗位定向简历"}
              </p>
            </div>

            {contactItems.length ? (
              <ul className="grid gap-1 text-right text-sm leading-6 text-slate-600">
                {contactItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <p className="mt-5 text-[15px] leading-7 text-slate-700">{resumeDraft.summary}</p>
        </header>

        <div className="mt-8 grid gap-7">
          {resumeDraft.sections.map((section) => (
            <ResumePreviewSection key={section.title} section={section} />
          ))}
        </div>
      </article>
    </div>
  );
}

function ResumePreviewSection({ section }: { section: ResumeSection }) {
  const blocks = splitContentBlocks(section.content);

  return (
    <section className="break-inside-avoid">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-950">{section.title}</h2>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-3 grid gap-4 text-[15px] leading-7 text-slate-700">
        {blocks.length ? (
          blocks.map((block, index) => {
            const [heading, ...details] = block;
            const hasDetailLines = details.length > 0;

            return (
              <div key={`${section.title}-${index}`} className="break-inside-avoid">
                {hasDetailLines ? <p className="font-semibold text-slate-900">{heading}</p> : null}

                {hasDetailLines ? (
                  <ul className="mt-2 grid gap-1 pl-5 text-slate-700">
                    {details.map((line) => (
                      <li key={line} className="list-disc marker:text-cyan-700">
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{heading}</p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-slate-500">待补充</p>
        )}
      </div>
    </section>
  );
}

function ResumePageContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const { draft, loaded, error, isSaving, updateDraft } = useTaskDraft(taskId);

  if (!taskId) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <section className="mx-auto grid w-full max-w-4xl gap-6 rounded-[2rem] border border-slate-200 bg-white p-8">
          <SectionTitle
            eyebrow="Step 5"
            title="缺少任务上下文"
            description="请先从新建任务页创建任务，再进入简历编辑。"
          />
          <Link className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white" href="/tasks/new">
            返回新建任务
          </Link>
        </section>
      </main>
    );
  }

  if (!loaded || !draft) {
    return null;
  }

  if (!draft.jdAnalysis || !draft.matchAnalysis || !draft.resumeDraft) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <section className="mx-auto grid w-full max-w-4xl gap-6 rounded-[2rem] border border-slate-200 bg-white p-8">
          <SectionTitle
            eyebrow="Step 5"
            title="还没有可生成的简历"
            description="先完成 JD 拆解与匹配分析，再回来编辑导出简历。"
          />
          <Link className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white" href={withTaskId("/tasks/demo/analysis", taskId)}>
            前往匹配分析
          </Link>
        </section>
      </main>
    );
  }

  const analysis = draft.matchAnalysis;
  const resumeDraft = draft.resumeDraft;

  return (
    <main className="resume-page min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-6 py-10 text-slate-900">
      <section className="resume-layout mx-auto grid w-full max-w-[1400px] gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="resume-editor-panel rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <SectionTitle
            eyebrow="Step 5"
            title="简历编辑与导出"
            description="左侧继续编辑内容，右侧实时生成更适合演示和导出的 A4 简历版式。"
          />

          <div className="mt-8 grid gap-4">
            <FormField label="简历抬头">
              <TextArea
                className="min-h-20"
                onChange={(event) => {
                  const value = event.target.value;
                  updateDraft((current) => ({
                    ...current,
                    resumeDraft: {
                      ...(current.resumeDraft ?? resumeDraft),
                      headline: value,
                    },
                  }));
                }}
                value={resumeDraft.headline}
              />
            </FormField>
            <FormField label="职业摘要">
              <TextArea
                onChange={(event) => {
                  const value = event.target.value;
                  updateDraft((current) => ({
                    ...current,
                    resumeDraft: {
                      ...(current.resumeDraft ?? resumeDraft),
                      summary: value,
                    },
                  }));
                }}
                value={resumeDraft.summary}
              />
            </FormField>

            {resumeDraft.sections.map((section, index) => (
              <FormField key={section.title} label={section.title}>
                <TextArea
                  className="min-h-40"
                  onChange={(event) => {
                    const value = event.target.value;
                    updateDraft((current) => ({
                      ...current,
                      resumeDraft: {
                        ...(current.resumeDraft ?? resumeDraft),
                        sections: (current.resumeDraft ?? resumeDraft).sections.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, content: value } : item,
                        ),
                      },
                    }));
                  }}
                  value={section.content}
                />
              </FormField>
            ))}
          </div>
        </article>

        <aside className="resume-actions-panel rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_18px_60px_rgba(15,23,42,0.2)] xl:sticky xl:top-8 xl:self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">导出与提示</p>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-200">
            {analysis.atsTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>

          {error ? <p className="mt-5 text-sm leading-7 text-rose-200">{error}</p> : null}
          <p aria-live="polite" className="mt-5 min-h-7 text-sm leading-7 text-slate-300">
            {isSaving ? "简历修改正在同步到后端..." : null}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950"
              onClick={() => window.print()}
              type="button"
            >
              导出 PDF
            </button>
            <Link className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950" href="/">
              返回首页
            </Link>
            <Link className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white" href={withTaskId("/tasks/demo/analysis", taskId)}>
              返回分析页
            </Link>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8">
            <ResumePreview draft={draft} />
          </div>
        </aside>
      </section>
    </main>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={null}>
      <ResumePageContent />
    </Suspense>
  );
}