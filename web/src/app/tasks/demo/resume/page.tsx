"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { FormField, TextArea } from "@/components/form-field";
import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import { withTaskId } from "@/lib/mvp-api";
import { GlobalStepper } from "@/components/global-stepper";
import type { ResumeSection, TaskDraft } from "@/lib/mvp-types";

const MAX_SUMMARY_LENGTH = 220;
const MAX_SECTION_BLOCKS: Record<string, number> = {
  "工作经历": 3,
  "工作/实习经历": 3,
  "项目经历": 3,
  "技能与关键词": 5,
  "技能": 5,
};

const MAX_SECTION_DETAIL_LINES: Record<string, number> = {
  "工作经历": 5,
  "工作/实习经历": 5,
  "项目经历": 5,
  "技能与关键词": 5,
  "技能": 5,
};

const normalizePreviewLine = (line: string) =>
  line
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/[|｜]\s+/g, " | ")
    .replace(/^[•*-]\s*/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const normalizePreviewContent = (content: string) =>
  content
    .replace(/\s+-\s+/g, "\n- ")
    .replace(/\s+(结果：|背景：|贡献：|成果：|角色：|建议强调：|技术专长：|项目成果：|工具开发：)/g, "\n$1")
    .replace(/\s+(?=\*\*)/g, "\n")
    .trim();

const clampSummary = (summary: string) => {
  const normalizedSummary = normalizePreviewLine(summary);

  if (normalizedSummary.length <= MAX_SUMMARY_LENGTH) {
    return normalizedSummary;
  }

  return `${normalizedSummary.slice(0, MAX_SUMMARY_LENGTH).trimEnd()}...`;
};

const splitContentBlocks = (content: string) =>
  normalizePreviewContent(content)
    .split(/\n{2,}/)
    .map((block) => block.split("\n").map(normalizePreviewLine).filter(Boolean))
    .filter((block) => block.length > 0);

const getPreviewBlocks = (section: ResumeSection) => {
  const limit = MAX_SECTION_BLOCKS[section.title] ?? 3;
  const detailLimit = MAX_SECTION_DETAIL_LINES[section.title] ?? 5;

  return splitContentBlocks(section.content)
    .slice(0, limit)
    .map((block) => {
      const [heading, ...details] = block;
      const limitedDetails = details.slice(0, detailLimit).map((line) => line.replace(/^[•*-]\s*/, ""));
      return [heading, ...limitedDetails];
    });
};

const shouldRenderInPrintableResume = (section: ResumeSection) => !section.title.includes("ATS");

const buildPrintFileName = (draft: TaskDraft) => {
  const dateToken = new Date().toISOString().slice(0, 10);
  const hasName = Boolean(draft.basicInfo.name?.trim());
  return hasName ? `resume-export-${dateToken}` : "resume-export";
};

const handlePrintResume = (draft: TaskDraft) => {
  const originalTitle = document.title;
  const printTitle = buildPrintFileName(draft);
  document.title = printTitle;

  const restoreTitle = () => {
    document.title = originalTitle;
    window.removeEventListener("afterprint", restoreTitle);
  };

  window.addEventListener("afterprint", restoreTitle);
  window.print();

  window.setTimeout(() => {
    restoreTitle();
  }, 1500);
};

function ResumePreviewSection({ section }: { section: ResumeSection }) {
  const blocks = getPreviewBlocks(section);

  return (
    <section className="break-inside-avoid">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-950">{section.title}</h2>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <div className="mt-3 grid gap-4 text-[13px] leading-[1.55] text-slate-700">
        {blocks.length ? (
          blocks.map((block, index) => {
            const [heading, ...details] = block;
            const hasDetailLines = details.length > 0;

            return (
              <div key={`${section.title}-${index}`} className="break-inside-avoid">
                {hasDetailLines ? <p className="mb-1.5 border-l-2 border-cyan-500 pl-3 font-bold text-slate-900">{heading}</p> : null}

                {hasDetailLines ? (
                  <ul className="grid gap-1 pl-4 text-slate-600">
                    {details.map((line) => (
                      <li key={line} className="list-disc marker:text-cyan-500/50">
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={heading.includes("：") ? "text-slate-500" : ""}>{heading}</p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-slate-400 italic">待补充内容...</p>
        )}
      </div>
    </section>
  );
}

function ResumePreviewPageContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const { draft, loaded, error, isSaving, updateDraft } = useTaskDraft(taskId);

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
              eyebrow="Step 5"
              title="缺少任务上下文"
              description="请先回到首页创建任务并完成前面的分析流程。"
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

  if (!draft.resumeDraft) {
     return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <GlobalStepper />
        <div className="mx-auto max-w-4xl px-6 py-20">
          <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <SectionTitle
              eyebrow="Phase 5"
              title="待匹配分析完成"
              description="简历草稿将根据你的经历与 JD 匹配报告自动生成。请先完成上一步。"
            />
            <Link className="mx-auto mt-4 rounded-full bg-slate-950 px-10 py-3 text-sm font-bold text-white shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95" href={withTaskId("/tasks/demo/analysis", taskId)}>
              前往匹配分析 →
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const { resumeDraft } = draft;
  const printableSections = resumeDraft.sections.filter(shouldRenderInPrintableResume);

  const contactItems = [
    draft.basicInfo.phone,
    draft.basicInfo.email,
    draft.basicInfo.city,
    draft.basicInfo.educationLevel,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100 pb-20">
      <GlobalStepper />
      
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[400px_1fr] gap-10 items-start">
          
          {/* Left Side: Editor */}
          <aside className="w-full space-y-6 lg:sticky lg:top-24">
             <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <SectionTitle
                  eyebrow="RESUME BUILDER"
                  title="简历内容精修"
                  description="左侧输入框支持实时修改。右侧 A4 画布会自动应用你的更改。"
                />
                
                <div className="mt-8 grid gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <FormField label="岗位定向抬头">
                    <TextArea
                      className="min-h-16 rounded-xl border-slate-100 bg-slate-50/50 p-4 text-sm"
                      onChange={(event) => {
                        updateDraft((current) => ({
                          ...current,
                          resumeDraft: { ...(current.resumeDraft!), headline: event.target.value },
                        }));
                      }}
                      value={resumeDraft.headline}
                    />
                  </FormField>
                  
                  <FormField label="职业总结 (Summary)">
                    <TextArea
                      className="min-h-32 rounded-xl border-slate-100 bg-slate-50/50 p-4 text-sm leading-relaxed"
                      onChange={(event) => {
                        updateDraft((current) => ({
                          ...current,
                          resumeDraft: { ...(current.resumeDraft!), summary: event.target.value },
                        }));
                      }}
                      value={resumeDraft.summary}
                    />
                  </FormField>

                   {resumeDraft.sections.map((section, index) => (
                    <FormField key={section.title} label={section.title}>
                      <TextArea
                        className="min-h-48 rounded-xl border-slate-100 bg-slate-50/50 p-4 text-xs leading-relaxed font-mono"
                        onChange={(event) => {
                          const value = event.target.value;
                          updateDraft((current) => ({
                            ...current,
                            resumeDraft: {
                              ...(current.resumeDraft!),
                              sections: current.resumeDraft!.sections.map((item, itemIndex) =>
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

                <div className="mt-8 pt-6 border-t border-slate-100 grid gap-4">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <span>本地缓存状态</span>
                    {isSaving ? (
                      <span className="flex items-center gap-1.5 text-cyan-500">
                        <span className="h-1 w-1 animate-ping rounded-full bg-cyan-500" />
                        缓存中...
                      </span>
                    ) : (
                      <span className="text-emerald-500">已自动缓存 (本地)</span>
                    )}
                  </div>

                  <button 
                    className="w-full rounded-2xl bg-slate-950 py-4 text-sm font-bold text-white shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all text-center"
                    onClick={() => handlePrintResume(draft)}
                  >
                    下载 PDF (Ctrl + P)
                  </button>
                  
                  <Link 
                    className="w-full text-center rounded-2xl border-2 border-slate-100 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all font-mono"
                    href="/tasks/new"
                  >
                    确认完成并退出
                  </Link>
                </div>
             </section>

             {draft.matchAnalysis?.atsTips && (
               <section className="rounded-[2.5rem] border border-cyan-100 bg-cyan-50/30 p-8">
                  <h4 className="flex items-center gap-2 text-[10px] font-bold text-cyan-900 mb-4 tracking-widest uppercase">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    ATS 加分建议
                  </h4>
                  <ul className="grid gap-3 text-xs leading-relaxed text-cyan-800/70">
                    {draft.matchAnalysis.atsTips.map(tip => (
                      <li key={tip} className="flex items-start gap-2">
                         <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-300" />
                         {tip}
                      </li>
                    ))}
                  </ul>
               </section>
             )}
          </aside>

          {/* Right Side: Resume Canvas */}
          <div className="flex-1 w-full flex justify-center py-4">
             <article className="resume-paper w-full max-w-[800px] bg-white shadow-[0_45px_100px_rgba(15,23,42,0.1)] rounded-sm border border-slate-100 min-h-[1131px] p-[1.35cm] lg:p-[1.7cm] print:p-0 print:m-0 print:shadow-none print:border-none animate-in fade-in slide-in-from-bottom-8 duration-1000 [font-family:var(--font-noto-sans-sc),PingFang_SC,Hiragino_Sans_GB,Microsoft_YaHei,sans-serif]">
               <header className="mb-8 border-b-2 border-slate-900 pb-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h1 className="text-[2rem] font-bold tracking-tight text-slate-950">
                        {draft.basicInfo.name || "姓名"}
                      </h1>
                      <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.28em] text-cyan-600">
                        {resumeDraft.headline || "定向岗位目标"}
                      </p>
                    </div>

                    {contactItems.length ? (
                      <ul className="grid gap-1 text-[11px] font-medium text-slate-500 md:text-right">
                        {contactItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <p className="mt-6 border-l-4 border-slate-100 pl-5 text-[12.5px] font-medium italic leading-[1.55] text-slate-600">
                    {clampSummary(resumeDraft.summary)}
                  </p>
                </header>

                <div className="grid gap-6">
                  {printableSections.map((section) => (
                    <ResumePreviewSection key={section.title} section={section} />
                  ))}
                </div>
             </article>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; background: white !important; }
          .resume-paper, .resume-paper * { visibility: visible !important; }
          .resume-paper { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 210mm !important; 
            min-height: 297mm !important; 
            padding: 2cm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .GlobalStepper, aside, header, footer { display: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </main>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={null}>
      <ResumePreviewPageContent />
    </Suspense>
  );
}
