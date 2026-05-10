import Link from "next/link";

import { SectionTitle } from "@/components/section-title";

const jdCards = [
  { label: "核心职责", value: "负责目标岗位的关键任务拆解与协同推进。" },
  { label: "硬性门槛", value: "2年以上经验、SQL或数据分析能力、跨团队推进经验。" },
  { label: "加分项", value: "ToB项目经验、AI工具应用经验、流程优化案例。" },
  { label: "ATS关键词", value: "数据分析、项目推进、跨部门协作、复盘、需求拆解。" },
];

export default function JobDescriptionPage() {
  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10 text-slate-900">
      <section className="mx-auto grid w-full max-w-5xl gap-8 rounded-[2rem] border border-orange-100 bg-white p-8 shadow-[0_18px_60px_rgba(194,65,12,0.1)]">
        <SectionTitle
          eyebrow="Step 3"
          title="JD输入与结构化拆解"
          description="当前先用静态结果占位。正式开发时会接入文本输入、结构化解析和用户修正。"
        />

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
          目标JD输入框区域：用于粘贴岗位原文，并在信息不完整时给出错误提示。
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {jdCards.map((item) => (
            <article key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-orange-700">{item.label}</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Link className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white" href="/tasks/demo/analysis">
            下一步：匹配分析
          </Link>
          <Link className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700" href="/tasks/demo/intake">
            返回经历录入
          </Link>
        </div>
      </section>
    </main>
  );
}
