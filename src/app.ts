import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { config } from '@/config';
import { prisma } from '@/database/client';
import { handleError } from '@/middleware/error.middleware';
import { requestLogger } from '@/middleware/logger.middleware';
import { securityHeaders } from '@/middleware/security.middleware';
import { rateLimiter } from '@/middleware/rate-limit.middleware';
import { sendSuccess } from '@/utils/response';

// Route modules
import { authRoutes } from '@/modules/auth/auth.routes';
import { usersRoutes } from '@/modules/users/users.routes';
import { projectsRoutes } from '@/modules/projects/projects.routes';
import { skillsRoutes } from '@/modules/skills/skills.routes';
import { experiencesRoutes } from '@/modules/experiences/experiences.routes';
import { educationsRoutes } from '@/modules/educations/educations.routes';
import { certificatesRoutes } from '@/modules/certificates/certificates.routes';
import { socialLinksRoutes } from '@/modules/social-links/social-links.routes';
import { contactsRoutes } from '@/modules/contacts/contacts.routes';

export function createApp() {
  const app = new Elysia()
    // Global Error Handling
    .onError(handleError)

    // Security & Middleware Plugins
    .use(
      cors({
        origin: config.cors.origin,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
      })
    )
    .use(securityHeaders)
    .use(requestLogger)
    .use(rateLimiter)

    // Swagger & OpenAPI Specification
    .use(
      swagger({
        path: '/swagger',
        documentation: {
          info: {
            title: 'Portfolio REST API',
            version: '1.0.0',
            description:
              'A high-performance, production-ready Portfolio REST API built with ElysiaJS, TypeScript, PostgreSQL, and Prisma ORM.',
            contact: {
              name: 'Portfolio Support',
              email: 'admin@portfolio.dev',
            },
          },
          tags: [
            { name: 'System', description: 'System health and status endpoints' },
            { name: 'Authentication', description: 'User login, registration, and token rotation' },
            { name: 'Users', description: 'Profile management and user administration' },
            { name: 'Projects', description: 'Portfolio projects and case studies' },
            { name: 'Skills', description: 'Technical skills and competencies' },
            { name: 'Experiences', description: 'Work and professional history' },
            { name: 'Educations', description: 'Academic background and qualifications' },
            { name: 'Certificates', description: 'Professional certifications and credentials' },
            { name: 'Social Links', description: 'Social media and profile links' },
            { name: 'Contact', description: 'Contact message inquiries and management' },
          ],
          components: {
            securitySchemes: {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT access token in the format: Bearer <token>',
              },
            },
          },
        },
      })
    )

    // Root Welcome Endpoint
    .get('/', () =>
      sendSuccess(
        {
          name: 'Portfolio REST API',
          version: '1.0.0',
          documentation: '/swagger',
          health: '/api/health',
        },
        'Welcome to Portfolio REST API'
      )
    )

    // API Routes Group
    .group('/api', (api) =>
      api
        // System Health Check Endpoint
        .get(
          '/health',
          async () => {
            let dbStatus = 'healthy';
            try {
              await prisma.$queryRaw`SELECT 1`;
            } catch (err) {
              dbStatus = 'unhealthy';
            }

            const memoryUsage = process.memoryUsage();

            return sendSuccess(
              {
                status: dbStatus === 'healthy' ? 'operational' : 'degraded',
                environment: config.env,
                database: dbStatus,
                uptime: `${process.uptime().toFixed(2)}s`,
                memory: {
                  rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
                  heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                },
              },
              'Health check operational'
            );
          },
          {
            detail: {
              tags: ['System'],
              summary: 'Comprehensive API and Database Health Check',
            },
          }
        )
        // Domain Modules
        .use(authRoutes)
        .use(usersRoutes)
        .use(projectsRoutes)
        .use(skillsRoutes)
        .use(experiencesRoutes)
        .use(educationsRoutes)
        .use(certificatesRoutes)
        .use(socialLinksRoutes)
        .use(contactsRoutes)
    );

  return app;
}

export const app = createApp();
export type App = typeof app;
export default app;
