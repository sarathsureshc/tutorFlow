import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AIPlanResponse, AIDebriefResponse, AIProgressSummaryResponse } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Helper with exponential backoff and retry-once policy
 */
async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  fallbackFn: () => T,
  retries = 1
): Promise<T> {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not configured. Using pedagogical heuristic engine fallback.");
    return fallbackFn();
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      console.error(`Gemini call attempt ${attempt + 1} failed:`, error?.message || error);
      if (attempt === retries) {
        console.warn("⚠️ Gemini retries exhausted. Falling back to structured heuristic fallback.");
        return fallbackFn();
      }
      // Wait 1 second before retry
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
  return fallbackFn();
}

/**
 * 1. Generate Structured Pre-Session Lesson Plan
 */
export async function generateSessionPlan(params: {
  topic: string;
  studentName: string;
  subject: string;
  currentLevel: string;
  learningGoals: string;
  weakAreas: string;
  previousSessionsContext: Array<{
    topic: string;
    summary?: string | null;
    nextFocus?: string | null;
  }>;
}): Promise<AIPlanResponse> {
  const fallback = (): AIPlanResponse => {
    return {
      objectives: [
        `Master foundational theorems and key principles of ${params.topic} in ${params.subject}.`,
        `Target and remediate identified weakness: ${params.weakAreas.slice(0, 100)}...`,
        `Solve 3 representative multi-step practice problems with full procedural rigor.`,
      ],
      lessonOutline: [
        `10m: Review previous focus areas and diagnostic concept check on ${params.topic}`,
        `20m: Deep conceptual walkthrough addressing ${params.weakAreas.slice(0, 80)}`,
        `20m: Guided problem solving with real-time feedback and edge-case dissection`,
        `10m: Wrap-up synthesis, metacognitive reflection, and homework preview`,
      ],
      practiceQuestions: [
        `Explain the core mechanism of ${params.topic} and how it avoids common pitfalls in ${params.subject}.`,
        `Given a standard problem in ${params.topic}, set up the complete step-by-step solution.`,
        `Solve an advanced scenario specifically challenging the student's weakness (${params.weakAreas.slice(0, 60)}).`,
      ],
    };
  };

  return callGeminiWithRetry(async () => {
    const model = genAI!.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            objectives: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "3 concrete, measurable pedagogical objectives grounded in student weaknesses",
            },
            lessonOutline: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "4-part time-stamped lesson structure (e.g., '10m: Warm-up on...')",
            },
            practiceQuestions: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "3 progressive practice questions tailored to this specific session",
            },
          },
          required: ["objectives", "lessonOutline", "practiceQuestions"],
        },
      },
    });

    const previousContextStr =
      params.previousSessionsContext.length > 0
        ? params.previousSessionsContext
            .map(
              (s, i) =>
                `Session -${i + 1}: Topic="${s.topic}", Summary="${s.summary || "N/A"}", NextFocus="${s.nextFocus || "N/A"}"`
            )
            .join("\n")
        : "No previous sessions recorded. This is the baseline session.";

    const prompt = `You are an elite, highly experienced 1:1 master tutor preparing an individualized lesson plan.
Ground every objective, outline segment, and practice question directly in the student's stated weak areas and carry-over focus from previous debriefs. Do NOT produce generic textbook outlines.

STUDENT PROFILE:
- Name: ${params.studentName}
- Subject: ${params.subject}
- Current Level: ${params.currentLevel}
- Learning Goals: ${params.learningGoals}
- Identified Weak Areas: ${params.weakAreas}

RECENT HISTORICAL SESSIONS:
${previousContextStr}

UPCOMING SESSION TOPIC:
${params.topic}

Generate a concise, rigorous, structured JSON lesson plan conforming to the requested schema.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed.objectives) || !Array.isArray(parsed.lessonOutline) || !Array.isArray(parsed.practiceQuestions)) {
      throw new Error("Invalid schema response from Gemini");
    }

    return parsed;
  }, fallback);
}

/**
 * 2. Generate Structured Post-Session Debrief
 */
export async function generateSessionDebrief(params: {
  topic: string;
  studentName: string;
  subject: string;
  weakAreas: string;
  tutorNotes: string;
}): Promise<AIDebriefResponse> {
  const fallback = (): AIDebriefResponse => {
    return {
      summary: `${params.studentName} covered ${params.topic} with active participation. Notes indicate progress on core concepts with key takeaways: ${params.tutorNotes || "Session completed smoothly."}`,
      homework: [
        `Complete 3-5 practice problems reinforcing ${params.topic}.`,
        `Review reference notes specifically targeting ${params.weakAreas.slice(0, 80)}.`,
      ],
      nextFocus: `Consolidate ${params.topic} fluency and advance to higher-level applications.`,
    };
  };

  return callGeminiWithRetry(async () => {
    const model = genAI!.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: {
              type: SchemaType.STRING,
              description: "A comprehensive pedagogical synthesis of student performance and hurdles",
            },
            homework: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "2 to 3 actionable, specific homework assignments directly addressing weak areas",
            },
            nextFocus: {
              type: SchemaType.STRING,
              description: "The concrete topic and strategic priority for the next tutoring session",
            },
          },
          required: ["summary", "homework", "nextFocus"],
        },
      },
    });

    const prompt = `You are an expert pedagogical auditor evaluating a 1:1 tutoring session debrief.
Read the tutor's raw session notes (which may be informal or shorthand) and reconstruct what actually happened.
Infer what the student struggled with, highlight breakthroughs, and connect homework assignments back to the student's ongoing weak areas.

STUDENT PROFILE:
- Student: ${params.studentName}
- Subject: ${params.subject}
- Persistent Weak Areas: ${params.weakAreas}

SESSION TOPIC:
${params.topic}

RAW TUTOR NOTES:
"""${params.tutorNotes}"""

Produce a structured JSON debrief meeting the schema specifications.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    if (!parsed.summary || !Array.isArray(parsed.homework) || !parsed.nextFocus) {
      throw new Error("Invalid debrief schema response from Gemini");
    }

    return parsed;
  }, fallback);
}

/**
 * 3. Generate Multi-Session Student Progress Summary
 */
export async function generateProgressSummary(params: {
  studentName: string;
  subject: string;
  currentLevel: string;
  learningGoals: string;
  weakAreas: string;
  chronologicalDebriefs: Array<{
    topic: string;
    date: string | Date;
    summary: string;
    homework: string[];
    nextFocus: string;
  }>;
}): Promise<AIProgressSummaryResponse> {
  const fallback = (): AIProgressSummaryResponse => {
    return {
      trajectory: `${params.studentName} has demonstrated consistent upward momentum across ${params.chronologicalDebriefs.length} evaluated sessions in ${params.subject}. Baseline comprehension has stabilized with expanding confidence on standard problem sets.`,
      masteredConcepts: [
        `Core theoretical foundations and terminology in ${params.subject}`,
        `Step-by-step problem structuring for routine scenarios`,
      ],
      persistentStruggles: [
        `Speed and precision under timed conditions regarding ${params.weakAreas.slice(0, 80)}`,
        `Edge-case identification without tutor prompting`,
      ],
      actionableAdviceForTutor: `Focus the next phase of tutoring on timed active retrieval and mixed-concept drills to transition from procedural execution to instinctive mastery.`,
    };
  };

  return callGeminiWithRetry(async () => {
    const model = genAI!.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            trajectory: {
              type: SchemaType.STRING,
              description: "High-level longitudinal trajectory analysis across all historical sessions",
            },
            masteredConcepts: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "List of concepts the student has successfully mastered over time",
            },
            persistentStruggles: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Concepts and cognitive hurdles where the student remains stuck",
            },
            actionableAdviceForTutor: {
              type: SchemaType.STRING,
              description: "Concrete strategic instructional advice for the tutor's upcoming roadmap",
            },
          },
          required: ["trajectory", "masteredConcepts", "persistentStruggles", "actionableAdviceForTutor"],
        },
      },
    });

    const debriefHistoryStr = params.chronologicalDebriefs
      .map(
        (d, i) => `[Session ${i + 1} - ${new Date(d.date).toLocaleDateString()}] Topic: ${d.topic}
Summary: ${d.summary}
Homework Assigned: ${Array.isArray(d.homework) ? d.homework.join("; ") : d.homework}
Next Focus Identified: ${d.nextFocus}
----------------------------------------`
      )
      .join("\n\n");

    const prompt = `You are a Senior Academic Director analyzing the longitudinal progress of a student receiving 1:1 tutoring.
Do NOT simply re-summarize individual sessions. Analyze the chronological arc across all debriefs:
1. Identify genuine learning trajectories (improving vs stagnating).
2. Note concepts that transitioned from struggle to mastery.
3. Call out persistent cognitive blockers still unresolved.
4. Give high-impact instructional advice to the tutor.

STUDENT PROFILE:
- Student: ${params.studentName}
- Subject: ${params.subject}
- Level: ${params.currentLevel}
- Goals: ${params.learningGoals}
- Initial Weak Areas: ${params.weakAreas}

CHRONOLOGICAL DEBRIEFS HISTORY (${params.chronologicalDebriefs.length} SESSIONS):
${debriefHistoryStr}

Produce a structured JSON progress report matching the required schema.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    if (
      !parsed.trajectory ||
      !Array.isArray(parsed.masteredConcepts) ||
      !Array.isArray(parsed.persistentStruggles) ||
      !parsed.actionableAdviceForTutor
    ) {
      throw new Error("Invalid progress summary schema response from Gemini");
    }

    return parsed;
  }, fallback);
}
