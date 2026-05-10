import Link from "next/link";

import { SectionTitle } from "@/components/section-title";
import { keySignals } from "@/lib/mvp-data";

const columns = {
  matched: ["具备跨部门协同经验", "简历中已有项目推进场景", "存在基础数据分析表述"],
  missing: ["SQL 使用场景不清晰", "成果量化不足", "没有直接体现复盘方法"],
  risks: ["工作年限与JD门槛接近下限", "经历表述偏职责，缺少结果", "关键词命中不稳定"],
};

export default function AnalysisPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto grid w-full max-w-6xl gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.24)] backdrop-blur">
        <SectionTitle
          eyebrow="Step 4"
          title="匹配分析结果"
          description="这一页会是 MVP 的解释层核心。正式开发时每一项都要能展开查看依据。"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(columns).map(([key, items]) => (
            <article key={key} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">{key}</p>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-200">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <article className="rounded-[1.5rem] border border-orange-400/30 bg-orange-500/10 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">核心约束</p>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-orange-50">
            {keySignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <div className="flex flex-wrap gap-4">
          <Link className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950" href="/tasks/demo/resume">
            下一步：简历编辑
          </Link>
          <Link className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white" href="/tasks/demo/jd">
            返回JD拆解
          </Link>
        </div>
      </section>
    </main>
  );
}
