"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { GlobalStepper } from "@/components/global-stepper";
import { SectionTitle } from "@/components/section-title";
import { createTask, withTaskId } from "@/lib/mvp-api";
import { mvpFlow } from "@/lib/mvp-data";

export default function NewTaskPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <GlobalStepper />
      
      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <SectionTitle
            eyebrow="Step 1"
            title="初始化个性化简历定制任务"
            description="针对具体岗位进行深度定制，这是从海投转向精投的第一步。"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {mvpFlow.map((item, index) => (
              <article
                key={item.title}
                className="group rounded-[1.5rem] border border-slate-100 bg-slate-50/50 p-6 transition-all hover:border-cyan-200 hover:bg-white hover:shadow-md"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 shadow-sm transition-colors">
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-6 border-t border-slate-100 pt-8">
            <Link
              className="px-4 py-2 text-sm font-bold text-slate-400 transition hover:text-slate-900 hover:underline underline-offset-8"
              href="/"
            >
              ← 取消并返回首页
            </Link>
            <button
              className="rounded-full bg-slate-950 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-slate-200 ring-offset-2 transition-all hover:bg-slate-800 active:scale-95"
              onClick={async () => {
                const response = await createTask();
                router.push(withTaskId("/tasks/demo/intake", response.task.id));
              }}
              type="button"
            >
              创建任务并开始录入
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
