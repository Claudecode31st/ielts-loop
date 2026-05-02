import { signIn } from "@/lib/auth";
import { NotebookPen, CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl || "/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Brand */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-4">
            <NotebookPen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Sign in to IELTS Memo
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Your AI writing coach with long-term memory
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-brand-50 rounded-xl p-5 space-y-3">
          {[
            "Real IELTS band scores using official descriptors",
            "Personalized feedback based on your error history",
            "Adaptive exercises targeting your weak points",
            "Progress tracking across all 4 IELTS criteria",
          ].map((benefit) => (
            <div key={benefit} className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
              <span className="text-sm text-brand-800">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 text-center">
            Continue with your account
          </h2>

          <form
            action={async () => {
              "use server";
              await signIn("google", {
                redirectTo: callbackUrl || "/dashboard",
              });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="text-xs text-center text-slate-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            We never share your essays with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
