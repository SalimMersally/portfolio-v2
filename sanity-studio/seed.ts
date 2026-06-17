import "dotenv/config";
import { createClient } from "@sanity/client";
import { createReadStream, existsSync } from "fs";
import { join } from "path";

const projectId = process.env.SANITY_PROJECT_ID;
const token = process.env.SANITY_TOKEN;

if (!projectId || projectId === "YOUR_PROJECT_ID") {
  console.error("❌  Set SANITY_PROJECT_ID in sanity-studio/.env");
  process.exit(1);
}
if (!token) {
  console.error("❌  Set SANITY_TOKEN in sanity-studio/.env");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const MEDIA_DIR = join(__dirname, "..", "media");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const upsert = (doc: any) => client.createOrReplace(doc);

async function uploadImage(filename: string) {
  const filepath = join(MEDIA_DIR, filename);
  if (!existsSync(filepath)) {
    console.warn(`  ⚠  Media file not found, skipping: ${filename}`);
    return undefined;
  }
  const asset = await client.assets.upload(
    "image",
    createReadStream(filepath),
    { filename },
  );
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function uploadFile(filename: string) {
  const filepath = join(MEDIA_DIR, filename);
  if (!existsSync(filepath)) {
    console.warn(`  ⚠  Media file not found, skipping: ${filename}`);
    return undefined;
  }
  const asset = await client.assets.upload("file", createReadStream(filepath), {
    filename,
  });
  return { _type: "file", asset: { _type: "reference", _ref: asset._id } };
}

async function wipe() {
  console.log("🗑  Wiping existing documents...");
  const ids: string[] = await client.fetch('*[!(_id in path("_.**"))]._id');
  if (ids.length === 0) {
    console.log("   (nothing to delete)\n");
    return;
  }
  const tx = ids.reduce((t, id) => t.delete(id), client.transaction());
  await tx.commit();
  console.log(`   deleted ${ids.length} document(s)\n`);
}

async function seed() {
  console.log("🌱 Seeding Sanity dataset...\n");
  await wipe();

  // ── Upload media assets ────────────────────────────────────────────────────
  console.log("📤 Uploading media assets...");
  const [
    murexLogo,
    tecfracLogo,
    scandiwebLogo,
    lauLogo,
    lauDegree,
    recodedLogo,
    recodedCert,
    coverLegacyCode,
    coverCleanCode,
    coverCleanCoder,
    coverHeadFirst,
    coverTdd,
    cvFile,
  ] = await Promise.all([
    uploadImage("murex-logo.jpg"),
    uploadImage("tecfrac-logo.jpg"),
    uploadImage("scandiweb-logo.png"),
    uploadImage("lau-logo.png"),
    uploadImage("university-degree.jpeg"),
    uploadImage("recoded-logo.png"),
    uploadImage("recoded-certificate.jpeg"),
    uploadImage("working-effectively-with-legacy-code.jpg"),
    uploadImage("clean-code.jpg"),
    uploadImage("clean-coder.jpg"),
    uploadImage("head-first-design-pattern.jpeg"),
    uploadImage("test-driver-development.jpg"),
    uploadFile("Salim Al Mersally CV.pdf"),
  ]);
  console.log("✔  media assets uploaded\n");

  // ── Profile ────────────────────────────────────────────────────────────────
  await upsert({
    _id: "profile",
    _type: "profile",
    name: "Salim Al Mersally",
    title: "Senior Software Engineer",
    tagline: "Building distributed systems, one service at a time.",
    email: "salim.almersally@gmail.com",
    phone: "+961 76 509 640",
    location: "Beirut, Lebanon",
    github: "https://github.com/SalimMersally",
    linkedin: "https://linkedin.com/in/salim-al-mersally",
    ...(cvFile ? { cv: cvFile } : {}),
  });
  console.log("✔  profile");

  // ── Experience ─────────────────────────────────────────────────────────────
  await Promise.all([
    upsert({
      _id: "exp-tecfrac",
      _type: "experience",
      company: "TecFrac",
      role: "Senior Software Engineer",
      location: "Beirut, Lebanon",
      ...(tecfracLogo ? { logo: tecfracLogo } : {}),
      startDate: "2026-04-01",
      current: true,
      bullets: [
        "Working on Whish Money — a leading digital financial services platform in Lebanon and the MENA region that provides mobile wallets, prepaid card issuance, bill payments, and cross-border money transfers to individuals and businesses.",
        "Building and maintaining backend services on the Card and Wallet team, responsible for real-time card authorization, wallet funding, and transaction processing.",
      ],
      technologies: ["Java", "Spring Boot", "MySQL", "AWS"],
    }),
    upsert({
      _id: "exp-murex-se",
      _type: "experience",
      company: "Murex",
      role: "Software Engineer",
      location: "Beirut, Lebanon",
      ...(murexLogo ? { logo: murexLogo } : {}),
      startDate: "2023-06-01",
      endDate: "2026-05-01",
      current: false,
      bullets: [
        "Worked on a multi-tenant, event-driven SaaS platform built with Java (Spring Boot) and Angular.",
        "Built and maintained long-running, fault-tolerant workflows using Temporal, handling critical business processes that span days or weeks.",
        "Led the design and implementation of a real-time dashboarding module, aggregating data from multiple databases using Trino and delivering interactive charts for system visibility.",
        "Contributed to platform security and tenant isolation using OPA for authorization and PostgreSQL Row-Level Security (RLS) for tenant-level data isolation.",
        "Wrote and maintained unit, integration, and end-to-end tests to keep production regressions minimal and make feature development safer.",
        "Served as Scrum Master, facilitating Agile ceremonies (planning, standups, retrospectives, demos) to improve team collaboration and delivery efficiency.",
        "Onboarded and mentored new team members on system architecture, workflows, and development practices.",
      ],
      technologies: [
        "Java",
        "JavaScript",
        "TypeScript",
        "SQL",
        "HTML",
        "CSS",
        "Spring Boot",
        "Angular",
        "Docker",
        "Git",
        "Maven",
        "Gradle",
        "Jenkins",
        "RabbitMQ",
        "PostgreSQL",
        "MongoDB",
        "Trino",
        "JUnit",
        "Mockito",
        "Jest",
        "Cucumber",
        "Pact",
        "TestContainers",
        "OpenTelemetry",
        "Jaeger",
        "Unleash",
        "Microservices",
        "Distributed Systems",
        "CI/CD",
        "TDD",
        "DDD",
        "Agile",
      ],
    }),
    upsert({
      _id: "exp-murex-pt",
      _type: "experience",
      company: "Murex",
      role: "Part-Time Software Engineer",
      location: "Beirut, Lebanon",
      ...(murexLogo ? { logo: murexLogo } : {}),
      startDate: "2022-10-01",
      endDate: "2023-05-31",
      current: false,
      bullets: [
        "Implemented distributed tracing using OpenTelemetry and Jaeger across multiple microservices, covering REST APIs, Temporal workflows, and RabbitMQ message flows — enabling faster root-cause analysis and improved observability.",
        "Designed and integrated a feature flagging system using Unleash, enabling gradual rollouts, safer releases, and controlled feature exposure across tenants.",
        "Built an email notification system to alert users about pending actions and long-running processes, improving responsiveness and reducing operational delays.",
      ],
      technologies: [
        "Java",
        "JavaScript",
        "TypeScript",
        "SQL",
        "HTML",
        "CSS",
        "Spring Boot",
        "Angular",
        "Docker",
        "Git",
        "Maven",
        "Gradle",
        "Jenkins",
        "RabbitMQ",
        "PostgreSQL",
        "MongoDB",
        "Trino",
        "JUnit",
        "Mockito",
        "Jest",
        "Cucumber",
        "Pact",
        "TestContainers",
        "OpenTelemetry",
        "Jaeger",
        "Unleash",
        "Microservices",
        "Distributed Systems",
        "CI/CD",
        "TDD",
        "DDD",
        "Agile",
      ],
    }),
    upsert({
      _id: "exp-murex-intern",
      _type: "experience",
      company: "Murex",
      role: "Software Engineer Intern",
      location: "Beirut, Lebanon",
      ...(murexLogo ? { logo: murexLogo } : {}),
      startDate: "2022-06-01",
      endDate: "2022-08-31",
      current: false,
      bullets: [
        "Led the initial prototyping and evaluation of Temporal, establishing it as the workflow orchestration engine now used across the platform for long-running business processes.",
      ],
      technologies: ["Java", "Spring Boot", "Temporal", "Maven"],
    }),
    upsert({
      _id: "exp-scandiweb",
      _type: "experience",
      company: "Scandiweb",
      role: "Part-Time React Developer",
      location: "Remote",
      ...(scandiwebLogo ? { logo: scandiwebLogo } : {}),
      startDate: "2022-02-01",
      endDate: "2022-05-31",
      current: false,
      bullets: [
        "Fixed bugs across ScandiPWA, an open-source React/GraphQL Progressive Web App storefront used by global e-commerce merchants, resolving UI and state management issues.",
        "Delivered features for Printerbase, a UK-based printer retailer, extending product listing pages and checkout flows to meet the client's e-commerce requirements.",
      ],
      technologies: ["JavaScript", "React", "GraphQL"],
    }),
  ]);
  console.log("✔  experience (5 entries)");

  // ── Skills ─────────────────────────────────────────────────────────────────
  await Promise.all([
    upsert({
      _id: "skill-languages",
      _type: "skill",
      category: "Languages",
      items: [
        "Java",
        "Python",
        "JavaScript",
        "TypeScript",
        "SQL",
        "HTML",
        "CSS",
      ],
      order: 1,
    }),
    upsert({
      _id: "skill-frameworks",
      _type: "skill",
      category: "Frameworks",
      items: ["Spring Boot", "Angular", "React"],
      order: 2,
    }),
    upsert({
      _id: "skill-tools",
      _type: "skill",
      category: "Systems & Tools",
      items: [
        "Docker",
        "Git",
        "Maven",
        "Gradle",
        "Jenkins",
        "RabbitMQ",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Trino",
        "AWS",
      ],
      order: 3,
    }),
    upsert({
      _id: "skill-testing",
      _type: "skill",
      category: "Testing & Observability",
      items: [
        "JUnit",
        "Mockito",
        "Jest",
        "Cucumber",
        "Pact",
        "TestContainers",
        "OpenTelemetry",
        "Jaeger",
        "Unleash",
      ],
      order: 4,
    }),
    upsert({
      _id: "skill-practices",
      _type: "skill",
      category: "Practices",
      items: [
        "Microservices",
        "Distributed Systems",
        "CI/CD",
        "TDD",
        "DDD",
        "Agile",
      ],
      order: 5,
    }),
  ]);
  console.log("✔  skills (5 categories)");

  // ── Education ──────────────────────────────────────────────────────────────
  await Promise.all([
    upsert({
      _id: "edu-lau",
      _type: "education",
      type: "university",
      degree: "Bachelor of Engineering",
      field: "Computer Engineering",
      institution: "Lebanese American University",
      location: "Byblos, Lebanon",
      ...(lauLogo ? { logo: lauLogo } : {}),
      ...(lauDegree ? { credential: lauDegree } : {}),
      gpa: "3.8 / 4.0",
      startDate: "2019-09-01",
      endDate: "2023-05-31",
      highlights: [
        "Graduated with High Distinction",
        "Named on the Dean's Distinction List",
        "Selected for the University Honor Program",
        "Recipient of the HES Scholarship (full program) awarded by USAID",
      ],
      order: 1,
    }),
    upsert({
      _id: "edu-recoded",
      _type: "education",
      type: "bootcamp",
      degree: "Frontend Web Development Bootcamp",
      institution: "Re:Coded",
      location: "Remote",
      ...(recodedLogo ? { logo: recodedLogo } : {}),
      ...(recodedCert ? { credential: recodedCert } : {}),
      startDate: "2021-04-01",
      endDate: "2021-08-31",
      highlights: [
        "Completed a five-month immersive coding bootcamp with 400+ hours of curriculum and project-based learning",
        "Admitted through a highly competitive programme with a 5% acceptance rate",
        "Co-created various responsive web applications from scratch",
      ],
      technologies: ["HTML", "CSS", "JavaScript", "React"],
      order: 2,
    }),
  ]);
  console.log("✔  education");

  // ── Projects ───────────────────────────────────────────────────────────────
  await Promise.all([
    upsert({
      _id: "project-cargo",
      _type: "project",
      title: "Car Go",
      slug: { _type: "slug", current: "car-go" },
      description:
        "Full-stack car rental platform enabling users to register, list vehicles, and manage rental bookings. Implemented authentication with Spring Security and JWT, integrated PostgreSQL for persistence, and containerized services with Docker.",
      date: "2023-04-01",
      techStack: [
        "Java",
        "Spring Boot",
        "React",
        "PostgreSQL",
        "Docker",
        "JWT",
      ],
      githubUrl: "https://github.com/SalimMersally/CarGo-car-renting-app",
      order: 1,
    }),
    upsert({
      _id: "project-lawen",
      _type: "project",
      title: "Lawen Taxi App",
      slug: { _type: "slug", current: "lawen-taxi-app" },
      description:
        "Taxi booking application where users can request rides, drivers accept bookings, and admins manage platform operations. RESTful APIs built with Node.js and Express, integrated with MySQL for data persistence.",
      date: "2023-01-01",
      techStack: ["React", "Node.js", "Express", "MySQL"],
      githubUrl: "https://github.com/SalimMersally/LAWEN-Taxi-App",
      order: 2,
    }),
  ]);
  console.log("✔  projects (2 entries)");

  // ── Books ──────────────────────────────────────────────────────────────────
  await Promise.all([
    upsert({
      _id: "book-legacy-code",
      _type: "book",
      title: "Working Effectively with Legacy Code",
      author: "Michael C. Feathers",
      ...(coverLegacyCode ? { cover: coverLegacyCode } : {}),
      status: "reading",
    }),
    upsert({
      _id: "book-tdd",
      _type: "book",
      title: "Test Driven Development: By Example",
      author: "Kent Beck",
      ...(coverTdd ? { cover: coverTdd } : {}),
      status: "read",
    }),
    upsert({
      _id: "book-clean-code",
      _type: "book",
      title: "Clean Code",
      author: "Robert C. Martin",
      ...(coverCleanCode ? { cover: coverCleanCode } : {}),
      status: "read",
    }),
    upsert({
      _id: "book-clean-coder",
      _type: "book",
      title: "The Clean Coder",
      author: "Robert C. Martin",
      ...(coverCleanCoder ? { cover: coverCleanCoder } : {}),
      status: "read",
    }),
    upsert({
      _id: "book-head-first-dp",
      _type: "book",
      title: "Head First Design Patterns",
      author: "Eric Freeman & Elisabeth Robson",
      ...(coverHeadFirst ? { cover: coverHeadFirst } : {}),
      status: "read",
    }),
  ]);
  console.log("✔  books (5 entries)");

  console.log("\n✅  Seed complete!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
