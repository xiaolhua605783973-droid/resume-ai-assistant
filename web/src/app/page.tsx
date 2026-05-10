import Link from "next/link";

import { mvpRoutes } from "@/lib/mvp-data";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_#fffaf5_0%,_#fff7ed_40%,_#fef3c7_100%)] px-6 py-10 text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(90deg,rgba(15,23,42,0.04)_0,rgba(15,23,42,0)_20%,rgba(15,23,42,0)_80%,rgba(15,23,42,0.04)_100%)]" />

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_20px_70px_rgba(148,64,14,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">
              JD-Driven Resume Copilot
            </p>
            <h1 className="font-serif text-3xl leading-tight md:text-5xl">
              AI求职简历决策助手
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              围绕目标JD，快速判断能不能投、差在哪里、简历该怎么改。
            </p>
          </div>

          <div className="grid gap-3 rounded-[1.5rem] bg-slate-950 p-5 text-sm text-slate-200 md:min-w-72">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300">
              当前开发目标
            </p>
            <p className="text-lg font-semibold text-white">
              先跑通“单个JD定制简历”闭环
            </p>
            <p className="leading-6 text-slate-300">
              输入经历与目标JD，输出拆解结果、匹配判断、ATS提示和可导出的简历初稿。
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] border border-orange-100 bg-white p-7 shadow-[0_18px_60px_rgba(148,64,14,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  产品主链路
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  从目标JD反推简历改写
                </h2>
              </div>
              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-900">
                V0.1 MVP
              </span>
            </div>

            <ol className="grid gap-4">
              {[
                "录入基础信息、工作/项目经历，或上传旧简历解析。",
                "粘贴目标岗位JD，结构化拆出职责、门槛和关键词。",
                "对比经历与JD，输出匹配项、缺失项与风险项。",
                "生成一版可投递简历，并提示ATS风险与关键Gap。",
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                    0{index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-700 md:text-base">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </article>

          <aside className="grid gap-6">
            <article className="rounded-[2rem] border border-slate-200 bg-[#102a43] p-7 text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                首批页面
              </p>
              <div className="mt-4 grid gap-3">
                {mvpRoutes.map((route) => (
                  <Link
                    key={route.href}
                    className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                    href={route.href}
                  >
                    <p className="text-sm font-semibold text-white">{route.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{route.description}</p>
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-orange-200 bg-white/90 p-7 shadow-[0_18px_60px_rgba(194,65,12,0.12)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                开发环境状态
              </p>
              <dl className="mt-4 grid gap-3 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-orange-50 px-4 py-3">
                  <dt>本地 Node 工具链</dt>
                  <dd className="font-semibold text-orange-900">已落在 .tools/node</dd>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <dt>前端脚手架</dt>
                  <dd className="font-semibold text-slate-900">Next.js 16 + TS</dd>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <dt>下一步</dt>
                  <dd className="font-semibold text-slate-900">补页面壳与接口契约</dd>
                </div>
              </dl>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
