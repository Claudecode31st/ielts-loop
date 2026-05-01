import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskType, ieltsMode } = await req.json() as {
    taskType: "task1" | "task2";
    ieltsMode: "academic" | "general";
  };

  // ── Task 1 Academic: generate prompt + chart data ──────────────────────
  if (taskType === "task1" && ieltsMode === "academic") {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      system: "You are an expert IELTS examiner. Generate realistic IELTS Academic Task 1 prompts with matching chart data. Return only valid JSON, no markdown.",
      messages: [
        {
          role: "user",
          content: `Generate one realistic IELTS Academic Task 1 question with chart data.

Choose ONE chart type at random: "bar", "line", or "pie".

Return a single JSON object with this exact shape:
{
  "prompt": "<The chart/graph below shows ... Summarise the information by selecting and reporting the main features, and make comparisons where relevant.>",
  "chart": {
    "type": "bar" | "line" | "pie",
    "title": "<descriptive chart title>",
    "unit": "<e.g. %, million tonnes, USD billions>",
    "xAxisLabel": "<only for bar/line>",
    "yAxisLabel": "<only for bar/line>",
    "categories": ["<label1>", "<label2>", ...],
    "series": [
      { "name": "<series name>", "data": [<number>, <number>, ...] }
    ]
  }
}

Rules:
- For "pie": omit xAxisLabel, yAxisLabel. categories = slice names, series has one entry with matching data array.
- For "bar"/"line": 2–4 series, 4–6 categories (years or groups). Numbers must be realistic and varied.
- The prompt text must reference the exact chart described (matching type, topic, time period, countries/categories).
- Topic ideas: internet usage by country, renewable energy production, university enrolment rates, household expenditure, CO2 emissions by sector, transport usage.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    try {
      const json = JSON.parse(
        content.text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim()
      );
      return NextResponse.json({ prompt: json.prompt, chartData: json.chart });
    } catch {
      // If JSON parse fails, fall back to text-only prompt
      return NextResponse.json({ prompt: content.text.trim() });
    }
  }

  // ── Task 2 ────────────────────────────────────────────────────────────
  if (taskType === "task2") {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: "You are an expert IELTS examiner. Generate realistic, exam-style IELTS Task 2 essay questions.",
      messages: [
        {
          role: "user",
          content: `Generate one realistic IELTS Task 2 essay question.

- Match the style of real Cambridge IELTS exam questions
- Choose ONE type at random: Opinion, Discussion, Problem-Solution, Advantages-Disadvantages, or Mixed
- Topic: education, technology, environment, society, work, or health
- End with the appropriate task instruction
- Return ONLY the prompt text, nothing else.`,
        },
      ],
    });
    const content = response.content[0];
    if (content.type !== "text") return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    return NextResponse.json({ prompt: content.text.trim() });
  }

  // ── Task 1 General Training ───────────────────────────────────────────
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    system: "You are an expert IELTS examiner. Generate realistic IELTS General Training Task 1 letter-writing questions.",
    messages: [
      {
        role: "user",
        content: `Generate one realistic IELTS General Training Task 1 letter question.

- Present a plausible real-life situation requiring a letter
- Specify the recipient and context clearly
- Include exactly 3 bullet points of things to address
- Indicate the register (formal, semi-formal, or informal) through the scenario
- Start with "You should write at least 150 words." on its own line
- Return ONLY the prompt text, nothing else.`,
      },
    ],
  });
  const content = response.content[0];
  if (content.type !== "text") return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  return NextResponse.json({ prompt: content.text.trim() });
}
