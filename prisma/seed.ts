import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Users
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const userPassword = await bcrypt.hash('UserPassword123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@portfolio.dev' },
    update: {},
    create: {
      name: 'Portfolio Admin',
      email: 'admin@portfolio.dev',
      password: adminPassword,
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@portfolio.dev' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'user@portfolio.dev',
      password: userPassword,
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  });

  console.log(`✅ Users seeded: ${admin.email} (ADMIN), ${regularUser.email} (USER)`);

  // 2. Seed Skills
  const skillsData = [
    { name: 'TypeScript', category: 'Languages', icon: 'si:typescript', proficiency: 95 },
    { name: 'Node.js & Bun', category: 'Backend', icon: 'si:nodedotjs', proficiency: 92 },
    { name: 'ElysiaJS', category: 'Backend', icon: 'si:elysia', proficiency: 90 },
    { name: 'PostgreSQL', category: 'Database', icon: 'si:postgresql', proficiency: 88 },
    { name: 'Prisma ORM', category: 'Database', icon: 'si:prisma', proficiency: 90 },
    { name: 'React & Next.js', category: 'Frontend', icon: 'si:react', proficiency: 92 },
    { name: 'Tailwind CSS', category: 'Frontend', icon: 'si:tailwindcss', proficiency: 95 },
    { name: 'Docker & Compose', category: 'DevOps', icon: 'si:docker', proficiency: 85 },
    { name: 'AWS Cloud', category: 'DevOps', icon: 'si:amazonwebservices', proficiency: 80 },
    { name: 'Redis', category: 'Database', icon: 'si:redis', proficiency: 82 },
    { name: 'GraphQL', category: 'Backend', icon: 'si:graphql', proficiency: 85 },
    { name: 'Git & CI/CD', category: 'Tools', icon: 'si:git', proficiency: 90 },
  ];

  for (const skill of skillsData) {
    const existing = await prisma.skill.findFirst({
      where: { name: skill.name },
    });
    if (!existing) {
      await prisma.skill.create({ data: skill });
    }
  }
  console.log(`✅ Skills seeded: ${skillsData.length} skills`);

  // 3. Seed Projects
  const projectsData = [
    {
      title: 'CloudScale - Distributed Microservices Platform',
      slug: 'cloudscale-distributed-microservices',
      description: 'High-throughput microservices architecture with real-time telemetry, rate limiting, and zero-downtime deployment pipeline.',
      content: 'CloudScale is an enterprise-grade microservices demonstration implementing event-driven streaming with Kafka, resilient PostgreSQL data layers, and fast ElysiaJS gateway endpoints.',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      githubUrl: 'https://github.com/portfolio-admin/cloudscale',
      liveUrl: 'https://cloudscale.example.com',
      featured: true,
      technologies: ['ElysiaJS', 'TypeScript', 'PostgreSQL', 'Docker', 'Prisma', 'Redis'],
    },
    {
      title: 'DevPulse - Developer Productivity & Analytics Suite',
      slug: 'devpulse-productivity-analytics',
      description: 'Comprehensive performance and workflow tracking dashboard for engineering teams with Git integrations and automated sprint insights.',
      content: 'DevPulse integrates with GitHub and Jira webhooks to extract developer velocity metrics, code review turnaround times, and sprint predictability charts.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      githubUrl: 'https://github.com/portfolio-admin/devpulse',
      liveUrl: 'https://devpulse.example.com',
      featured: true,
      technologies: ['TypeScript', 'Next.js', 'PostgreSQL', 'TailwindCSS', 'Chart.js'],
    },
    {
      title: 'AuraPay - Secure Payment & Invoicing Gateway',
      slug: 'aurapay-secure-payment-gateway',
      description: 'PCI-compliant payment orchestration API supporting multi-currency billing, webhooks, and subscription lifecycles.',
      content: 'AuraPay abstracts complex third-party payment rails into a unified, idempotent REST API featuring cryptographic signature validation and automated reconciliation reports.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      githubUrl: 'https://github.com/portfolio-admin/aurapay',
      liveUrl: 'https://aurapay.example.com',
      featured: true,
      technologies: ['ElysiaJS', 'Bun', 'PostgreSQL', 'Stripe API', 'Zod', 'Docker'],
    },
    {
      title: 'DocuSync - Real-Time Collaborative Workspace',
      slug: 'docusync-collaborative-workspace',
      description: 'End-to-end encrypted markdown notes and knowledge base engine with WebSockets and Conflict-Free Replicated Data Types (CRDTs).',
      content: 'Built for distributed remote teams, DocuSync provides instant synchronization, fine-grained access control, and rich media previews.',
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
      githubUrl: 'https://github.com/portfolio-admin/docusync',
      liveUrl: 'https://docusync.example.com',
      featured: false,
      technologies: ['TypeScript', 'WebSockets', 'React', 'Bun', 'PostgreSQL'],
    },
  ];

  for (const project of projectsData) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    });
  }
  console.log(`✅ Projects seeded: ${projectsData.length} projects`);

  // 4. Seed Experiences
  const experiencesData = [
    {
      company: 'TechCorp Innovations',
      position: 'Lead Backend Architect',
      description: 'Architected high-throughput backend services serving 2M+ daily active users. Migrated legacy monoliths to modular microservices with 99.99% uptime.',
      startDate: new Date('2023-01-15'),
      endDate: null,
      current: true,
    },
    {
      company: 'Nexus Digital Labs',
      position: 'Senior Full Stack Engineer',
      description: 'Engineered customer-facing SaaS dashboards, optimized database queries resulting in a 65% latency reduction, and mentored junior developers.',
      startDate: new Date('2021-03-01'),
      endDate: new Date('2022-12-31'),
      current: false,
    },
    {
      company: 'Vanguard Systems',
      position: 'Backend Developer',
      description: 'Developed REST and GraphQL APIs, built automated CI/CD deployment pipelines using Docker and GitHub Actions, and implemented OAuth2 authentication.',
      startDate: new Date('2019-06-01'),
      endDate: new Date('2021-02-28'),
      current: false,
    },
  ];

  for (const exp of experiencesData) {
    const existing = await prisma.experience.findFirst({
      where: { company: exp.company, position: exp.position },
    });
    if (!existing) {
      await prisma.experience.create({ data: exp });
    }
  }
  console.log(`✅ Experiences seeded: ${experiencesData.length} experiences`);

  // 5. Seed Education
  const educationData = [
    {
      school: 'University of Technology & Science',
      degree: 'Master of Science (M.S.)',
      field: 'Computer Science & Distributed Systems',
      startDate: new Date('2017-09-01'),
      endDate: new Date('2019-05-30'),
    },
    {
      school: 'State University Institute of Engineering',
      degree: 'Bachelor of Science (B.S.)',
      field: 'Software Engineering',
      startDate: new Date('2013-09-01'),
      endDate: new Date('2017-06-25'),
    },
  ];

  for (const edu of educationData) {
    const existing = await prisma.education.findFirst({
      where: { school: edu.school, degree: edu.degree },
    });
    if (!existing) {
      await prisma.education.create({ data: edu });
    }
  }
  console.log(`✅ Educations seeded: ${educationData.length} records`);

  // 6. Seed Certificates
  const certificateData = [
    {
      title: 'AWS Certified Solutions Architect - Associate',
      issuer: 'Amazon Web Services',
      issueDate: new Date('2023-08-15'),
      credentialUrl: 'https://aws.amazon.com/verification/example-cert-id-01',
    },
    {
      title: 'Certified Kubernetes Application Developer (CKAD)',
      issuer: 'Linux Foundation / CNCF',
      issueDate: new Date('2023-04-10'),
      credentialUrl: 'https://www.credly.com/org/linux-foundation/example-ckad',
    },
    {
      title: 'HashiCorp Certified: Terraform Associate',
      issuer: 'HashiCorp',
      issueDate: new Date('2022-11-20'),
      credentialUrl: 'https://www.credly.com/org/hashicorp/example-terraform',
    },
  ];

  for (const cert of certificateData) {
    const existing = await prisma.certificate.findFirst({
      where: { title: cert.title, issuer: cert.issuer },
    });
    if (!existing) {
      await prisma.certificate.create({ data: cert });
    }
  }
  console.log(`✅ Certificates seeded: ${certificateData.length} certificates`);

  // 7. Seed Social Links
  const socialLinksData = [
    { platform: 'GitHub', url: 'https://github.com/portfolio-admin' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/portfolio-admin' },
    { platform: 'Twitter / X', url: 'https://x.com/portfolio_admin' },
    { platform: 'Personal Blog', url: 'https://blog.example.com' },
  ];

  for (const link of socialLinksData) {
    const existing = await prisma.socialLink.findFirst({
      where: { platform: link.platform },
    });
    if (!existing) {
      await prisma.socialLink.create({ data: link });
    }
  }
  console.log(`✅ Social Links seeded: ${socialLinksData.length} links`);

  // 8. Seed Contact Messages
  const contactMessagesData = [
    {
      name: 'Sarah Connor',
      email: 'sarah.connor@cyberdyne.org',
      subject: 'Inquiry regarding Distributed Systems Architecture project',
      message: 'Hello! I came across your CloudScale project and was thoroughly impressed by your design. Are you available for a consulting engagement next month?',
      isRead: false,
    },
    {
      name: 'Michael Chen',
      email: 'm.chen@venturecapital.io',
      subject: 'Speaker invitation: High Performance Backend APIs Conference',
      message: 'We would love to invite you as a keynote speaker to present your work on ElysiaJS and Bun at our upcoming tech conference.',
      isRead: true,
    },
  ];

  for (const msg of contactMessagesData) {
    const existing = await prisma.contactMessage.findFirst({
      where: { email: msg.email, subject: msg.subject },
    });
    if (!existing) {
      await prisma.contactMessage.create({ data: msg });
    }
  }
  console.log(`✅ Contact Messages seeded: ${contactMessagesData.length} messages`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
