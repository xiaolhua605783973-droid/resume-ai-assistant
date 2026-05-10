import Link from "next/link";

import { SectionTitle } from "@/components/section-title";

const intakeSections = [
  "基础信息：姓名、联系方式、学历、工作年限、所在城市。",
  "工作/实习经历：职责、成果、时间范围。",
  "项目经历：背景、角色、个人贡献、结果产出。",
  "技能与证书：工具、语言、证书、补充说明。",
];

export default function IntakePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <section className="mx-auto grid w-full max-w-5xl gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <SectionTitle
          eyebrow="Step 2"
          title="经历录入与简历解析确认"
          description="这里先做页面骨架。正式开发时会接入表单状态、简历解析和草稿保存。"
        />

        <div className="grid gap-4 md:grid-cols-2">
          {intakeSections.map((item) => (
            <article key={item} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-700">{item}</p>
            </article>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-dashed border-orange-300 bg-orange-50 p-5 text-sm leading-7 text-orange-900">
          上传旧简历、解析低置信度字段高亮、信息完整度提示，都会在这个页面组里完成。
        </div>

        <div className="flex flex-wrap gap-4">
          <Link className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white" href="/tasks/demo/jd">
            下一步：JD拆解
          </Link>
          <Link className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700" href="/tasks/new">
            返回上一步
          </Link>
        </div>
      </section>
    </main>
  );
}
