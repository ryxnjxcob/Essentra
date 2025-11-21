import React from "react";
import {
  ArrowRight,
  Users,
  Zap,
  Layout,
  Sparkles,
  Lock,
  Share2,
  Workflow,
  Box,
  BrainCircuit,
  MousePointer2,
  Plus,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden selection:bg-primary/30 selection:text-primary">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 lg:pt-52 lg:pb-48 overflow-hidden">
        {/* Background Splines/Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-b from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-float" />
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-float-delayed" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-pink-400/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Pill Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm mb-10 animate-slide-up opacity-0"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-xs font-bold text-foreground/80 uppercase tracking-wide">
              Essentra v2.0 is Live
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground mb-8 animate-slide-up opacity-0"
            style={{ animationDelay: "0.2s" }}
          >
            Think{" "}
            <span className="italic font-serif font-medium text-gray-400 mx-2">
              visual.
            </span>{" "}
            <br />
            Build{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-shine bg-[length:200%_auto]">
              together.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground mb-14 leading-relaxed font-light animate-slide-up opacity-0"
            style={{ animationDelay: "0.3s" }}
          >
            The infinite canvas where teams turn messy thoughts into clear
            diagrams, structured flows, and actionable plans.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center gap-6 animate-slide-up opacity-0"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={onGetStarted}
              className="group relative px-10 py-5 rounded-full bg-foreground text-background font-bold text-lg shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors">
                Start Creating Free{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button className="px-10 py-5 rounded-full bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-md text-foreground font-semibold text-lg hover:bg-white/50 dark:hover:bg-white/10 transition-all hover:scale-105">
              See How It Works
            </button>
          </div>

          {/* Hero Mockup / Floating UI Cards */}
          <div
            className="mt-24 relative w-full max-w-5xl animate-slide-up opacity-0"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 dark:opacity-40"></div>

            {/* Pure CSS App Mockup - No Images */}
            <div className="relative rounded-2xl overflow-hidden border border-white/50 dark:border-white/10 shadow-2xl bg-[#f8f9fa] dark:bg-[#0c0c0c] backdrop-blur-xl flex flex-col aspect-[16/10]">
              {/* Mock Window Header */}
              <div className="h-12 bg-white/80 dark:bg-[#18181b]/80 border-b border-gray-200 dark:border-white/5 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/50 dark:bg-white/5 rounded-lg text-xs font-medium text-muted-foreground">
                  <Lock className="w-3 h-3" />{" "}
                  <span className="opacity-75">
                    essentra.app/board/strategy-2024
                  </span>
                </div>
                <div className="w-16 flex justify-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10"></div>
                </div>
              </div>

              {/* Mock Canvas Area */}
              <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#0c0c0c]">
                {/* Dot Grid Pattern */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(#a0a0a0 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    opacity: 0.15,
                  }}
                ></div>

                {/* Floating Note 1: AI Insight */}
                <div
                  className="absolute top-16 left-16 w-64 p-4 bg-white dark:bg-[#1e1e24] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-white/5 animate-float"
                  style={{ animationDuration: "6s" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      AI Generated Flow
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                      <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="h-1 w-8 bg-gray-200 dark:bg-white/10 rounded"></div>
                      <div className="w-8 h-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full"></div>
                    <div className="h-2 w-3/4 bg-gray-100 dark:bg-white/5 rounded-full"></div>
                  </div>
                </div>

                {/* Connecting Line */}
                <svg className="absolute inset-0 pointer-events-none z-0">
                  <path
                    d="M320 140 C 400 140, 400 220, 480 220"
                    stroke="currentColor"
                    className="text-gray-300 dark:text-gray-700"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="6 6"
                  />
                </svg>

                {/* Floating Note 2: Media Card */}
                <div className="absolute top-40 left-[460px] w-64 bg-white dark:bg-[#1e1e24] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-white/5 p-2 transform rotate-2 hover:rotate-0 transition-all duration-500">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 mb-2 relative overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 pb-2">
                    <div className="h-2 w-2/3 bg-gray-100 dark:bg-white/10 rounded-full mb-1.5"></div>
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 rounded-full bg-gray-200 border border-white"></div>
                      <div className="w-5 h-5 rounded-full bg-gray-300 border border-white"></div>
                    </div>
                  </div>
                </div>

                {/* Cursor */}
                <div className="absolute top-56 left-[440px] animate-float-delayed z-20">
                  <MousePointer2 className="w-6 h-6 text-primary fill-primary stroke-white dark:stroke-black" />
                  <div className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-md rounded-tl-none ml-4 mt-1 shadow-md">
                    You
                  </div>
                </div>

                {/* Toolbar Mock */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 px-4 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md rounded-full shadow-2xl border border-gray-200 dark:border-white/10">
                  {[
                    { i: <MousePointer2 className="w-4 h-4" />, a: true },
                    { i: <Layout className="w-4 h-4" />, a: false },
                    { i: <Plus className="w-4 h-4" />, a: false },
                    { i: <Share2 className="w-4 h-4" />, a: false },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${item.a ? "bg-primary text-white" : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10"}`}
                    >
                      {item.i}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Decorations (Outside Mockup) */}
            <div className="absolute top-24 -left-12 md:-left-16 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-float hidden lg:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Ideas Synced</span>
              </div>
              <div className="h-1.5 w-32 bg-gray-100 dark:bg-gray-700 rounded mb-1"></div>
              <div className="h-1.5 w-24 bg-gray-100 dark:bg-gray-700 rounded"></div>
            </div>

            <div className="absolute bottom-32 -right-12 md:-right-16 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-float-delayed hidden lg:block">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800"
                  ></div>
                ))}
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  +5
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Lightning Fast",
                desc: "Built on modern web tech for 60fps interactions, even with thousands of nodes.",
                bg: "bg-amber-500/10",
                text: "text-amber-600 dark:text-amber-400",
              },
              {
                icon: <Workflow className="w-6 h-6" />,
                title: "AI Workflows",
                desc: "Describe your process and let Gemini generate complex diagrams instantly.",
                bg: "bg-purple-500/10",
                text: "text-purple-600 dark:text-purple-400",
              },
              {
                icon: <Box className="w-6 h-6" />,
                title: "Object Oriented",
                desc: "Everything is an object. Code, Images, Videos, Text. Mix and match freely.",
                bg: "bg-cyan-500/10",
                text: "text-cyan-600 dark:text-cyan-400",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
