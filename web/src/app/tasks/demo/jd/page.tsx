"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { FormField, TextArea } from "@/components/form-field";
import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import { withTaskId } from "@/lib/mvp-api";
import { GlobalStepper } from "@/components/global-stepper";

function JobDescriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const { draft, loaded, error, isAnalyzing, isSaving, updateDraft, requestAnalysis } =
    useTaskDraft(taskId);

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
              description="请先创建任务并录入经历，再进行 JD 分析。"
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <GlobalStepper />
      
      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <SectionTitle
              eyebrow="Step 3"
              title="JD 输入与结构化拆解"
              description="在这里粘贴目标岗位 JD 原文。AI 会精确提取职责核心、硬性要求及关键词。"
            />
            <div className="flex flex-col items-end gap-2 shrink-0">
               <div className="flex h-9 items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 border border-slate-100">
                {isSaving ? (
                  <span className="flex items-center gap-1.5 text-cyan-600 font-bold">
                    <span className="h-1 w-1 animate-ping rounded-full bg-cyan-500" />
                    正在自动缓存...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    会话草稿已安全缓存
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800">目标岗位 JD 原文</label>
                <button
                  type="button"
                  onClick={() => {
                    updateDraft((current) => ({
                      ...current,
                      jdText: "岗位职责：\n1. 负责AI相关产品的规划与设计，推动产品从0到1或从1到10的演进；\n2. 深入理解大模型能力边界，结合业务场景探索AI产品化落地机会；\n3. 与算法、研发团队紧密合作，推进模型效果评估和产品迭代；\n4. 关注行业动态，持续跟踪AIGC前沿技术和竞品策略。\n\n任职要求：\n1. 本科及以上学历，3年以上互联网产品经理经验，有AI/大模型/搜索推荐相关产品经验者优先；\n2. 对AIGC有强烈兴趣，深度体验过主流AI产品；\n3. 具备极强的逻辑思维能力和数据敏感度，能通过数据发现问题并驱动产品优化；\n4. 优秀的沟通协调能力与抗压能力，能独立推动复杂跨团队项目落地。",
                      jdAnalysis: null,
                      matchAnalysis: null,
                      resumeDraft: null,
                    }));
                  }}
                  className="text-[11px] font-bold text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-full hover:bg-cyan-100 transition-colors"
                >
                  💡 一键填入「AI产品经理」JD 示例
                </button>
              </div>
              <p className="text-xs text-slate-500">建议包含岗位职责、任职要求、加分项等完整内容。</p>
              <TextArea
                className="min-h-64 rounded-2xl border-slate-200 bg-slate-50/30 p-5 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 transition-all font-mono text-sm leading-relaxed"
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
                placeholder="在此粘贴岗位 JD..."
                value={draft.jdText}
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <Link
                className="rounded-full px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 active:scale-95"
                href={withTaskId("/tasks/demo/intake", taskId)}
              >
                ← 返回修改经历
              </Link>
              <div className="flex gap-4">
                <button
                  className={`rounded-full px-10 py-3 text-sm font-bold border-2 transition-all active:scale-95 ${
                    draft.jdText.trim().length < 40 
                      ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed" 
                      : "border-slate-950 bg-white text-slate-950 hover:bg-slate-50 shadow-sm"
                  }`}
                  disabled={isAnalyzing || draft.jdText.trim().length < 40}
                  onClick={async () => {
                    await requestAnalysis();
                  }}
                  type="button"
                >
                  {isAnalyzing ? "正在进行 AI 深度拆解..." : "开始 AI 结构化拆解"}
                </button>
                {draft.jdAnalysis && (
                  <button
                    className="rounded-full bg-slate-950 px-10 py-3 text-sm font-bold text-white shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95"
                    onClick={() => router.push(withTaskId("/tasks/demo/analysis", taskId))}
                    type="button"
                  >
                    进行匹配分析 →
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
              ⚠️ {error}
            </div>
          )}

          {!draft.jdAnalysis && draft.jdText.trim().length > 0 && draft.jdText.trim().length < 40 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-700">
              💡 JD 内容过短，AI 无法进行完整分析。请至少补充 40 字以上的职位描述。
            </div>
          )}

          {draft.jdAnalysis && (
            <div className="grid gap-x-6 gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <article className="rounded-[1.5rem] border border-slate-100 bg-slate-50/50 p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-4 w-1 rounded-full bg-cyan-500" />
                  <h3 className="text-sm font-bold text-slate-950 uppercase tracking-widest">岗位情报概述</h3>
                </div>
                <p className="text-sm leading-8 text-slate-600 font-medium">{draft.jdAnalysis.summary}</p>
              </article>

              <div className="grid gap-6 md:grid-cols-2">
                {[
                  { label: "核心职责", value: draft.jdAnalysis.coreResponsibilities, color: "bg-blue-500" },
                  { label: "硬性门槛", value: draft.jdAnalysis.hardRequirements, color: "bg-rose-500" },
                  { label: "加分项", value: draft.jdAnalysis.bonusItems, color: "bg-emerald-500" },
                  { label: "ATS 关键词", value: draft.jdAnalysis.atsKeywords, color: "bg-purple-500" },
                ].map((item) => (
                  <article key={item.label} className="group rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <span className={`h-3 w-3 rounded-md ${item.color}`} />
                      <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest">{item.label}</h3>
                    </div>
                    <ul className="grid gap-3 text-sm leading-relaxed text-slate-600">
                      {item.value.length ? (
                        item.value.map((value) => (
                          <li key={value} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                            <span>{value}</span>
                          </li>
                        ))
                      ) : (
                        <li className="italic text-slate-400">暂无明确识别</li>
                      )}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
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
