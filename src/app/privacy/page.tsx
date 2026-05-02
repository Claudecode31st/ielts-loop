import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy – IELTS Memo",
  description: "How IELTS Memo collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "2 May 2025";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-400">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">

          <Section title="1. Who We Are">
            <P>IELTS Memo ("we", "us", "our") is an AI-powered writing feedback platform for IELTS candidates. Our service is operated at <strong>ieltsmemo.com</strong>. If you have questions about this policy, contact us at <a href="mailto:privacy@ieltsmemo.com" className="text-brand-600 hover:underline">privacy@ieltsmemo.com</a>.</P>
            <P>We are not affiliated with IDP Education, the British Council, or Cambridge Assessment English.</P>
          </Section>

          <Section title="2. What We Collect">
            <P>We collect the minimum data necessary to provide our service:</P>
            <ul className="mt-2 space-y-2 list-none">
              {[
                ["Account information", "Your name, email address, and profile photo — provided by Google when you sign in via Google OAuth."],
                ["Essay content", "The essay text and task prompts you submit for AI feedback."],
                ["Uploaded images", "Chart or graph images you optionally attach to Task 1 submissions."],
                ["Usage data", "The number of essays submitted, exercises completed, and band scores received — used to build your personal error-pattern memory."],
                ["Payment information", "If you subscribe to the Pro plan, Stripe processes your payment. We never see or store your card number."],
                ["Log data", "Standard server logs including IP address, browser type, and pages visited, retained for up to 30 days for security and debugging purposes."],
              ].map(([label, desc]) => (
                <li key={label as string} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                  <span><strong className="text-slate-800">{label}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <P>We use your data only for the following purposes:</P>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "Providing and improving the AI feedback, band scoring, and exercise generation features.",
                "Building and updating your personal error-pattern memory profile across sessions.",
                "Processing your subscription payments via Stripe.",
                "Sending transactional emails (e.g. receipts) — we do not send marketing emails without your explicit consent.",
                "Detecting and preventing abuse or fraudulent use of the platform.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <P className="mt-3">We do not sell your data to third parties. We do not use your essays to train AI models without your explicit consent.</P>
          </Section>

          <Section title="4. Third-Party Services">
            <P>We share data with the following trusted third parties only as required to operate the service:</P>
            <div className="mt-3 space-y-3">
              {[
                ["Google OAuth", "Used for authentication. Google's privacy policy applies to data processed by Google."],
                ["Anthropic (Claude AI)", "Your essay text and prompts are sent to Anthropic's API to generate feedback and scores. Anthropic's data usage policies apply."],
                ["Stripe", "Used to process subscription payments. Stripe is PCI-DSS compliant and we never access your card details."],
                ["Vercel", "Our hosting provider. Application traffic and logs pass through Vercel's infrastructure."],
                ["Neon / PostgreSQL", "Our database provider stores your account data, essays, and progress history."],
              ].map(([name, desc]) => (
                <div key={name as string} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-semibold text-slate-800 w-36">{name}</span>
                  <span className="text-slate-500">{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="5. Data Retention">
            <P>We retain your account data and essays for as long as your account is active. You can request deletion of your account and all associated data at any time by emailing <a href="mailto:privacy@ieltsmemo.com" className="text-brand-600 hover:underline">privacy@ieltsmemo.com</a>. We will action deletion requests within 30 days.</P>
            <P>Anonymised, aggregated usage statistics (with no personally identifiable information) may be retained indefinitely for product improvement.</P>
          </Section>

          <Section title="6. Cookies">
            <P>We use only essential cookies required to maintain your login session. We do not use advertising or tracking cookies. We do not use third-party analytics tools that set cookies (such as Google Analytics).</P>
          </Section>

          <Section title="7. Your Rights">
            <P>Depending on your location, you may have the following rights regarding your personal data:</P>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "Access — request a copy of the data we hold about you.",
                "Correction — ask us to correct inaccurate data.",
                "Deletion — request erasure of your account and data.",
                "Portability — receive your data in a machine-readable format.",
                "Objection — object to certain types of processing.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <P className="mt-3">To exercise any of these rights, email us at <a href="mailto:privacy@ieltsmemo.com" className="text-brand-600 hover:underline">privacy@ieltsmemo.com</a>.</P>
          </Section>

          <Section title="8. Security">
            <P>We implement industry-standard security measures including HTTPS encryption in transit, encrypted database connections, and access controls. However, no system is 100% secure. Please use a strong, unique password for your Google account and notify us immediately if you suspect unauthorised access.</P>
          </Section>

          <Section title="9. Children">
            <P>IELTS Memo is not intended for children under the age of 13. We do not knowingly collect personal data from children under 13. If you believe a child has provided us with personal data, contact us and we will delete it promptly.</P>
          </Section>

          <Section title="10. Changes to This Policy">
            <P>We may update this policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of the service after changes constitutes acceptance of the revised policy.</P>
          </Section>

        </div>

        <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p>Questions? Email <a href="mailto:privacy@ieltsmemo.com" className="text-brand-600 hover:underline">privacy@ieltsmemo.com</a></p>
          <p>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
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
