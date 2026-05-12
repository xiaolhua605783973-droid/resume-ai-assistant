"use client";

import { usePathname } from "next/navigation";

export type Step = {
  id: number;
  label: string;
  path: string;
};

const steps: Step[] = [
  { id: 1, label: "任务创建", path: "/tasks/new" },
  { id: 2, label: "简历同步", path: "/tasks/demo/intake" },
  { id: 3, label: "JD 拆解", path: "/tasks/demo/jd" },
  { id: 4, label: "匹配分析", path: "/tasks/demo/analysis" },
  { id: 5, label: "简历预览", path: "/tasks/demo/resume" },
];

export function GlobalStepper() {
  const pathname = usePathname();
  
  // Find current step based on matching path prefix
  const currentStepIndex = steps.findIndex(s => pathname === s.path) + 1;

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold tracking-tight text-slate-950">AI 求职全链路</h1>
          <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 md:block">
            <div 
              className="h-full rounded-full bg-cyan-500 transition-all duration-700 ease-out" 
              style={{ width: `${(currentStepIndex / steps.length) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
          {steps.map((step, index) => {
            const isActive = currentStepIndex === step.id;
            const isPast = currentStepIndex > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 transition-colors ${isActive ? "text-slate-900" : isPast ? "text-cyan-600" : "text-slate-400"}`}>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    isActive ? "bg-slate-950 text-white ring-4 ring-slate-100" : isPast ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-400"
                  }`}>
                    {isPast ? "✓" : step.id}
                  </span>
                  <span className={`whitespace-now8 text-xs font-bold ${isActive ? "opacity-100" : "opacity-60 hidden md:inline"}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <span className="mx-2 h-px w-3 bg-slate-200 md:mx-3 md:w-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
