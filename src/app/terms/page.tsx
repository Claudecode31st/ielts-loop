import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service – IELTS Memo",
  description: "Terms and conditions for using IELTS Memo.",
};

const LAST_UPDATED = "2 May 2025";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-400">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">

          <Section title="1. Acceptance of Terms">
            <P>By creating an account or using IELTS Memo ("the Service", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including free and Pro subscribers.</P>
            <P className="mt-2">We reserve the right to update these terms at any time. Continued use of the Service after changes constitutes acceptance.</P>
          </Section>

          <Section title="2. Description of Service">
            <P>IELTS Memo is an AI-powered writing feedback platform designed to help IELTS candidates improve their writing skills. The Service includes:</P>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "AI-generated band score estimates across Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.",
                "Error pattern tracking and personalised memory profiles built from your submitted essays.",
                "AI-guided writing assistance (Guide Mode) that provides live suggestions as you type.",
                "Adaptive practice exercises tailored to your identified weaknesses.",
                "AI-generated IELTS-style task prompts.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. No Guarantee of IELTS Scores">
            <Callout>
              AI-generated band scores are <strong>estimates only</strong> and are not official IELTS scores. IELTS Memo is not affiliated with IDP Education, the British Council, or Cambridge Assessment English. Actual exam results may differ. Do not rely solely on our feedback for critical decisions.
            </Callout>
            <P className="mt-3">Our AI examiner is trained to apply IELTS band descriptors as accurately as possible, but AI scoring is inherently imperfect. Feedback is for educational guidance and practice only.</P>
          </Section>

          <Section title="4. Accounts & Eligibility">
            <P>You must be at least 13 years old to use the Service. By creating an account, you represent that you meet this requirement.</P>
            <P className="mt-2">You are responsible for maintaining the security of your account. You are responsible for all activity under your account. Notify us immediately at <a href="mailto:support@ieltsmemo.com" className="text-brand-600 hover:underline">support@ieltsmemo.com</a> if you suspect unauthorised access.</P>
            <P className="mt-2">We reserve the right to suspend or terminate accounts that violate these terms.</P>
          </Section>

          <Section title="5. Subscriptions & Billing">
            <P>IELTS Memo offers a free plan and a Pro plan. Subscription details:</P>
            <ul className="mt-2 space-y-2 list-none">
              {[
                ["Free plan", "2 essay submissions per month at no cost. No credit card required."],
                ["Pro plan", "Paid monthly subscription billed in USD via Stripe. Includes unlimited essays (up to 5/day), priority AI processing, full analytics, and error pattern memory."],
                ["Billing", "Subscriptions renew automatically each month. You authorise us to charge your payment method on the renewal date."],
                ["Cancellation", "You may cancel at any time from your account settings. Access continues until the end of the current billing period. No partial refunds are issued."],
                ["Refunds", "We offer a full refund within 7 days of your first Pro subscription if you are not satisfied. Contact support@ieltsmemo.com to request a refund."],
              ].map(([label, desc]) => (
                <li key={label as string} className="flex gap-3 text-sm mt-2">
                  <span className="shrink-0 font-semibold text-slate-800 w-28">{label}</span>
                  <span className="text-slate-500">{desc}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="6. Acceptable Use">
            <P>You agree not to:</P>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "Use the Service for any unlawful purpose or in violation of any applicable law.",
                "Submit content that is offensive, defamatory, or infringes on the rights of others.",
                "Attempt to reverse-engineer, scrape, or extract data from the Service.",
                "Share your account credentials with others or resell access to the Service.",
                "Use automated tools to submit essays in bulk or circumvent usage limits.",
                "Attempt to manipulate or deceive the AI scoring system.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="7. Your Content">
            <P>You retain ownership of the essays and content you submit. By submitting content, you grant us a limited, non-exclusive licence to process, store, and analyse your content solely to provide the Service to you.</P>
            <P className="mt-2">We do not share your essays with other users. We do not use your essays to train AI models without your explicit consent. See our <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link> for full details.</P>
          </Section>

          <Section title="8. Intellectual Property">
            <P>All content, software, and design of IELTS Memo — including the AI feedback, exercise content, and interface — is owned by IELTS Memo and protected by intellectual property laws. You may not copy, modify, or distribute any part of the Service without our written permission.</P>
            <P className="mt-2">"IELTS" is a registered trademark of IDP Education Ltd, the British Council, and Cambridge Assessment English. IELTS Memo is an independent service and is not affiliated with or endorsed by these organisations.</P>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <P>The Service is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that AI feedback will be accurate or suitable for your specific needs.</P>
            <P className="mt-2">To the fullest extent permitted by law, we disclaim all warranties including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</P>
          </Section>

          <Section title="10. Limitation of Liability">
            <P>To the fullest extent permitted by applicable law, IELTS Memo shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of exam scores, opportunity, or data — arising out of your use of or inability to use the Service.</P>
            <P className="mt-2">Our total liability to you for any claim arising from these terms or the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or USD $50, whichever is greater.</P>
          </Section>

          <Section title="11. Termination">
            <P>You may stop using the Service and delete your account at any time. We may suspend or terminate your access if you violate these terms, with or without notice. Upon termination, your right to use the Service ceases immediately.</P>
          </Section>

          <Section title="12. Governing Law">
            <P>These terms are governed by the laws of the jurisdiction in which IELTS Memo operates. Any disputes shall be resolved through good-faith negotiation first. If unresolved, disputes shall be submitted to binding arbitration or the appropriate courts of that jurisdiction.</P>
          </Section>

          <Section title="13. Contact">
            <P>For questions about these Terms, contact us at <a href="mailto:support@ieltsmemo.com" className="text-brand-600 hover:underline">support@ieltsmemo.com</a>.</P>
          </Section>

        </div>

        <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p>Questions? Email <a href="mailto:support@ieltsmemo.com" className="text-brand-600 hover:underline">support@ieltsmemo.com</a></p>
          <p>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            {" · "}
            <Link href="/" className="hover:text-slate-600 transition-colors">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-7 py-6">
      <h2 className="text-sm font-bold text-slate-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-slate-600 leading-relaxed ${className}`}>{children}</p>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 leading-relaxed">
      {children}
    </div>
  );
}
