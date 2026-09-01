import { PrismaClient, Role, SessionStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting TutorFlow database seed...");

  // Clean existing data
  await prisma.sessionDebrief.deleteMany({});
  await prisma.sessionPlan.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Primary Tutor
  const tutorSarah = await prisma.user.create({
    data: {
      email: "tutor@tutorflow.com",
      passwordHash,
      name: "Dr. Sarah Jenkins",
      role: Role.TUTOR,
    },
  });

  // 2. Create Secondary Isolation Test Tutor
  const tutorMarcus = await prisma.user.create({
    data: {
      email: "tutor2@tutorflow.com",
      passwordHash,
      name: "Prof. Marcus Vance",
      role: Role.TUTOR,
    },
  });

  console.log(`✅ Created Tutors: ${tutorSarah.name}, ${tutorMarcus.name}`);

  // 3. Create Students for Dr. Sarah Jenkins
  // Student 1: Alex Rivera (Calculus BC)
  const userAlex = await prisma.user.create({
    data: {
      email: "alex.rivera@example.com",
      passwordHash,
      name: "Alex Rivera",
      role: Role.STUDENT,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userAlex.id,
      tutorId: tutorSarah.id,
      subject: "AP Calculus BC",
      currentLevel: "Grade 12 (Advanced Placement)",
      learningGoals: "Master integration by parts, Taylor series convergence tests, and polar coordinates to score a 5 on the AP Exam.",
      weakAreas: "Struggles with bounding errors using Lagrange Error Bound and setting up area between parametric curves.",
    },
  });

  // Student 2: Maya Lin (SAT English)
  const userMaya = await prisma.user.create({
    data: {
      email: "maya.lin@example.com",
      passwordHash,
      name: "Maya Lin",
      role: Role.STUDENT,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userMaya.id,
      tutorId: tutorSarah.id,
      subject: "SAT Reading & Writing",
      currentLevel: "High School Junior (Target: 1550+)",
      learningGoals: "Improve reading comprehension speed, eliminate punctuation errors, and master rhetoric analysis in historical texts.",
      weakAreas: "Transitions between paragraphs, semicolon vs colon rules, and inference questions under time pressure.",
    },
  });

  // Student 3: Ethan Hunt (AP Physics C)
  const userEthan = await prisma.user.create({
    data: {
      email: "ethan.hunt@example.com",
      passwordHash,
      name: "Ethan Hunt",
      role: Role.STUDENT,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userEthan.id,
      tutorId: tutorSarah.id,
      subject: "AP Physics C: Mechanics",
      currentLevel: "Grade 12",
      learningGoals: "Excel in rotational dynamics, simple harmonic motion, and work-energy theorem with variable forces.",
      weakAreas: "Setting up moment of inertia integrals, non-conservative work calculations, and free body diagrams on inclined rolling objects.",
    },
  });

  // Student 4: Chloe Bennett (Organic Chemistry)
  const userChloe = await prisma.user.create({
    data: {
      email: "chloe.bennett@example.com",
      passwordHash,
      name: "Chloe Bennett",
      role: Role.STUDENT,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userChloe.id,
      tutorId: tutorSarah.id,
      subject: "Organic Chemistry I",
      currentLevel: "Undergraduate Sophomore (Pre-Med)",
      learningGoals: "Master SN1/SN2 and E1/E2 reaction mechanisms, stereochemistry (R/S designation), and NMR spectroscopy interpretation.",
      weakAreas: "Carbocation rearrangement prediction (hydride/methyl shifts), solvent effects on nucleophilicity vs basicity.",
    },
  });

  // 4. Create Student for Secondary Tutor (Isolation check)
  const userJordan = await prisma.user.create({
    data: {
      email: "jordan.lee@example.com",
      passwordHash,
      name: "Jordan Lee",
      role: Role.STUDENT,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userJordan.id,
      tutorId: tutorMarcus.id,
      subject: "Linear Algebra",
      currentLevel: "Undergraduate Freshman",
      learningGoals: "Master eigenvalues/eigenvectors, SVD, and vector space transformations.",
      weakAreas: "Orthogonal projections and Gram-Schmidt process.",
    },
  });

  console.log("✅ Created 5 Students with comprehensive profiles");

  // 5. Create Sessions for Alex Rivera
  // Session 1: AI_REVIEWED
  const session1 = await prisma.session.create({
    data: {
      tutorId: tutorSarah.id,
      studentId: userAlex.id,
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      durationMins: 60,
      topic: "Techniques of Integration: Integration by Parts & Tabular Method",
      status: SessionStatus.AI_REVIEWED,
      notes: "Alex caught on quickly to tabular method for polynomial * exponential. However, got tripped up when choosing u and dv for inverse trig functions like arctan(x). Need to remind LIATE rule. Finished 5 practice problems with 80% accuracy.",
    },
  });

  await prisma.sessionPlan.create({
    data: {
      sessionId: session1.id,
      objectives: [
        "Recall and apply the Integration by Parts formula: ∫u dv = uv - ∫v du",
        "Master the LIATE mnemonic rule to select u and dv efficiently",
        "Execute the Tabular Method for repeated integration by parts with polynomials",
      ],
      lessonOutline: [
        "10m: Warm-up on product rule derivatives and reverse substitution intuition",
        "15m: Introduction of LIATE rule and single vs double integration by parts",
        "20m: Tabular method shortcut for ∫x^3 e^(2x) dx with sign alternation drill",
        "15m: Problem solving: ∫x arctan(x) dx and tricky boundary cases",
      ],
      practiceQuestions: [
        "Evaluate ∫ x^2 * sin(x) dx using the tabular method.",
        "Evaluate ∫ ln(x) dx by selecting appropriate u and dv.",
        "Evaluate ∫ e^x * cos(x) dx by recognizing the circular recurrence pattern.",
      ],
    },
  });

  await prisma.sessionDebrief.create({
    data: {
      sessionId: session1.id,
      summary: "Alex demonstrated strong procedural fluency with the tabular method on polynomial-exponential combinations. He exhibited slight hesitance when selecting parts for inverse trigonometric functions (e.g., arctan(x)), but corrected this after applying LIATE. Overall solid engagement and 80% accuracy on timed drills.",
      homework: [
        "Complete Stewart Calculus 7.1 Problems 15, 19, 27 (Focus on inverse trig integrals)",
        "Write out complete step-by-step derivation for ∫ e^(2x) sin(3x) dx using cyclical recurrence",
      ],
      nextFocus: "Taylor Series expansions and interval of convergence using Ratio Test",
    },
  });

  // Session 2: COMPLETED
  const session2 = await prisma.session.create({
    data: {
      tutorId: tutorSarah.id,
      studentId: userAlex.id,
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      durationMins: 60,
      topic: "Taylor Series & Maclaurin Polynomials",
      status: SessionStatus.COMPLETED,
      notes: "Derivation of sin(x) and e^x Taylor series went smooth. Still showing hesitation when finding the interval of convergence using Ratio Test, particularly handling absolute values and endpoints.",
    },
  });

  await prisma.sessionPlan.create({
    data: {
      sessionId: session2.id,
      objectives: [
        "Understand Maclaurin and Taylor polynomial general formulas",
        "Build intuition for series approximation of transcendental functions",
        "Apply Ratio Test to compute Radius of Convergence",
      ],
      lessonOutline: [
        "10m: Review previous debrief focus on series expansions",
        "20m: Deriving general term for 1/(1-x), e^x, and cos(x)",
        "20m: Ratio test step-by-step limit evaluation",
        "10m: Endpoint convergence testing strategy",
      ],
      practiceQuestions: [
        "Find the 4th degree Maclaurin polynomial for f(x) = ln(1+x).",
        "Find the radius of convergence for Σ (n * (x-2)^n) / (3^n * (n+1)).",
        "Determine if the endpoints converge for the power series of 1/(1+x^2).",
      ],
    },
  });

  // Session 3: IN_PROGRESS
  const session3 = await prisma.session.create({
    data: {
      tutorId: tutorSarah.id,
      studentId: userAlex.id,
      scheduledAt: new Date(Date.now() - 30 * 60 * 1000), // started 30 mins ago
      durationMins: 60,
      topic: "Lagrange Error Bound & Alternating Series Estimation",
      status: SessionStatus.IN_PROGRESS,
      notes: "Working through Alternating Series Estimation Theorem. Alex is doing well with |S - S_n| <= b_{n+1}. Currently moving into Lagrange Error Bound formula: |R_n(x)| <= M / (n+1)! * |x - c|^(n+1)...",
    },
  });

  await prisma.sessionPlan.create({
    data: {
      sessionId: session3.id,
      objectives: [
        "Distinguish between Alternating Series Remainder and Lagrange Error Bound",
        "Find the maximum value M of the (n+1)-th derivative on the given interval",
        "Calculate bounding error for polynomial approximation of cos(0.2)",
      ],
      lessonOutline: [
        "10m: Alternating Series estimation review and condition checks",
        "20m: Lagrange error theorem decomposition & bounding M",
        "20m: AP Exam Free Response Question walk-through",
        "10m: Summary and homework setup",
      ],
      practiceQuestions: [
        "Use the Alternating Series Error Bound to estimate error approximating Σ (-1)^n / n! with 4 terms.",
        "Find an upper bound for the error in approximating e^0.1 by 1 + 0.1 + (0.1)^2 / 2.",
        "How many terms of the Maclaurin series for sin(x) are required to approximate sin(0.5) to within 10^-5?",
      ],
    },
  });

  // Session 4: SCHEDULED
  await prisma.session.create({
    data: {
      tutorId: tutorSarah.id,
      studentId: userAlex.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
      durationMins: 60,
      topic: "Parametric Curves & Polar Coordinates",
      status: SessionStatus.SCHEDULED,
    },
  });

  // 6. Create Sessions for Maya Lin
  const sessionMaya1 = await prisma.session.create({
    data: {
      tutorId: tutorSarah.id,
      studentId: userMaya.id,
      scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      durationMins: 60,
      topic: "Mastering Punctuation: Colon, Semicolon & Dash Rules",
      status: SessionStatus.AI_REVIEWED,
      notes: "Maya mastered semicolon rules quickly (joining independent clauses). Semicolons with transitional adverbs ('however', 'therefore') are clear now. Em-dashes for non-essential clauses need a quick reinforcement drill.",
    },
  });

  await prisma.sessionPlan.create({
    data: {
      sessionId: sessionMaya1.id,
      objectives: [
        "Identify independent vs dependent clauses under test conditions",
        "Apply correct usage rules for semicolons, colons, and single/double em-dashes",
        "Eliminate comma splice errors in complex sentences",
      ],
      lessonOutline: [
        "10m: Baseline diagnostic on 10 punctuation questions",
        "20m: Rule synthesis: Colon requirements (must follow independent clause)",
        "15m: Em-dash pairing vs single dramatic dash",
        "15m: Timed 15-question speed drill",
      ],
      practiceQuestions: [
        "Which punctuation mark correctly completes: 'She brought three essentials ___ water, a map, and a compass'?",
        "Identify the comma splice: 'The experiment failed, we need to restart from scratch.'",
        "Correctly punctuate: 'The CEO who founded the company twenty years ago retired yesterday.'",
      ],
    },
  });

  await prisma.sessionDebrief.create({
    data: {
      sessionId: sessionMaya1.id,
      summary: "Maya showed great improvement on clause boundary identification. She scored 14/15 on the speed drill after clarifying the rule that a colon must be preceded by a complete independent clause. Minor review required on em-dash consistency.",
      homework: [
        "Complete SAT Writing Module 3 Practice Set (20 questions)",
        "Review rule sheet on non-essential appositive phrases",
      ],
      nextFocus: "Rhetorical Synthesis and transitions between contrasting ideas",
    },
  });

  await prisma.session.create({
    data: {
      tutorId: tutorSarah.id,
      studentId: userMaya.id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      durationMins: 60,
      topic: "Rhetorical Synthesis & Passage Transitions",
      status: SessionStatus.SCHEDULED,
    },
  });

  console.log("✅ Created realistic historical, in-progress, and scheduled sessions with plans & debriefs");
  console.log("🌱 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
