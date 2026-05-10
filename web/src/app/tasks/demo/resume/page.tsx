"use client";

import Link from "next/link";

import { FormField, TextArea } from "@/components/form-field";
import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import { analyzeMatch, generateResumeDraft } from "@/lib/mvp-engine";

export default function ResumePage() {
  const { draft, loaded, updateDraft } = useTaskDraft();

  if (!loaded) {
    return null;
  }

  if (!draft.jdAnalysis) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <section className="mx-auto grid w-full max-w-4xl gap-6 rounded-[2rem] border border-slate-200 bg-white p-8">
          <SectionTitle
            eyebrow="Step 5"
            title="还没有可生成的简历"
            description="先完成 JD 拆解与匹配分析，再回来编辑导出简历。"
          />
          <Link className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white" href="/tasks/demo/analysis">
            前往匹配分析
          </Link>
        </section>
      </main>
    );
  }

  const analysis = draft.matchAnalysis ?? analyzeMatch(draft, draft.jdAnalysis);
  const resumeDraft = draft.resumeDraft ?? generateResumeDraft(draft, draft.jdAnalysis, analysis);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-6 py-10 text-slate-900">
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <SectionTitle
            eyebrow="Step 5"
            title="简历编辑与导出"
            description="当前已经能基于你的输入和 JD 分析结果生成可编辑简历，并可直接导出为浏览器 PDF。"
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

        <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_18px_60px_rgba(15,23,42,0.2)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">导出与提示</p>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-200">
            {analysis.atsTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>

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
            <Link className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white" href="/tasks/demo/analysis">
              返回分析页
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}