import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import GlobalFooterLight from "../components/GlobalFooterLight";

export default function BasePageLayout({ 
  children,
  title,
  subtitle
}: { 
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden text-slate-900 font-sans selection:bg-cyan-200">
      {/* Abstract Background Blobs - Eco Energy Theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-200/50 rounded-full blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-200/40 rounded-full blur-[150px] opacity-60 pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] bg-blue-100/60 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full h-20 bg-white/60 backdrop-blur-3xl border-b border-slate-200/80 px-6 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => window.close()}
          className="flex items-center gap-2 text-slate-500 hover:text-cyan-700 transition-colors group outline-none"
        >
          <div className="w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-50 transition-all">
            <ChevronLeft size={20} className="group-hover:text-cyan-600" />
          </div>
          <span className="font-bold tracking-wide hidden sm:block">Ana Sayfa</span>
        </button>
        <span className="text-xl font-black tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-emerald-500 uppercase">
          IYONTREE
        </span>
        <div className="w-24" /> {/* Spacer */}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-16 relative z-10 flex flex-col gap-12">
        {/* Title Section */}
        <div className="flex flex-col gap-4 items-center text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-slate-500 max-w-2xl font-medium uppercase tracking-[0.1em]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Children Content (Glassmorphism containers will go inside here) */}
        {children}
      </main>

      <GlobalFooterLight />
    </div>
  );
}
