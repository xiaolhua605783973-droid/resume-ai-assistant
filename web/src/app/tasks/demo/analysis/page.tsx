"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import { withTaskId } from "@/lib/mvp-api";
import { keySignals } from "@/lib/mvp-data";
import { GlobalStepper } from "@/components/global-stepper";

function AnalysisPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const { draft, loaded, error, isAnalyzing, requestAnalysis } = useTaskDraft(taskId);

  if (!taskId) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <GlobalStepper />
        <div className="mx-auto max-w-4xl px-6 py-20">
          <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
            <SectionTitle
              eyebrow="Step 4"
              title="缺少任务上下文"
              description="请先回到新建任务页创建一个服务端任务。"
            />
            <Link className="mx-auto mt-4 rounded-full bg-white px-8 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100" href="/tasks/new">
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

  if (!draft.jdAnalysis) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <GlobalStepper />
        <div className="mx-auto max-w-4xl px-6 py-20">
          <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center backdrop-blur shadow-2xl shadow-cyan-900/20">
            <SectionTitle
              eyebrow="Step 4"
              title="还没有可分析的 JD"
              description="先回到上一步粘贴并解析目标 JD，才能生成匹配判断。"
            />
            <Link className="mx-auto mt-4 rounded-full bg-white px-8 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100" href={withTaskId("/tasks/demo/jd", taskId)}>
              ← 返回 JD 拆解
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (!draft.matchAnalysis) {
    return (
      <main className="min-h-screen bg-slate-950 text-white font-sans">
        <GlobalStepper />
        <div className="mx-auto max-w-4xl px-6 py-20">
          <section className="grid gap-8 rounded-[3rem] border border-white/10 bg-white/5 p-12 text-center backdrop-blur shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/20">
              <svg className="h-10 w-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <SectionTitle
              eyebrow="Step 4"
              title="生成匹配判断报告"
              description="AI 将根据你的简历与目标 JD 的契合度，给出多维度的优劣势分析报告。"
            />
            <button
               className="mx-auto rounded-full bg-cyan-500 px-12 py-4 text-sm font-bold text-white shadow-xl shadow-cyan-900/40 transition hover:bg-cyan-400 active:scale-95"
               onClick={async () => {
                 await requestAnalysis();
               }}
               type="button"
            >
              立即生成分析报告
            </button>
          </section>
        </div>
      </main>
    );
  }

  const analysis = draft.matchAnalysis;
  const columns = [
    { title: "优势区", items: analysis.matchedItems, color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" },
    { title: "待优化", items: analysis.missingItems, color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/20" },
    { title: "高风险", items: analysis.riskItems, color: "text-rose-400", bg: "bg-rose-400/5", border: "border-rose-400/20" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 pb-20 text-white selection:bg-cyan-500/30">
      <GlobalStepper />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-12 rounded-[3.5rem] border border-white/10 bg-white/5 p-10 shadow-[0_28px_100px_rgba(0,0,0,0.4)] backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-cyan-600/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-purple-600/10 blur-[100px]" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
            <div className="max-w-2xl">
               <SectionTitle
                  eyebrow="AI MATCH REPORT"
                  title="简历匹配度深度诊断"
                  description={analysis.matchScoreLabel}
                />
            </div>
            <div className="flex items-center gap-4">
               <button
                  className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95"
                  onClick={() => requestAnalysis()}
                >
                  <svg className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  重新生成报表
                </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {columns.map((column) => (
              <article key={column.title} className={`rounded-[2rem] border ${column.border} ${column.bg} p-8 flex flex-col`}>
                <div className="flex items-center gap-3 mb-6">
                   <span className={`h-1.5 w-1.5 rounded-full ${column.color.replace("text", "bg")}`} />
                   <p className={`text-xs font-bold uppercase tracking-[0.3em] ${column.color}`}>{column.title}</p>
                </div>
                <ul className="grid gap-6 text-sm flex-1">
                  {column.items.length
                    ? column.items.map((item) => (
                        <li key={item.title} className="group transition-all">
                          <p className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wider text-[11px] mb-1">{item.title}</p>
                          <p className="text-slate-400 leading-7 text-xs">{item.reason}</p>
                        </li>
                      ))
                    : <li className="text-slate-500 italic text-xs">通过深度评估未发现显著特征</li>}
                </ul>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-cyan-400/30 bg-cyan-500/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <svg className="h-24 w-24 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="h-4 w-1 rounded-full bg-cyan-400" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">关键能力 Gap</p>
              </div>
              <ul className="grid gap-6 text-sm leading-7">
                {analysis.gapItems.map((item) => (
                  <li key={item.title}>
                    <p className="font-bold text-white text-xs mb-1">差距：{item.title}</p>
                    <p className="text-cyan-100/60 text-xs leading-relaxed">{item.reason}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[2rem] border border-orange-400/30 bg-orange-500/5 p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="h-4 w-1 rounded-full bg-orange-400" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-200">系统核心约束</p>
              </div>
              <ul className="grid gap-3">
                {keySignals.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-xs leading-relaxed text-orange-100/60">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-400/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-white/5 pt-10">
            <Link 
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors" 
              href={withTaskId("/tasks/demo/jd", taskId)}
            >
              ← 返回修正 JD
            </Link>
            <button
              className="rounded-full bg-white px-12 py-4 text-sm font-bold text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:scale-105 active:scale-95"
              onClick={async () => {
                const nextTask = await requestAnalysis();
                if (nextTask?.draft.resumeDraft) {
                  router.push(withTaskId("/tasks/demo/resume", taskId));
                }
              }}
              type="button"
            >
              {isAnalyzing ? "正在准备简历方案..." : "下一步：生成个性化简历初稿 →"}
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={null}>
      <AnalysisPageContent />
    </Suspense>
  );
}
