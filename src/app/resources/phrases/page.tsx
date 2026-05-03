import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "IELTS Useful Phrases & Linking Words | IELTS Memo",
  description: "Essential IELTS academic phrases, linking words, and sentence starters to improve your coherence, cohesion, and vocabulary scores.",
};

const sections = [
  {
    title: "Introducing & Stating Your Opinion",
    color: "border-brand-200",
    headerBg: "bg-brand-50",
    labelColor: "text-brand-600",
    phrases: [
      "In my opinion, …",
      "I firmly believe that …",
      "It is my view that …",
      "From my perspective, …",
      "I would argue that …",
      "It seems to me that …",
      "I am convinced that …",
      "There is no doubt in my mind that …",
    ],
  },
  {
    title: "Adding Information",
    color: "border-emerald-200",
    headerBg: "bg-emerald-50",
    labelColor: "text-emerald-700",
    phrases: [
      "Furthermore, …",
      "Moreover, …",
      "In addition, …",
      "Additionally, …",
      "Not only … but also …",
      "What is more, …",
      "Apart from this, …",
      "On top of that, …",
    ],
  },
  {
    title: "Contrasting & Conceding",
    color: "border-amber-200",
    headerBg: "bg-amber-50",
    labelColor: "text-amber-700",
    phrases: [
      "However, …",
      "On the other hand, …",
      "Nevertheless, …",
      "Despite this, …",
      "Although … , …",
      "While it is true that …, …",
      "Admittedly, … ; however, …",
      "Even though …, …",
      "In contrast, …",
      "Conversely, …",
    ],
  },
  {
    title: "Giving Examples",
    color: "border-violet-200",
    headerBg: "bg-violet-50",
    labelColor: "text-violet-700",
    phrases: [
      "For example, …",
      "For instance, …",
      "To illustrate this, …",
      "A clear example of this is …",
      "This can be seen in …",
      "Take [country/city] as an example: …",
      "Research suggests that …",
      "Studies have shown that …",
    ],
  },
  {
    title: "Showing Cause & Effect",
    color: "border-red-200",
    headerBg: "bg-red-50",
    labelColor: "text-red-600",
    phrases: [
      "As a result, …",
      "Consequently, …",
      "Therefore, …",
      "This leads to …",
      "This results in …",
      "Due to …, …",
      "Owing to …, …",
      "Because of this, …",
      "Hence, …",
      "This means that …",
    ],
  },
  {
    title: "Concluding",
    color: "border-slate-200",
    headerBg: "bg-slate-50",
    labelColor: "text-slate-600",
    phrases: [
      "In conclusion, …",
      "To conclude, …",
      "To summarise, …",
      "In summary, …",
      "Overall, it can be said that …",
      "Taking everything into consideration, …",
      "All things considered, …",
      "On balance, …",
    ],
  },
  {
    title: "Describing Trends (Task 1 — Academic)",
    color: "border-blue-200",
    headerBg: "bg-blue-50",
    labelColor: "text-blue-700",
    phrases: [
      "rose sharply / gradually / steadily",
      "fell dramatically / slightly / significantly",
      "remained stable / constant / unchanged",
      "fluctuated between … and …",
      "reached a peak of … in …",
      "hit a low point of … in …",
      "levelled off at …",
      "accounted for … percent",
      "stood at … in [year]",
      "there was a marked increase / sharp decline in …",
    ],
  },
  {
    title: "Useful Sentence Starters for Task 2 Body Paragraphs",
    color: "border-orange-200",
    headerBg: "bg-orange-50",
    labelColor: "text-orange-700",
    phrases: [
      "One of the main reasons for this is …",
      "A key factor contributing to this is …",
      "This is largely because …",
      "The most significant advantage of … is …",
      "A major drawback of … is …",
      "It is widely accepted that …",
      "Many people argue that …",
      "Those who support this view claim that …",
      "Critics of this view, however, point out that …",
      "Governments could address this by …",
      "Individuals can play a role by …",
    ],
  },
];

export default function PhrasesPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Writing Resources</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Useful Phrases & Linking Words</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Organised by function. Use variety — repeating the same phrase in every paragraph reduces your Coherence & Cohesion score.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((sec) => (
            <div key={sec.title} className={`bg-white rounded-2xl border ${sec.color} overflow-hidden`}>
              <div className={`px-5 py-3.5 ${sec.headerBg} border-b ${sec.color}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${sec.labelColor}`}>{sec.title}</p>
              </div>
              <div className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {sec.phrases.map((p) => (
                    <span key={p} className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 leading-snug">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Important: </span>
            Memorised phrases only help if they fit naturally. Examiners can tell when phrases are forced. Practise using them in full essays so they feel natural when it counts.
          </p>
        </div>

        <div className="mt-4 p-5 bg-white border border-slate-200 rounded-2xl text-center">
          <p className="text-sm font-semibold text-slate-800 mb-1">See these phrases in your own writing</p>
          <p className="text-xs text-slate-500 mb-3">Submit an essay and get feedback on your coherence and vocabulary use.</p>
          <Link href="/essay/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors">
            New Essay
          </Link>
        </div>
      </div>
    </div>
  );
}
