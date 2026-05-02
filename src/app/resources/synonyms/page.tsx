import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "IELTS Synonyms & Vocabulary Upgrades | IELTS Memo",
  description: "Replace basic words with band 7+ alternatives. IELTS synonyms organised by topic and word type to boost your Lexical Resource score.",
};

const groups = [
  {
    category: "Verbs — Change & Movement",
    color: "brand",
    words: [
      { basic: "go up / increase",    upgraded: ["rise", "surge", "soar", "climb", "escalate", "grow"] },
      { basic: "go down / decrease",  upgraded: ["fall", "drop", "decline", "plummet", "dip", "shrink"] },
      { basic: "stay the same",       upgraded: ["remain stable", "plateau", "level off", "stagnate"] },
      { basic: "make better",         upgraded: ["enhance", "improve", "boost", "strengthen", "optimise"] },
      { basic: "make worse",          upgraded: ["worsen", "exacerbate", "aggravate", "deteriorate"] },
      { basic: "cause",               upgraded: ["lead to", "result in", "give rise to", "trigger", "generate"] },
    ],
  },
  {
    category: "Adjectives — Degree & Importance",
    color: "violet",
    words: [
      { basic: "big / large",         upgraded: ["significant", "substantial", "considerable", "extensive", "vast"] },
      { basic: "small / little",      upgraded: ["minimal", "negligible", "marginal", "modest", "slight"] },
      { basic: "good",                upgraded: ["beneficial", "advantageous", "favourable", "positive", "valuable"] },
      { basic: "bad",                 upgraded: ["detrimental", "harmful", "adverse", "negative", "damaging"] },
      { basic: "important",           upgraded: ["crucial", "vital", "significant", "essential", "paramount"] },
      { basic: "common",              upgraded: ["prevalent", "widespread", "frequent", "routine", "ubiquitous"] },
    ],
  },
  {
    category: "Verbs — Thinking & Arguing",
    color: "emerald",
    words: [
      { basic: "think / believe",     upgraded: ["argue", "contend", "maintain", "assert", "suggest", "claim"] },
      { basic: "show / prove",        upgraded: ["demonstrate", "indicate", "reveal", "highlight", "illustrate"] },
      { basic: "say",                 upgraded: ["state", "declare", "emphasise", "stress", "point out"] },
      { basic: "help",                upgraded: ["facilitate", "enable", "support", "promote", "foster", "aid"] },
      { basic: "use",                 upgraded: ["utilise", "employ", "adopt", "implement", "apply"] },
      { basic: "need",                upgraded: ["require", "demand", "necessitate", "call for"] },
    ],
  },
  {
    category: "Topic Vocabulary — Society & People",
    color: "amber",
    words: [
      { basic: "people / humans",     upgraded: ["individuals", "citizens", "the public", "residents", "communities"] },
      { basic: "old people",          upgraded: ["the elderly", "senior citizens", "older generations", "retirees"] },
      { basic: "young people",        upgraded: ["the younger generation", "adolescents", "youth", "millennials"] },
      { basic: "the government",      upgraded: ["authorities", "policymakers", "officials", "the state"] },
      { basic: "society",             upgraded: ["the community", "the public", "social groups", "civilisation"] },
    ],
  },
  {
    category: "Topic Vocabulary — Environment",
    color: "blue",
    words: [
      { basic: "pollution",           upgraded: ["contamination", "emissions", "environmental damage", "toxic waste"] },
      { basic: "the environment",     upgraded: ["the natural world", "ecosystems", "the planet", "the biosphere"] },
      { basic: "climate change",      upgraded: ["global warming", "rising temperatures", "environmental shifts"] },
      { basic: "destroy nature",      upgraded: ["deplete natural resources", "deforest", "damage ecosystems"] },
      { basic: "save the environment",upgraded: ["promote sustainability", "reduce carbon footprint", "go green"] },
    ],
  },
  {
    category: "Topic Vocabulary — Technology",
    color: "red",
    words: [
      { basic: "technology",          upgraded: ["innovation", "digital tools", "modern advancements", "automation"] },
      { basic: "the internet",        upgraded: ["digital platforms", "online networks", "cyberspace", "the web"] },
      { basic: "phones / devices",    upgraded: ["smartphones", "digital devices", "portable technology", "gadgets"] },
      { basic: "AI / computers",      upgraded: ["artificial intelligence", "machine learning", "automated systems"] },
    ],
  },
  {
    category: "Adverbs — Adding Strength",
    color: "slate",
    words: [
      { basic: "very",                upgraded: ["significantly", "considerably", "substantially", "markedly", "notably"] },
      { basic: "a lot",               upgraded: ["dramatically", "enormously", "vastly", "extensively"] },
      { basic: "a little",            upgraded: ["marginally", "slightly", "moderately", "somewhat"] },
      { basic: "clearly",             upgraded: ["evidently", "undeniably", "indisputably", "unquestionably"] },
    ],
  },
];

const colorMap: Record<string, { badge: string; pill: string; pillText: string }> = {
  brand:  { badge: "bg-brand-50 text-brand-700 border-brand-100",    pill: "bg-brand-50 border-brand-100",   pillText: "text-brand-700" },
  violet: { badge: "bg-violet-50 text-violet-700 border-violet-100", pill: "bg-violet-50 border-violet-100", pillText: "text-violet-700" },
  emerald:{ badge: "bg-emerald-50 text-emerald-700 border-emerald-100", pill: "bg-emerald-50 border-emerald-100", pillText: "text-emerald-700" },
  amber:  { badge: "bg-amber-50 text-amber-700 border-amber-100",    pill: "bg-amber-50 border-amber-100",   pillText: "text-amber-700" },
  blue:   { badge: "bg-blue-50 text-blue-700 border-blue-100",       pill: "bg-blue-50 border-blue-100",     pillText: "text-blue-700" },
  red:    { badge: "bg-red-50 text-red-700 border-red-100",          pill: "bg-red-50 border-red-100",       pillText: "text-red-700" },
  slate:  { badge: "bg-slate-100 text-slate-600 border-slate-200",   pill: "bg-slate-100 border-slate-200",  pillText: "text-slate-600" },
};

export default function SynonymsPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Writing Resources</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Synonyms & Vocabulary Upgrades</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Simple swaps to make your writing sound more academic. The left column is what most students write — the right column is what Band 7+ writers use.
          </p>
        </div>

        <div className="space-y-4">
          {groups.map((g) => {
            const c = colorMap[g.color];
            return (
              <div key={g.category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>{g.category}</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {g.words.map((w) => (
                    <div key={w.basic} className="px-5 py-3 flex items-start gap-4">
                      {/* Basic word */}
                      <div className="shrink-0 w-36">
                        <span className="text-xs text-slate-400 line-through">{w.basic}</span>
                      </div>
                      {/* Arrow */}
                      <span className="text-slate-200 text-sm shrink-0 mt-0.5">→</span>
                      {/* Upgraded options */}
                      <div className="flex flex-wrap gap-1.5">
                        {w.upgraded.map((u) => (
                          <span key={u} className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${c.pill} ${c.pillText}`}>
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Watch out: </span>
            Using a word you don&apos;t fully understand is riskier than using a simple word correctly. Examiners penalise incorrect word choice more than simple vocabulary. Always check how a word is used before using it in an exam.
          </p>
        </div>

        <div className="mt-4 p-5 bg-white border border-slate-200 rounded-2xl text-center">
          <p className="text-sm font-semibold text-slate-800 mb-1">Check your vocabulary in a real essay</p>
          <p className="text-xs text-slate-500 mb-3">Submit an essay and get specific feedback on your word choice and vocabulary range.</p>
          <Link href="/essay/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors">
            New Essay
          </Link>
        </div>
      </div>
    </div>
  );
}
