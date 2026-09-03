import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting TutorFlow database seed (CBSE & Kerala State Board Curricula)...");

  // Clean existing data
  await prisma.sessionDebrief.deleteMany({});
  await prisma.sessionPlan.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Primary Tutor (Dr. Ananya Nair)
  const tutorAnanya = await prisma.user.create({
    data: {
      email: "tutor@tutorflow.com",
      passwordHash,
      name: "Dr. Ananya Nair",
      role: "TUTOR" as any,
    },
  });

  // 2. Create Secondary Isolation Test Tutor (Prof. Rajesh Menon)
  const tutorRajesh = await prisma.user.create({
    data: {
      email: "tutor2@tutorflow.com",
      passwordHash,
      name: "Prof. Rajesh Menon",
      role: "TUTOR" as any,
    },
  });

  console.log(`✅ Created Tutors: ${tutorAnanya.name}, ${tutorRajesh.name}`);

  // 3. Create Students for Dr. Ananya Nair
  // Student 1: Aditya Varma (CBSE Class 12 Mathematics)
  const userAditya = await prisma.user.create({
    data: {
      email: "aditya.varma@example.com",
      passwordHash,
      name: "Aditya Varma",
      role: "STUDENT" as any,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userAditya.id,
      tutorId: tutorAnanya.id,
      subject: "CBSE Class 12 Mathematics",
      currentLevel: "Class 12 (CBSE Board + JEE Main Prep)",
      learningGoals: "Score 95%+ in CBSE Class 12 Board Exam and master 3D Geometry, Vectors, and Definite Integrals.",
      weakAreas: "Struggles with Shortest Distance between skew lines in 3D Geometry and properties of Definite Integrals involving modulus functions.",
    },
  });

  // Student 2: Meera Nambiar (Kerala DHSE Plus Two Physics)
  const userMeera = await prisma.user.create({
    data: {
      email: "meera.nambiar@example.com",
      passwordHash,
      name: "Meera Nambiar",
      role: "STUDENT" as any,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userMeera.id,
      tutorId: tutorAnanya.id,
      subject: "Kerala DHSE Plus Two Physics",
      currentLevel: "Plus Two (Kerala Higher Secondary Board + KEAM Prep)",
      learningGoals: "Master Electromagnetic Induction, Wave Optics, and Semiconductor Electronics to achieve full A+ in Kerala Board and high KEAM rank.",
      weakAreas: "Derivations of lens maker's formula, resolving power in wave optics, and AC circuit phase angle phasor diagrams.",
    },
  });

  // Student 3: Rohan Pillai (CBSE Class 12 Chemistry)
  const userRohan = await prisma.user.create({
    data: {
      email: "rohan.pillai@example.com",
      passwordHash,
      name: "Rohan Pillai",
      role: "STUDENT" as any,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userRohan.id,
      tutorId: tutorAnanya.id,
      subject: "CBSE Class 12 Chemistry",
      currentLevel: "Class 12 (CBSE + NEET Aspirant)",
      learningGoals: "Master Organic Conversions, Named Reactions (Aldehydes, Ketones & Carboxylic Acids), and Electrochemistry Nernst Equation numericals.",
      weakAreas: "Aldol condensation vs Cannizzaro reaction mechanism step-by-step reasoning and predicting major products in electrophilic aromatic substitutions.",
    },
  });

  // Student 4: Sneha Kurian (Kerala SSLC Class 10 Biology)
  const userSneha = await prisma.user.create({
    data: {
      email: "sneha.kurian@example.com",
      passwordHash,
      name: "Sneha Kurian",
      role: "STUDENT" as any,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userSneha.id,
      tutorId: tutorAnanya.id,
      subject: "Kerala SSLC Biology",
      currentLevel: "Class 10 (Kerala State Board - SSLC)",
      learningGoals: "Secure full A+ in Kerala SSLC Biology; master Sensations & Responses (Nervous System) and Chemical Messages for Homeostasis (Endocrine System).",
      weakAreas: "Structure and functions of brain parts (Cerebrum vs Cerebellum), nerve impulse transmission across synapse, and reflex arc diagram labeling.",
    },
  });

  // 4. Create Student for Secondary Tutor (Isolation check)
  const userGautam = await prisma.user.create({
    data: {
      email: "gautam.krishna@example.com",
      passwordHash,
      name: "Gautam Krishna",
      role: "STUDENT" as any,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userGautam.id,
      tutorId: tutorRajesh.id,
      subject: "CBSE Class 11 Physics",
      currentLevel: "Class 11 (CBSE)",
      learningGoals: "Master Laws of Motion, Work Energy Power, and Rotational Dynamics.",
      weakAreas: "Free body diagrams on banking of curved roads and conservation of angular momentum.",
    },
  });

  console.log("✅ Created 5 Students with comprehensive CBSE & Kerala Board profiles");

  const serialize = (val: any) => (typeof val === "string" ? val : JSON.stringify(val));

  // 5. Create Sessions for Aditya Varma (CBSE Maths)
  // Session 1: AI_REVIEWED
  const session1 = await prisma.session.create({
    data: {
      tutorId: tutorAnanya.id,
      studentId: userAditya.id,
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      durationMins: 60,
      topic: "Three Dimensional Geometry: Shortest Distance Between Two Skew Lines",
      status: "AI_REVIEWED" as any,
      notes: "Aditya understood the vector form formula for shortest distance: d = |(a2 - a1) . (b1 x b2)| / |b1 x b2|. However, he struggled with converting Cartesian equations with negative coefficients into standard symmetric form (x - x1)/a = (y - y1)/b = (z - z1)/c. Practiced 4 NCERT Board questions with step-by-step cross-product calculation.",
    },
  });

  await prisma.sessionPlan.create({
    data: {
      sessionId: session1.id,
      objectives: serialize([
        "Express vector and Cartesian equations of lines in 3D Euclidean space",
        "Master the shortest distance formula for skew lines using cross product: d = |(a2 - a1) · (b1 × b2)| / |b1 × b2|",
        "Resolve common Cartesian sign conversion pitfalls from NCERT Chapter 11",
      ]) as any,
      lessonOutline: serialize([
        "10m: Concept check on directional cosines, direction ratios, and vector equations of lines",
        "15m: Derivation of the shortest distance formula between non-intersecting non-parallel skew lines",
        "20m: Guided NCERT Exercise 11.2 5-mark board problem solving with cross product matrix evaluation",
        "15m: Time drill on checking condition for coplanarity of two lines",
      ]) as any,
      practiceQuestions: serialize([
        "Find the shortest distance between the lines r = (i + 2j + k) + λ(i - j + k) and r = (2i - j - k) + μ(2i + j + 2k).",
        "Convert the Cartesian lines (1-x)/2 = (y-3)/4 = (z+1)/5 into standard vector form.",
        "Show that the lines (x+3)/-3 = (y-1)/1 = (z-5)/5 and (x+1)/-1 = (y-2)/2 = (z-5)/5 are coplanar.",
      ]) as any,
    },
  });

  await prisma.sessionDebrief.create({
    data: {
      sessionId: session1.id,
      summary: "Aditya demonstrated strong procedural execution of determinant cross products. His initial hesitation in standardizing non-standard Cartesian equations (e.g. (1-x)/2) was resolved after establishing the habit of factoring out -1 first. He scored 3/4 on the timed board problem drill.",
      homework: serialize([
        "Solve NCERT Class 12 Chapter 11 Miscellaneous Exercise Problems 8, 9, and 12",
        "Practice 2 previous year CBSE Board 5-mark questions on 3D coplanarity",
      ]) as any,
      nextFocus: "Definite Integrals properties involving modulus functions and King's property ∫f(x)dx = ∫f(a+b-x)dx",
    },
  });

  // Session 2: COMPLETED
  const session2 = await prisma.session.create({
    data: {
      tutorId: tutorAnanya.id,
      studentId: userAditya.id,
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      durationMins: 60,
      topic: "Definite Integrals: King's Property & Modulus Functions",
      status: "COMPLETED" as any,
      notes: "Covered properties of definite integrals P4 (King's Rule) and splitting modulus integrals at root points. Aditya solved ∫[0 to π] x sin(x)/(1 + cos^2(x)) dx smoothly using King's rule. Hesitated when breaking intervals for ∫[-1 to 2] |x^3 - x| dx. Ready for debrief generation.",
    },
  });

  await prisma.sessionPlan.create({
    data: {
      sessionId: session2.id,
      objectives: serialize([
        "Master Definite Integral Property P4: ∫[0 to a] f(x) dx = ∫[0 to a] f(a-x) dx",
        "Split limits accurately for piecewise and absolute value functions |f(x)|",
        "Solve standard CBSE 6-mark board evaluation problems with trigonometric symmetry",
      ]) as any,
      lessonOutline: serialize([
        "10m: Review previous debrief carry-over on properties of definite integrals",
        "20m: Modulus function zero-crossing sign analysis and interval splitting",
        "20m: Application of King's property to eliminate algebraic x in trigonometric numerators",
        "10m: Quick-fire drill on periodic properties P7",
      ]) as any,
      practiceQuestions: serialize([
        "Evaluate ∫[-1 to 2] |x^3 - x| dx by splitting the interval at critical roots.",
        "Evaluate ∫[0 to π/2] (sin^(3/2)(x)) / (sin^(3/2)(x) + cos^(3/2)(x)) dx using P4.",
        "Evaluate ∫[0 to π] (x dx) / (a^2 cos^2(x) + b^2 sin^2(x)).",
      ]) as any,
    },
  });

  // Session 3: IN_PROGRESS
  const session3 = await prisma.session.create({
    data: {
      tutorId: tutorAnanya.id,
      studentId: userAditya.id,
      scheduledAt: new Date(Date.now() - 25 * 60 * 1000), // started 25 mins ago
      durationMins: 60,
      topic: "Vectors: Scalar Triple Product and Projection of Vectors",
      status: "IN_PROGRESS" as any,
      notes: "Working through Vector Projection formula: (a . b) / |b|. Aditya is applying dot product projection quickly. Currently demonstrating volume of parallelepiped [a b c] = a . (b x c)...",
    },
  });

  await prisma.sessionPlan.create({
    data: {
      sessionId: session3.id,
      objectives: serialize([
        "Calculate scalar and vector projection of a vector on another line/vector",
        "Evaluate Scalar Triple Product [a b c] and geometrical interpretation as volume",
        "Prove condition for coplanarity of three vectors: [a b c] = 0",
      ]) as any,
      lessonOutline: serialize([
        "10m: Dot product revision and unit vector projection definition",
        "20m: Scalar triple product determinant calculation and cyclic permutation rules",
        "20m: CBSE Board 3-mark questions on coplanar vectors with unknown lambda",
        "10m: Summary and homework setup",
      ]) as any,
      practiceQuestions: serialize([
        "Find the projection of the vector i + 3j + 7k on the vector 7i - j + 8k.",
        "Find the value of λ for which the vectors a = 2i - j + k, b = i + 2j - 3k, and c = 3i + λj + 5k are coplanar.",
        "If a, b, c are three non-coplanar vectors, prove that [a+b  b+c  c+a] = 2[a b c].",
      ]) as any,
    },
  });

  // Session 4: SCHEDULED
  await prisma.session.create({
    data: {
      tutorId: tutorAnanya.id,
      studentId: userAditya.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
      durationMins: 60,
      topic: "Linear Programming: Bounded and Unbounded Feasible Regions",
      status: "SCHEDULED" as any,
    },
  });

  // 6. Create Sessions for Meera Nambiar (Kerala DHSE Physics)
  const sessionMeera1 = await prisma.session.create({
    data: {
      tutorId: tutorAnanya.id,
      studentId: userMeera.id,
      scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      durationMins: 60,
      topic: "Wave Optics: Young's Double Slit Experiment (YDSE) & Fringe Width Derivation",
      status: "AI_REVIEWED" as any,
      notes: "Meera grasped the path difference condition Δx = nλ for constructive and (2n-1)λ/2 for destructive interference. Derived fringe width β = λD/d cleanly on board paper. Handled questions on shifting fringes when immersed in water with 90% accuracy.",
    },
  });

  await prisma.sessionPlan.create({
    data: {
      sessionId: sessionMeera1.id,
      objectives: serialize([
        "Explain Huygens' wave theory of light and wavefront propagation",
        "Derive the analytical expression for fringe width β = λD/d in YDSE",
        "Analyze factors affecting interference pattern (medium refractive index, slit separation)",
      ]) as any,
      lessonOutline: serialize([
        "10m: Diagnostic check on coherent sources and phase difference relationship",
        "20m: Step-by-step mathematical derivation of path difference S2P - S1P ≈ yd/D",
        "15m: Fringe width calculation and dark/bright fringe spacing verification",
        "15m: Kerala Higher Secondary previous year numerical problem drill",
      ]) as any,
      practiceQuestions: serialize([
        "In a Young's double-slit experiment, the slits are separated by 0.28 mm and the screen is placed 1.4 m away. If the distance between the central bright fringe and the fourth bright fringe is 1.2 cm, find the wavelength of light.",
        "What happens to the fringe width if the entire YDSE apparatus is immersed in water (μ = 4/3)?",
        "State two essential conditions for sustained interference of light.",
      ]) as any,
    },
  });

  await prisma.sessionDebrief.create({
    data: {
      sessionId: sessionMeera1.id,
      summary: "Meera showed exceptional clarity on the physical intuition of wave optics and path differences. Her derivation of fringe width was accurate and structured according to Kerala Board valuation schemes. Recommended practicing ray optics spherical surface derivations next.",
      homework: serialize([
        "Solve Kerala SCERT Physics Chapter 10 NCERT Exemplar Numericals 10.3 to 10.7",
        "Write out the full derivation for reflection and refraction laws using Huygens principle",
      ]) as any,
      nextFocus: "Ray Optics: Refraction at Spherical Surfaces and Lens Maker's Formula derivation",
    },
  });

  await prisma.session.create({
    data: {
      tutorId: tutorAnanya.id,
      studentId: userMeera.id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      durationMins: 60,
      topic: "Ray Optics: Refraction at Spherical Surfaces and Lens Maker's Formula",
      status: "SCHEDULED" as any,
    },
  });

  console.log("✅ Created realistic CBSE & Kerala Board sessions with structured plans & debriefs");
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
