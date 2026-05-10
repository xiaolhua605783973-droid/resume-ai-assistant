"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { FormField, TextArea } from "@/components/form-field";
import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import { withTaskId } from "@/lib/mvp-api";

function JobDescriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const { draft, loaded, error, isAnalyzing, isSaving, updateDraft, requestAnalysis } =
    useTaskDraft(taskId);

  if (!taskId) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-6 py-10 text-slate-900">
        <section className="mx-auto grid w-full max-w-4xl gap-6 rounded-[2rem] border border-orange-100 bg-white p-8">
          <SectionTitle
            eyebrow="Step 3"
            title="缺少任务上下文"
            description="请先创建任务并录入经历，再进行 JD 分析。"
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

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10 text-slate-900">
      <section className="mx-auto grid w-full max-w-5xl gap-8 rounded-[2rem] border border-orange-100 bg-white p-8 shadow-[0_18px_60px_rgba(194,65,12,0.1)]">
        <SectionTitle
          eyebrow="Step 3"
          title="JD输入与结构化拆解"
          description="在这里粘贴目标岗位 JD。系统会把它拆成职责、门槛、关键词和投递风险。"
        />

        <FormField
          hint="建议直接粘贴完整 JD 文本，至少包含岗位职责和任职要求。"
          label="目标岗位 JD"
        >
          <TextArea
            className="min-h-56"
            onChange={(event) => {
              const value = event.target.value;
              updateDraft((current) => ({
                ...current,
                jdText: value,
                jdAnalysis: null,
                matchAnalysis: null,
                resumeDraft: null,
              }));
            }}
            placeholder="请粘贴岗位 JD 原文，例如岗位职责、任职要求、加分项等。"
            value={draft.jdText}
          />
        </FormField>

        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
            onClick={async () => {
              if (draft.jdText.trim().length < 40) {
                return;
              }

              await requestAnalysis();
            }}
            type="button"
          >
            {isAnalyzing ? "解析中..." : "解析 JD"}
          </button>
          <button
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            onClick={() => {
              if (!draft.jdAnalysis) {
                return;
              }
              router.push(withTaskId("/tasks/demo/analysis", taskId));
            }}
            type="button"
          >
            下一步：匹配分析
          </button>
        </div>

        {error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm leading-7 text-rose-700">
            {error}
          </div>
        ) : null}

        {isSaving ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            JD 草稿正在同步到后端...
          </div>
        ) : null}

        {!draft.jdAnalysis && draft.jdText.trim().length > 0 && draft.jdText.trim().length < 40 ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm leading-7 text-rose-700">
            JD 文本太短，暂时无法可靠拆解。至少补充岗位职责和任职要求后再继续。
          </div>
        ) : null}

        {draft.jdAnalysis ? (
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 md:col-span-2">
              <p className="text-sm font-semibold text-orange-700">岗位概述</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{draft.jdAnalysis.summary}</p>
            </article>
            {[
              { label: "核心职责", value: draft.jdAnalysis.coreResponsibilities },
              { label: "硬性门槛", value: draft.jdAnalysis.hardRequirements },
              { label: "加分项", value: draft.jdAnalysis.bonusItems },
              { label: "ATS关键词", value: draft.jdAnalysis.atsKeywords },
            ].map((item) => (
              <article key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-orange-700">{item.label}</p>
                <ul className="mt-3 grid gap-2 text-sm leading-7 text-slate-700">
                  {item.value.length ? item.value.map((value) => <li key={value}>{value}</li>) : <li>暂无</li>}
                </ul>
              </article>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-4">
          <Link className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700" href={withTaskId("/tasks/demo/intake", taskId)}>
            返回经历录入
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function JobDescriptionPage() {
  return (
    <Suspense fallback={null}>
      <JobDescriptionPageContent />
    </Suspense>
  );
}
