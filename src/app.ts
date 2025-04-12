import { fastify, FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyRateLimit from '@fastify/rate-limit';
import { registerProviderRoutes } from './routes/providers.routes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register CORS
  await app.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Register rate limiting in production
  if (process.env.NODE_ENV === 'production') {
    await app.register(fastifyRateLimit, {
      max: 500, // 500 requests
      timeWindow: '1 minute', // per minute
      // Higher limits for API keys can be implemented when authentication is added
    });
  }

  // Register Swagger if enabled
  if (process.env.ENABLE_SWAGGER === 'true') {
    await app.register(fastifySwagger, {
      swagger: {
        info: {
          title: 'HealthProvider Data API',
          description: 'Real-time healthcare provider data with search, filtering, and detailed Medicare information',
          version: process.env.API_VERSION || 'v1',
        },
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
      },
    });

    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    });
  }

  // Register routes
  registerProviderRoutes(app);

  // Add enhanced health check route
  app.get('/health', async (request, reply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      return { 
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.API_VERSION || 'v1'
      };
    } catch (error) {
      request.log.error('Health check failed:', error);
      reply.status(500);
      return { 
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.API_VERSION || 'v1'
      };
    }
  });

  return app;
};

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const app = await buildApp();
    await app.listen({ port: port, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${port}`);
    if (process.env.ENABLE_SWAGGER === 'true') {
      app.log.info(`Documentation available at http://localhost:${port}/docs`);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  start();
}

// Export for testing
export { start }; 