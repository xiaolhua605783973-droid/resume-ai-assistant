"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import { analyzeMatch, generateResumeDraft } from "@/lib/mvp-engine";
import { keySignals } from "@/lib/mvp-data";

export default function AnalysisPage() {
  const router = useRouter();
  const { draft, loaded, updateDraft } = useTaskDraft();

  if (!loaded) {
    return null;
  }

  if (!draft.jdAnalysis) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <section className="mx-auto grid w-full max-w-4xl gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <SectionTitle
            eyebrow="Step 4"
            title="还没有可分析的 JD"
            description="先回到上一步粘贴并解析目标 JD，才能生成匹配判断。"
          />
          <Link className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950" href="/tasks/demo/jd">
            返回 JD 拆解
          </Link>
        </section>
      </main>
    );
  }

  const analysis = draft.matchAnalysis ?? analyzeMatch(draft, draft.jdAnalysis);
  const columns = [
    { title: "已匹配项", items: analysis.matchedItems },
    { title: "缺失项", items: analysis.missingItems },
    { title: "风险项", items: analysis.riskItems },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto grid w-full max-w-6xl gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.24)] backdrop-blur">
        <SectionTitle
          eyebrow="Step 4"
          title="匹配分析结果"
          description={analysis.matchScoreLabel}
        />

        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((column) => (
            <article key={column.title} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">{column.title}</p>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-200">
                {column.items.length
                  ? column.items.map((item) => (
                      <li key={item.title}>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-slate-300">{item.reason}</p>
                      </li>
                    ))
                  : <li>当前没有明显内容。</li>}
              </ul>
            </article>
          ))}
        </div>

        <article className="rounded-[1.5rem] border border-cyan-400/30 bg-cyan-500/10 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">关键 Gap</p>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-cyan-50">
            {analysis.gapItems.map((item) => (
              <li key={item.title}>
                <p className="font-semibold">{item.title}</p>
                <p>{item.reason}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[1.5rem] border border-orange-400/30 bg-orange-500/10 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">核心约束</p>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-orange-50">
            {keySignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950"
            onClick={() => {
              updateDraft((current) => ({
                ...current,
                matchAnalysis: analysis,
                resumeDraft: generateResumeDraft(current, current.jdAnalysis!, analysis),
              }));
              router.push("/tasks/demo/resume");
            }}
            type="button"
          >
            下一步：简历编辑
          </button>
          <Link className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white" href="/tasks/demo/jd">
            返回JD拆解
          </Link>
        </div>
      </section>
    </main>
  );
}
