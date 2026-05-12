import Link from "next/link";
import { mvpRoutes } from "@/lib/mvp-data";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white selection:bg-cyan-100">
      {/* Background Decor - Increased contrast and visibility */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[80%] bg-cyan-200/30 blur-[130px] rounded-full" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[70%] bg-blue-200/20 blur-[110px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-24">
        {/* Navbar-ish Logo */}
        <nav className="absolute top-10 left-6 flex items-center gap-2 opacity-0 animate-reveal-fade">
           <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center shadow-lg shadow-slate-200">
              <span className="text-white font-bold text-xs">AI</span>
           </div>
           <span className="text-sm font-bold tracking-tighter text-slate-900 uppercase">ResuMate <span className="text-slate-400 font-medium">Copilot</span></span>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 border border-slate-100 mb-8 opacity-0 animate-reveal-up">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
               </span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">MVP v1.0 Live Now</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-950 leading-[1.05] mb-8 opacity-0 animate-reveal-up delay-150">
              让每一份简历，<br />
              都为 <span className="relative inline-block text-cyan-600">
                目标岗位
                <span className="absolute bottom-2 left-0 h-[8px] bg-cyan-100 -z-10 opacity-0 animate-draw-line delay-1000" />
              </span> 而生。
            </h1>

            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl mb-12 opacity-0 animate-reveal-up delay-300">
              不再盲目投递。输入你的经历与目标 JD，AI 助手将为你提供深度匹配诊断、ATS 优化建议，并一键生成高度定制的简历方案。
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 opacity-0 animate-reveal-up delay-500">
              <Link 
                href="/tasks/new" 
                className="group relative inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-10 py-5 text-base font-bold text-white transition-all hover:bg-cyan-500 hover:scale-[1.02] active:scale-95 shadow-xl shadow-cyan-100 ring-4 ring-cyan-500/10"
              >
                <span className="relative flex items-center">
                  立即开始 AI 优化
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </span>
              </Link>
              
              <Link 
                href="/tasks/demo/intake?taskId=demo-task-id" 
                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest px-4 py-2 border-b-2 border-transparent hover:border-slate-100"
              >
                查看演示案例
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl">
            <div className="relative group opacity-0 animate-reveal-right delay-700">
              {/* Floating Badge on Video */}
              <div className="absolute -top-4 -right-4 z-20 rounded-2xl bg-white p-4 shadow-2xl border border-slate-100 animate-bounce cursor-default">
                 <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md mb-1 uppercase tracking-tighter">AI Analysis</div>
                 <div className="text-slate-900 font-bold text-sm">Match Score: 96%</div>
              </div>

              {/* Browser Window Mockup */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_64px_-16px_rgba(15,23,42,0.1)] transition-all duration-700 group-hover:-translate-y-4 group-hover:rotate-1 group-hover:shadow-cyan-100/50">
                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div className="ml-4 h-4 w-48 rounded-md bg-slate-100 animate-pulse" />
                </div>
                <div className="aspect-[16/10] bg-slate-50 p-4">
                  <div className="relative h-full w-full rounded-lg border-2 border-dashed border-slate-200 bg-white/50 flex flex-col items-center justify-center gap-4 group/video cursor-pointer overflow-hidden">
                    {/* Pulsing rings for play button */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="h-24 w-24 rounded-full bg-cyan-400/10 animate-ping duration-[2000ms]" />
                    </div>

                    <div className="h-16 w-16 rounded-full bg-cyan-600/10 flex items-center justify-center text-cyan-600 transition-all duration-300 group-hover/video:scale-110 group-hover/video:bg-cyan-600 group-hover/video:text-white shadow-lg shadow-cyan-50 z-10">
                       <svg className="h-8 w-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5.14v14c0 .86.84 1.4 1.58.97l11-7a1 1 0 000-1.72l-11-7a1 1 0 00-1.58.75z" />
                       </svg>
                    </div>
                    <div className="text-center z-10">
                      <p className="text-sm font-bold text-slate-900">观看演示视频</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">ResuMate AI Workflow • 45s</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements behind the video */}
              <div className="absolute -bottom-10 -right-10 -z-10 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl transition-opacity group-hover:opacity-100 opacity-50 duration-700" />
              <div className="absolute -top-10 -left-10 -z-10 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl transition-opacity group-hover:opacity-100 opacity-30 duration-700" />
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mt-40 grid gap-8 md:grid-cols-3 opacity-0 animate-reveal-up delay-[1000ms]">
          {[
            {
              title: "JD 结构化拆解",
              desc: "不仅是匹配，更是洞察。深度解析 JD 背后的隐藏职责与硬性门槛。",
              icon: <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            },
            {
              title: "深度匹配诊断",
              desc: "精准识别经历与岗位的 Gap。区分优势区、缺失项与核心投递风险。",
              icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            },
            {
              title: "ATS 友好导出",
              desc: "自动填充关键关键词，优化排版。生成对招聘系统友好的定制化简历。",
              icon: <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            }
          ].map((feature, i) => (
            <article key={i} className="group rounded-[2rem] border border-slate-100 bg-slate-50/40 p-10 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-900 shadow-sm group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-4">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{feature.desc}</p>
            </article>
          ))}
        </section>

        {/* Floating Status Bar */}
        <footer className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Technology Stack</p>
              <div className="flex gap-4">
                 {['Next.js 15', 'Tailwind v4', 'OpenAI LLM'].map(stack => (
                   <span key={stack} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{stack}</span>
                 ))}
              </div>
           </div>
           <p className="text-[10px] font-medium text-slate-400">© 2024 ResuMate. All rights reserved.</p>
        </footer>
      </div>

      {/* Decorative Blur Object */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-slate-100/50 blur-[150px] rounded-full pointer-events-none" />
    </main>
  );
}
