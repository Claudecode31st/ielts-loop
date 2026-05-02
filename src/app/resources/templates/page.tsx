import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "IELTS Essay Templates | IELTS Memo",
  description: "Free IELTS Writing Task 1 and Task 2 essay templates and structures to help you organise your response and score higher.",
};

const templates = [
  {
    tag: "Task 2",
    color: "bg-brand-50 text-brand-700 border-brand-100",
    title: "Opinion / Agree or Disagree",
    desc: "Use this when the question asks 'To what extent do you agree or disagree?' or 'Do you agree or disagree?'",
    structure: [
      { label: "Introduction", content: "Paraphrase the statement. State your position clearly — agree, disagree, or partially agree.\nExample: \"While some argue that X, I firmly believe that Y because…\"" },
      { label: "Body 1 — Main reason", content: "Topic sentence → Explain the reason → Give a specific example or evidence → Link back to the question." },
      { label: "Body 2 — Second reason (or counter-argument)", content: "Topic sentence → Explain → Example → Concede the other side if you chose 'partial agreement': 'Admittedly, …, however…'" },
      { label: "Conclusion", content: "Restate your opinion using different words. Summarise the two main reasons. Do NOT introduce new ideas." },
    ],
    tip: "Stick to ONE clear position throughout. Examiners penalise essays that contradict themselves.",
  },
  {
    tag: "Task 2",
    color: "bg-brand-50 text-brand-700 border-brand-100",
    title: "Discussion — Two Views",
    desc: "Use this when the question says 'Discuss both views and give your own opinion'.",
    structure: [
      { label: "Introduction", content: "Paraphrase the topic. State that you will discuss both sides and give your own view.\nExample: \"This essay will examine both perspectives before concluding that…\"" },
      { label: "Body 1 — First view", content: "Topic sentence presenting view 1 → Reasons + examples supporting this view." },
      { label: "Body 2 — Second view + your opinion", content: "Topic sentence presenting view 2 → Reasons + examples → State your own opinion clearly in the final 2 sentences of this paragraph." },
      { label: "Conclusion", content: "Summarise both views briefly. Restate your personal opinion." },
    ],
    tip: "Your opinion can appear in Body 2 and the conclusion — but it must be consistent throughout.",
  },
  {
    tag: "Task 2",
    color: "bg-brand-50 text-brand-700 border-brand-100",
    title: "Problem & Solution",
    desc: "Use this when the question asks 'What problems does this cause? What solutions can you suggest?'",
    structure: [
      { label: "Introduction", content: "Paraphrase the issue. State that you will outline the main problems and propose solutions." },
      { label: "Body 1 — Problems", content: "Introduce 2 main problems. For each: state the problem → explain why it is harmful → give a real-world example if possible." },
      { label: "Body 2 — Solutions", content: "Propose a solution for each problem. Use hedging language: 'One way to address this would be…', 'Governments could…', 'Individuals should consider…'" },
      { label: "Conclusion", content: "Briefly restate the problems and solutions. End with an optimistic but realistic statement." },
    ],
    tip: "Match solutions to problems — don't introduce a solution that has no corresponding problem in Body 1.",
  },
  {
    tag: "Task 2",
    color: "bg-brand-50 text-brand-700 border-brand-100",
    title: "Advantages & Disadvantages",
    desc: "Use this for 'What are the advantages and disadvantages of…?' questions.",
    structure: [
      { label: "Introduction", content: "Paraphrase the topic. State that you will examine both sides." },
      { label: "Body 1 — Advantages", content: "Topic sentence → 2 advantages, each explained with reasons and examples. Use: 'One clear benefit is…', 'Furthermore, …'" },
      { label: "Body 2 — Disadvantages", content: "Topic sentence → 2 disadvantages with reasons and examples. Use: 'On the other hand…', 'A significant drawback is…'" },
      { label: "Conclusion", content: "Weigh up both sides. State whether the advantages outweigh the disadvantages (or vice versa) with a reason." },
    ],
    tip: "If asked 'Do advantages outweigh disadvantages?', your conclusion must give a clear verdict.",
  },
  {
    tag: "Task 1 — Academic",
    color: "bg-violet-50 text-violet-700 border-violet-100",
    title: "Describing a Graph or Chart",
    desc: "For bar charts, line graphs, pie charts, and tables.",
    structure: [
      { label: "Introduction", content: "Paraphrase the title of the graph. Do NOT copy it word for word.\nExample: 'The line graph illustrates changes in [topic] between [years].'" },
      { label: "Overview (2 sentences)", content: "Identify the 2–3 most significant trends WITHOUT using data figures here. This is the most important paragraph for Task Achievement.\nExample: 'Overall, [X] increased significantly over the period, while [Y] remained relatively stable.'" },
      { label: "Body 1 — Key trend / group 1", content: "Describe the main feature in detail. Use specific figures. Start from the beginning and describe change over time OR compare across categories." },
      { label: "Body 2 — Key trend / group 2", content: "Describe the second main feature or contrast. Include specific data. Compare where relevant." },
    ],
    tip: "Always write an Overview paragraph. Examiners say this is the single biggest differentiator between Band 5 and Band 7.",
  },
  {
    tag: "Task 1 — General",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    title: "Letter Writing",
    desc: "For formal, semi-formal, and informal letters.",
    structure: [
      { label: "Opening", content: "Formal: 'Dear Sir or Madam,' / 'Dear Mr Smith,'\nSemi-formal: 'Dear Mr Johnson,'\nInformal: 'Dear Sarah,' or 'Hi Tom,'" },
      { label: "Opening sentence — state your purpose", content: "Formal: 'I am writing to enquire about…' / 'I am writing with regard to…'\nInformal: 'I'm writing because I wanted to let you know…'" },
      { label: "Body — address all 3 bullet points", content: "Dedicate at least one paragraph to each bullet point in the question. Do not skip any of them — this directly affects your Task Achievement score." },
      { label: "Closing", content: "Formal: 'I look forward to hearing from you. Yours faithfully,' (unknown name) / 'Yours sincerely,' (known name)\nInformal: 'Hope to hear from you soon. Best wishes,' / 'Take care, [Name]'" },
    ],
    tip: "Match your register to the scenario. Mixing formal and informal language in one letter is one of the most common band-limiting mistakes.",
  },
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Writing Resources</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">IELTS Essay Templates</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Clear structures for every IELTS Writing task type. Use these as a framework — not a script. Adapt the language to your own style.
          </p>
        </div>

        <div className="space-y-5">
          {templates.map((t) => (
            <div key={t.title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.color}`}>{t.tag}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">{t.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
              </div>

              <div className="divide-y divide-slate-50">
                {t.structure.map((s, i) => (
                  <div key={i} className="px-6 py-4 flex gap-4">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 mt-0.5">{i + 1}</div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-1">{s.label}</p>
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{s.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-3.5 bg-amber-50 border-t border-amber-100">
                <p className="text-xs text-amber-800"><span className="font-bold">Examiner tip: </span>{t.tip}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-white border border-slate-200 rounded-2xl text-center">
          <p className="text-sm font-semibold text-slate-800 mb-1">Ready to practise?</p>
          <p className="text-xs text-slate-500 mb-3">Submit an essay and get examiner-level feedback in under 60 seconds.</p>
          <Link href="/essay/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors">
            New Essay
          </Link>
        </div>
      </div>
    </div>
  );
}
