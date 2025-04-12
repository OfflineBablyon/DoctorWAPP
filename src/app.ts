import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerProviderRoutes } from './routes/providers.routes';

const app = fastify({
  logger: true
});

// Register CORS
app.register(cors, {
  origin: true
});

// Register Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: 'DoctorWAPP API',
      description: 'API for searching and retrieving healthcare provider information',
      version: '1.0.0'
    },
    servers: [
      {
        url: process.env.HOST || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'providers', description: 'Provider related endpoints' },
      { name: 'health', description: 'Health check endpoint' }
    ]
  }
});

// Register Swagger UI
app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
});

// Register routes
registerProviderRoutes(app);

// Health check route
app.get('/health', {
  schema: {
    tags: ['health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' }
        }
      }
    }
  }
}, async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await app.listen({ port: port, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${port}`);
    app.log.info(`Documentation available at http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start(); 