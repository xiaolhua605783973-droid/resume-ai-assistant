"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { SectionTitle } from "@/components/section-title";
import { useTaskDraft } from "@/hooks/use-task-draft";
import { mvpFlow } from "@/lib/mvp-data";

export default function NewTaskPage() {
  const router = useRouter();
  const { restartDraft } = useTaskDraft();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf5_0%,_#fff7ed_100%)] px-6 py-10 text-slate-900">
      <section className="mx-auto grid w-full max-w-5xl gap-8 rounded-[2rem] border border-orange-100 bg-white p-8 shadow-[0_18px_60px_rgba(148,64,14,0.08)]">
        <SectionTitle
          eyebrow="Step 1"
          title="新建一次JD定制简历任务"
          description="当前先跑通单个目标JD的闭环。先录入经历，再做JD拆解与简历改写。"
        />

        <div className="grid gap-4 md:grid-cols-2">
          {mvpFlow.map((item, index) => (
            <article
              key={item.title}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-sm font-semibold text-orange-700">0{index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={() => {
              restartDraft();
              router.push("/tasks/demo/intake");
            }}
            type="button"
          >
            进入经历录入
          </button>
          <Link
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            href="/"
          >
            返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}
