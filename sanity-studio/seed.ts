import 'dotenv/config';
import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID;
const token = process.env.SANITY_TOKEN;

if (!projectId || projectId === 'YOUR_PROJECT_ID') {
  console.error('❌  Set SANITY_PROJECT_ID in sanity-studio/.env');
  process.exit(1);
}
if (!token) {
  console.error('❌  Set SANITY_TOKEN in sanity-studio/.env');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const upsert = (doc: any) => client.createOrReplace(doc);

async function seed() {
  console.log('🌱 Seeding Sanity dataset...\n');

  // ── Site Settings ──────────────────────────────────────────────────────────
  await upsert({
    _id: 'siteSettings',
    _type: 'siteSettings',
    name: 'Salim Al Mersally',
    title: 'Software Engineer',
    tagline: 'Building distributed systems, one service at a time.',
    email: 'salim.almersally@gmail.com',
    phone: '+961 76 509 640',
    location: 'Beirut, Lebanon',
    github: 'https://github.com/SalimMersally',
    linkedin: 'https://linkedin.com/in/salim-al-mersally',
    contactFormEnabled: false,
    bio: [
      {
        _type: 'block',
        _key: 'bio-1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'bio-1-span',
            text: 'Software engineer with a passion for distributed systems, clean code, and high-availability infrastructure. Currently building fintech products at TecFrac, previously engineering enterprise SaaS platforms at Murex.',
            marks: [],
          },
        ],
      },
    ],
  });
  console.log('✔  siteSettings');

  // ── Theme ──────────────────────────────────────────────────────────────────
  await upsert({
    _id: 'theme',
    _type: 'theme',
    colorAccent: '#6366f1',
    colorBg: '#0f0f0f',
    colorSurface: '#1a1a1a',
    colorText: '#f5f5f5',
    colorTextMuted: '#a1a1aa',
    fontHeading: 'Inter',
    fontBody: 'Inter',
    fontMono: 'JetBrains Mono',
    defaultMode: 'dark',
    borderRadius: 'rounded',
    spacing: 'comfortable',
  });
  console.log('✔  theme');

  // ── Experience ─────────────────────────────────────────────────────────────
  await Promise.all([
    upsert({
      _id: 'exp-tecfrac',
      _type: 'experience',
      company: 'TecFrac',
      role: 'Senior Software Engineer',
      location: 'Beirut, Lebanon',
      startDate: '2026-04-01',
      current: true,
      bullets: [
        'Working on Whish Money — a leading digital financial services platform in Lebanon and the MENA region that provides mobile wallets, prepaid card issuance, bill payments, and cross-border money transfers to individuals and businesses.',
        'Building and maintaining backend services on the Card and Wallet team, responsible for real-time card authorization, wallet funding, and transaction processing.',
        'Delivering compliant, high-availability payment features within a regulated fintech environment, collaborating with cross-functional teams across product, compliance, and infrastructure.',
      ],
      technologies: ['Java', 'Spring Boot', 'Angular', 'PostgreSQL', 'Docker', 'Microservices'],
      order: 1,
    }),
    upsert({
      _id: 'exp-murex-se',
      _type: 'experience',
      company: 'Murex',
      role: 'Software Engineer',
      location: 'Beirut, Lebanon',
      startDate: '2023-06-01',
      endDate: '2026-05-01',
      current: false,
      bullets: [
        'Worked on a multi-tenant, event-driven SaaS platform built with Java (Spring Boot) and Angular.',
        'Built and maintained long-running, fault-tolerant workflows using Temporal, handling critical business processes that span days or weeks.',
        'Led the design and implementation of a real-time dashboarding module, aggregating data from multiple databases using Trino and delivering interactive charts for system visibility.',
        'Contributed to platform security and tenant isolation using OPA for authorization and PostgreSQL Row-Level Security (RLS) for tenant-level data isolation.',
        'Wrote and maintained unit, integration, and end-to-end tests to keep production regressions minimal and make feature development safer.',
        'Served as Scrum Master, facilitating Agile ceremonies (planning, standups, retrospectives, demos) to improve team collaboration and delivery efficiency.',
        'Onboarded and mentored new team members on system architecture, workflows, and development practices.',
      ],
      technologies: [
        'Java', 'Spring Boot', 'Angular', 'Temporal', 'Trino',
        'PostgreSQL', 'OPA', 'RabbitMQ', 'Docker', 'Jenkins',
      ],
      order: 2,
    }),
    upsert({
      _id: 'exp-murex-pt',
      _type: 'experience',
      company: 'Murex',
      role: 'Part-Time Software Engineer',
      location: 'Beirut, Lebanon',
      startDate: '2022-10-01',
      endDate: '2023-05-31',
      current: false,
      bullets: [
        'Implemented distributed tracing using OpenTelemetry and Jaeger across multiple microservices, covering REST APIs, Temporal workflows, and RabbitMQ message flows — enabling faster root-cause analysis and improved observability.',
        'Designed and integrated a feature flagging system using Unleash, enabling gradual rollouts, safer releases, and controlled feature exposure across tenants.',
        'Built an email notification system to alert users about pending actions and long-running processes, improving responsiveness and reducing operational delays.',
      ],
      technologies: ['Java', 'OpenTelemetry', 'Jaeger', 'Unleash', 'RabbitMQ', 'Temporal'],
      order: 3,
    }),
    upsert({
      _id: 'exp-murex-intern',
      _type: 'experience',
      company: 'Murex',
      role: 'Software Engineer Intern',
      location: 'Beirut, Lebanon',
      startDate: '2022-06-01',
      endDate: '2022-08-31',
      current: false,
      bullets: [
        'Led the initial prototyping and evaluation of Temporal, establishing it as the workflow orchestration engine now used across the platform for long-running business processes.',
      ],
      technologies: ['Java', 'Temporal', 'Spring Boot'],
      order: 4,
    }),
  ]);
  console.log('✔  experience (4 entries)');

  // ── Skills ─────────────────────────────────────────────────────────────────
  await Promise.all([
    upsert({
      _id: 'skill-languages',
      _type: 'skill',
      category: 'Languages',
      items: ['Java', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'HTML', 'CSS'],
      order: 1,
    }),
    upsert({
      _id: 'skill-frameworks',
      _type: 'skill',
      category: 'Frameworks',
      items: ['Spring Boot', 'Angular', 'React', 'Node.js'],
      order: 2,
    }),
    upsert({
      _id: 'skill-tools',
      _type: 'skill',
      category: 'Systems & Tools',
      items: ['Docker', 'Git', 'Maven', 'Gradle', 'Jenkins', 'RabbitMQ', 'PostgreSQL', 'MongoDB', 'Trino'],
      order: 3,
    }),
    upsert({
      _id: 'skill-testing',
      _type: 'skill',
      category: 'Testing & Observability',
      items: ['JUnit', 'Mockito', 'Jest', 'Cucumber', 'Pact', 'TestContainers', 'OpenTelemetry', 'Jaeger', 'Unleash'],
      order: 4,
    }),
    upsert({
      _id: 'skill-practices',
      _type: 'skill',
      category: 'Practices',
      items: ['Microservices', 'Distributed Systems', 'CI/CD', 'TDD', 'DDD', 'Agile'],
      order: 5,
    }),
  ]);
  console.log('✔  skills (5 categories)');

  // ── Education ──────────────────────────────────────────────────────────────
  await upsert({
    _id: 'edu-lau',
    _type: 'education',
    degree: 'Bachelor of Engineering',
    field: 'Computer Engineering',
    institution: 'Lebanese American University',
    location: 'Byblos, Lebanon',
    gpa: '3.8 / 4.0',
    startDate: '2019-09-01',
    endDate: '2023-05-31',
    highlights: ['GPA: 3.8 / 4.0'],
    order: 1,
  });
  console.log('✔  education');

  // ── Projects ───────────────────────────────────────────────────────────────
  await Promise.all([
    upsert({
      _id: 'project-cargo',
      _type: 'project',
      title: 'Car Go',
      slug: { _type: 'slug', current: 'car-go' },
      description:
        'Full-stack car rental platform enabling users to register, list vehicles, and manage rental bookings. Implemented authentication with Spring Security and JWT, integrated PostgreSQL for persistence, and containerized services with Docker.',
      techStack: ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'Docker', 'JWT'],
      githubUrl: 'https://github.com/SalimMersally/CarGo-car-renting-app',
      featured: true,
      order: 1,
    }),
    upsert({
      _id: 'project-lawen',
      _type: 'project',
      title: 'Lawen Taxi App',
      slug: { _type: 'slug', current: 'lawen-taxi-app' },
      description:
        'Taxi booking application where users can request rides, drivers accept bookings, and admins manage platform operations. RESTful APIs built with Node.js and Express, integrated with MySQL for data persistence.',
      techStack: ['React', 'Node.js', 'Express', 'MySQL'],
      githubUrl: 'https://github.com/SalimMersally/LAWEN-Taxi-App',
      featured: true,
      order: 2,
    }),
  ]);
  console.log('✔  projects (2 entries)');

  // ── Books ──────────────────────────────────────────────────────────────────
  await Promise.all([
    upsert({
      _id: 'book-legacy-code',
      _type: 'book',
      title: 'Working Effectively with Legacy Code',
      author: 'Michael C. Feathers',
      status: 'reading',
      order: 1,
    }),
    upsert({
      _id: 'book-tdd',
      _type: 'book',
      title: 'Test Driven Development: By Example',
      author: 'Kent Beck',
      status: 'read',
      rating: 5,
      order: 2,
    }),
    upsert({
      _id: 'book-clean-code',
      _type: 'book',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      status: 'read',
      rating: 5,
      order: 3,
    }),
    upsert({
      _id: 'book-clean-coder',
      _type: 'book',
      title: 'The Clean Coder',
      author: 'Robert C. Martin',
      status: 'read',
      rating: 5,
      order: 4,
    }),
    upsert({
      _id: 'book-head-first-dp',
      _type: 'book',
      title: 'Head First Design Patterns',
      author: 'Eric Freeman & Elisabeth Robson',
      status: 'read',
      rating: 5,
      order: 5,
    }),
  ]);
  console.log('✔  books (5 entries)');

  console.log('\n✅  Seed complete!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
