import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { essays, users, errorPatterns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PenLine,
  TrendingUp,
  Target,
  BookOpen,
  Dumbbell,
  ArrowRight,
  Clock,
} from "lucide-react";
import { getBandBgColor, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch user data
  const [userData] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  // Fetch recent essays
  const recentEssays = await db
    .select()
    .from(essays)
    .where(eq(essays.userId, session.user.id))
    .orderBy(desc(essays.submittedAt))
    .limit(3);

  // Fetch top recurring errors
  const topErrors = await db
    .select()
    .from(errorPatterns)
    .where(eq(errorPatterns.userId, session.user.id))
    .orderBy(desc(errorPatterns.frequency))
    .limit(3);

  const firstName = session.user.name?.split(" ")[0] || "there";
  const currentBand = userData?.currentBand
    ? parseFloat(String(userData.currentBand))
    : null;
  const targetBand = userData?.targetBand
    ? parseFloat(String(userData.targetBand))
    : 7.0;
  const totalEssays = userData?.totalEssays || 0;

  const stats = [
    {
      label: "Total Essays",
      value: String(totalEssays),
      icon: BookOpen,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Current Band",
      value: currentBand ? currentBand.toFixed(1) : "—",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Target Band",
      value: targetBand.toFixed(1),
      icon: Target,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Errors Tracked",
      value: String(topErrors.reduce((sum, e) => sum + (e.frequency || 0), 0)),
      icon: Dumbbell,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-500 mt-1">
            {currentBand
              ? `Your current estimated band: ${currentBand.toFixed(1)} — Keep going!`
              : "Submit your first essay to get your band score estimate."}
          </p>
        </div>
        <Link href="/essay/new">
          <Button size="lg" className="gap-2 shrink-0">
            <PenLine className="h-5 w-5" />
            Submit New Essay
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Essays */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Essays
            </h2>
            <Link
              href="/essays"
              className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentEssays.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-3">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 text-sm">No essays yet.</p>
                <Link href="/essay/new">
                  <Button variant="outline" size="sm">
                    Submit your first essay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentEssays.map((essay) => {
                const band = parseFloat(String(essay.overallBand));
                return (
                  <Link key={essay.id} href={`/essay/${essay.id}`}>
                    <Card className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {essay.taskType === "task1"
                                  ? "Task 1"
                                  : "Task 2"}
                              </Badge>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(essay.submittedAt!)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 line-clamp-2">
                              {essay.prompt}
                            </p>
                            {essay.feedbackSummary && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                {essay.feedbackSummary}
                              </p>
                            )}
                          </div>
                          <div
                            className={`shrink-0 text-2xl font-extrabold ${
                              getBandBgColor(band).includes("green")
                                ? "text-green-600"
                                : getBandBgColor(band).includes("amber")
                                ? "text-amber-500"
                                : "text-red-500"
                            }`}
                          >
                            {band.toFixed(1)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recurring Errors */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Top Recurring Errors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topErrors.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No patterns yet. Submit essays to build your profile.
                </p>
              ) : (
                topErrors.map((error) => (
                  <div key={error.id} className="flex items-start gap-2">
                    <span
                      className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded ${
                        error.errorCategory === "grammar"
                          ? "bg-red-100 text-red-700"
                          : error.errorCategory === "vocabulary"
                          ? "bg-blue-100 text-blue-700"
                          : error.errorCategory === "structure"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      ×{error.frequency}
                    </span>
                    <p className="text-sm text-slate-600 leading-tight">
                      {error.errorType}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/essay/new" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <PenLine className="h-4 w-4 text-indigo-600" />
                  Submit Essay
                </Button>
              </Link>
              <Link href="/exercises" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Dumbbell className="h-4 w-4 text-green-600" />
                  Practice Exercises
                </Button>
              </Link>
              <Link href="/progress" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  View Progress
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
