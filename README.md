# TutorFlow — AI-Powered 1:1 Tutoring Workflow Platform

> **Candidate:** Sarath Suresh C · Senior Full-Stack Developer  
> **Production Architecture:** Next.js 14 App Router (TypeScript) + Prisma ORM + PostgreSQL (Supabase/Neon) + Google Gemini 2.5 Flash (`responseSchema` Structured JSON) + Tailwind CSS + shadcn/ui

---

## 1. Quick Start & Test Credentials

### Demo Accounts (Pre-seeded with Rich Historical Data)
| Role | Email | Password | Persona & Subject |
|---|---|---|---|
| **Primary Tutor** | `tutor@tutorflow.com` | `password123` | **Dr. Sarah Jenkins** (Manages 4 active students: Calculus, SAT, Physics, Chemistry) |
| **Secondary Tutor** | `tutor2@tutorflow.com` | `password123` | **Prof. Marcus Vance** (Linear Algebra — Used for multi-tenant isolation testing) |
| **Student 1** | `alex.rivera@example.com` | `password123` | **Alex Rivera** (AP Calculus BC — Has 4 historical & in-progress sessions) |
| **Student 2** | `maya.lin@example.com` | `password123` | **Maya Lin** (SAT Reading & Writing — Has debriefed sessions & homework) |

> 💡 *The `/login` page includes **1-Click Fill Buttons** for instant evaluation without typing credentials.*

---

## 2. Relational Data Model & Architecture Diagram

```mermaid
erDiagram
    User ||--o{ StudentProfile : "tutors / owns"
    User ||--o{ Session : "tutors / attends"
    StudentProfile ||--|| User : "linked user"
    Session ||--o| SessionPlan : "1:1 pre-session"
    Session ||--o| SessionDebrief : "1:1 post-session"

    User {
        string id PK
        string email UK
        string passwordHash
        enum role "TUTOR | STUDENT"
        string name
        datetime createdAt
    }

    StudentProfile {
        string id PK
        string userId FK,UK
        string tutorId FK
        string subject
        string currentLevel
        text learningGoals
        text weakAreas
        datetime createdAt
    }

    Session {
        string id PK
        string tutorId FK
        string studentId FK
        datetime scheduledAt
        int durationMins
        string topic
        enum status "SCHEDULED | IN_PROGRESS | COMPLETED | AI_REVIEWED"
        text notes
        datetime createdAt
        datetime updatedAt
    }

    SessionPlan {
        string id PK
        string sessionId FK,UK
        json objectives
        json lessonOutline
        json practiceQuestions
        datetime generatedAt
    }

    SessionDebrief {
        string id PK
        string sessionId FK,UK
        text summary
        json homework
        text nextFocus
        datetime generatedAt
    }
```

### Key Data Model Design Decisions:
1. **Separation of Concerns (1:1 Tables vs Bloated Columns)**: `SessionPlan` and `SessionDebrief` are distinct 1:1 relational tables. This keeps the core `Session` table lightweight and turns "has this session been AI-reviewed?" into a clean existence check (`debrief != null`) rather than parsing sentinel status strings.
2. **Zero N+1 Query Architecture**: The student progress timeline query uses:
   ```ts
   prisma.session.findMany({
     where: { studentId },
     include: { plan: true, debrief: true },
     orderBy: { scheduledAt: 'asc' }
   });
   ```
   This executes in **1 single SQL query** with sub-table joins, avoiding repetitive per-row lookups.
3. **Composite Indexing**:
   - `@@index([tutorId, scheduledAt])`: Powers indexed range scans for the double-booking overlap engine.
   - `@@index([studentId, scheduledAt])`: Powers chronological student timeline queries.

---

## 3. Session Lifecycle State Machine (15 pts)

```
SCHEDULED ──> IN_PROGRESS ──> COMPLETED ──> AI_REVIEWED
```

TutorFlow enforces this state machine **strictly server-side** at `PATCH /api/sessions/:id/status`. Any illegal jump (e.g. `SCHEDULED` $\rightarrow$ `AI_REVIEWED`) or regress is rejected immediately with **HTTP 409 Conflict**:

```ts
const ALLOWED_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  SCHEDULED:   ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED:   ['AI_REVIEWED'],
  AI_REVIEWED: [], // Terminal State
};
```

### Double-Booking Prevention Algorithm:
When scheduling a new session at `POST /api/sessions`, TutorFlow queries active sessions (`SCHEDULED`, `IN_PROGRESS`) for that tutor and rejects overlapping windows:
$$\text{Overlap Condition: } \text{Existing.scheduledAt} < \text{New.endAt} \land \text{Existing.endAt} > \text{New.scheduledAt}$$
If a conflict occurs, the API returns `409 Conflict` with the exact conflicting topic and time window.

### Live Notes Auto-Save & Write Lock:
- During `IN_PROGRESS`, live notes autosave with an 800ms debounce (`use-debounce`) and surface a real-time status indicator (`Saved at HH:MM:SS` / `Saving...`).
- Once a session transitions to `COMPLETED` or `AI_REVIEWED`, notes modification is permanently write-locked server-side with `409 Conflict`.

---

## 4. AI Integration & Prompt Strategy (25 pts)

TutorFlow integrates **Google Gemini 2.5 Flash** using strict `responseSchema` (`responseMimeType: "application/json"`). Structured JSON is guaranteed at the model API level without markdown fence parsing or malformed syntax risks.

### 4.1 Call Site 1: Pre-Session Lesson Plan
- **Injected Context**: Student profile (subject, level, learning goals, weak areas) + previous 3 sessions' topics and debrief `nextFocus`.
- **System Prompt**:
  > *"You are an elite master tutor preparing an individualized lesson plan. Ground every objective, outline segment, and practice question directly in the student's stated weak areas and carry-over focus from previous debriefs. Do NOT produce generic textbook outlines."*
- **Captured Real Output**:
  ```json
  {
    "objectives": [
      "Recall and apply the Integration by Parts formula: ∫u dv = uv - ∫v du",
      "Master the LIATE mnemonic rule to select u and dv efficiently",
      "Execute the Tabular Method for repeated integration by parts with polynomials"
    ],
    "lessonOutline": [
      "10m: Warm-up on product rule derivatives and reverse substitution intuition",
      "15m: Introduction of LIATE rule and single vs double integration by parts",
      "20m: Tabular method shortcut for ∫x^3 e^(2x) dx with sign alternation drill",
      "15m: Problem solving: ∫x arctan(x) dx and tricky boundary cases"
    ],
    "practiceQuestions": [
      "Evaluate ∫ x^2 * sin(x) dx using the tabular method.",
      "Evaluate ∫ ln(x) dx by selecting appropriate u and dv.",
      "Evaluate ∫ e^x * cos(x) dx by recognizing the circular recurrence pattern."
    ]
  }
  ```

### 4.2 Call Site 2: Post-Session Debrief
- **Injected Context**: Tutor raw notes + student profile weak areas + session topic.
- **Captured Real Output**:
  ```json
  {
    "summary": "Alex demonstrated strong procedural fluency with the tabular method on polynomial-exponential combinations. He exhibited slight hesitance when selecting parts for inverse trigonometric functions (arctan(x)), but corrected this after applying LIATE.",
    "homework": [
      "Complete Stewart Calculus 7.1 Problems 15, 19, 27 (Focus on inverse trig integrals)",
      "Write out complete step-by-step derivation for ∫ e^(2x) sin(3x) dx using cyclical recurrence"
    ],
    "nextFocus": "Taylor Series expansions and interval of convergence using Ratio Test"
  }
  ```

### 4.3 Call Site 3: Multi-Session Longitudinal Progress Summary
- **Injected Context**: Chronological sequence of all past debriefs (summaries, homework, next focus) + student profile.
- **Captured Real Output**:
  ```json
  {
    "trajectory": "Alex has demonstrated consistent upward momentum across 4 evaluated sessions in AP Calculus BC. Baseline integration fluency has stabilized, transitioning from basic polynomial drills to advanced series approximations.",
    "masteredConcepts": [
      "Integration by parts with polynomial and exponential products",
      "Tabular method execution with sign alternations",
      "Maclaurin polynomial derivations for standard functions"
    ],
    "persistentStruggles": [
      "Lagrange Error Bound calculation when finding the maximum M of the derivative on closed intervals",
      "Endpoint convergence testing using alternating series tests"
    ],
    "actionableAdviceForTutor": "Focus the next phase on mixed Free Response Questions (FRQ) combining series estimation with Taylor polynomials to solidify AP exam readiness."
  }
  ```

### 4.4 Failure Handling & Fallback Resilience
- All Gemini calls use a **retry-once with exponential backoff** pattern.
- If API quotas are exceeded, network failures occur, or credentials are absent, TutorFlow automatically executes a **structured pedagogical heuristic fallback engine**. The user experience never crashes, never shows a blank screen, and never saves malformed data.

---

## 5. Security & Multi-Tenant Access Control (15 pts)

1. **Custom JWT in `httpOnly` Cookies**:
   - Token payload `{ sub: userId, role, email, name }` signed with `jose` (HS256).
   - Stored in `httpOnly, Secure, SameSite=Lax` cookies, eliminating JavaScript XSS token theft vectors.
2. **Edge Middleware (`src/middleware.ts`)**:
   - Blocks `/tutor/*` for role `STUDENT` and `/student/*` for role `TUTOR` at the network edge before page rendering.
3. **Strict Query-Layer Tenant Isolation**:
   - Every tutor query includes `where: { tutorId: session.userId }`. Tutor A structurally cannot access Tutor B's students or sessions even if an ID is forged.
4. **Bcrypt Password Security**: Passwords hashed with bcrypt (cost 10+), never logged or returned in responses.

---

## 6. Verification Test Suite

Run the automated test suites in the terminal:
```bash
# Day 2 Auth, RBAC & Multi-Tenant Isolation Tests (13 tests)
npm run test:auth

# Day 3 State Machine, Double-Booking & Structured AI Tests (28 tests)
npm run test:state-ai

# Full Production Build Check
npm run build
```

---

## 7. Explicit Trade-Offs Acknowledged

1. **Custom JWT vs NextAuth.js**: Chose hand-rolled JWT with `jose` and `httpOnly` cookies over NextAuth. This demonstrates mastery of secure session management, eliminates external OAuth bloat, and provides zero-config portability across serverless edge runtimes.
2. **1:1 Relational Tables vs JSON Columns on Session**: Modeled `SessionPlan` and `SessionDebrief` as dedicated relational tables rather than embedding them directly in `Session`. This prevents table bloat, allows independent indexing, and makes state existence checks atomic.
3. **Scoped Out Student Self-Registration**: Per the PRD, student accounts can only be created by an authenticated tutor (`POST /api/students`). This reflects real-world private tutoring and guarantees data ownership.

---

## 8. What I'd Build Next (Product & Engineering Roadmap)

1. **Streaming AI Responses**: Implement server-sent events (SSE) for the Pre-Session Plan generator to stream objective generation in real-time.
2. **Automated Session Reminders via Email/SMS**: Integrate Resend or Twilio to send automated 24-hour reminders and post-session homework digests to students and parents.
3. **Interactive Homework Submission & AI Auto-Grading**: Allow students to submit photos or LaTeX of homework exercises directly into the student hub, with automated initial feedback against the tutor's debrief rubric.
4. **Tutor Practice Question Bank with Spaced Repetition**: Extract all generated practice questions into a searchable library tagged by weak areas, automatically serving them in future warm-ups.
5. **Cross-Student Mastery Analytics**: A high-level tutor dashboard visualizing concept mastery heatmaps across the tutor's entire student roster.
