import Link from "next/link";

import { SectionTitle } from "@/components/section-title";

const resumeBlocks = [
  "基础信息与抬头",
  "工作/实习经历改写结果",
  "项目经历改写结果",
  "技能与关键词补充",
  "ATS风险提示与导出入口",
];

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-6 py-10 text-slate-900">
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <SectionTitle
            eyebrow="Step 5"
            title="简历编辑与导出"
            description="先搭好一页简历工作区。正式开发时这里会接入段落级编辑、内容锁定和 PDF 导出。"
          />

          <div className="mt-8 grid gap-4">
            {resumeBlocks.map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </article>

        <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_18px_60px_rgba(15,23,42,0.2)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">后续接入点</p>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-200">
            <li>原文与优化文对照</li>
            <li>ATS关键词覆盖检测</li>
            <li>段落锁定后重新生成</li>
            <li>版本快照与PDF导出</li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
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