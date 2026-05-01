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

  let systemInstruction: string;
  let userInstruction: string;

  if (taskType === "task2") {
    systemInstruction = "You are an expert IELTS examiner. Generate realistic, exam-style IELTS Task 2 essay questions.";
    userInstruction = `Generate one realistic IELTS Task 2 essay question.

Requirements:
- Match the style of real Cambridge IELTS exam questions
- Choose ONE question type at random: Opinion (Do you agree or disagree?), Discussion (Discuss both views), Problem-Solution, Advantages-Disadvantages, or Mixed
- Topic should be contemporary and relevant (education, technology, environment, society, work, health, etc.)
- End with the appropriate task instruction (e.g. "To what extent do you agree or disagree?" or "Discuss both views and give your own opinion.")
- Return ONLY the prompt text, nothing else. No labels, no explanations.`;
  } else if (ieltsMode === "academic") {
    systemInstruction = "You are an expert IELTS examiner. Generate realistic IELTS Academic Task 1 questions describing data visualisations.";
    userInstruction = `Generate one realistic IELTS Academic Task 1 question.

Requirements:
- Describe a plausible chart, graph, table, map, or process diagram
- Include: what the data shows, the geographic location or context, and the time period
- Choose ONE visual type: bar chart, line graph, pie chart, table, map comparison, or process diagram
- End with: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
- Return ONLY the prompt text, nothing else. No labels, no explanations.`;
  } else {
    systemInstruction = "You are an expert IELTS examiner. Generate realistic IELTS General Training Task 1 letter-writing questions.";
    userInstruction = `Generate one realistic IELTS General Training Task 1 letter question.

Requirements:
- Present a plausible real-life situation requiring a letter
- Specify the recipient and context clearly
- Include exactly 3 bullet points of things to address in the letter
- Indicate the appropriate register (formal, semi-formal, or informal) through the scenario
- Start with "You should write at least 150 words." on its own line, then the situation, then the bullet points
- Return ONLY the prompt text, nothing else. No labels, no explanations.`;
  }

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 400,
    system: systemInstruction,
    messages: [{ role: "user", content: userInstruction }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  return NextResponse.json({ prompt: content.text.trim() });
}
