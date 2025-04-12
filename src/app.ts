import fastify from 'fastify';
import cors from '@fastify/cors';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { providersRoutes } from './routes/providers.routes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

// Register plugins
app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

// Register routes
app.register(providersRoutes, { prefix: '/api/providers' });

// Health check route
app.get('/health', async () => {
  return { status: 'ok' };
});

// Error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  reply.status(500).send({
    error: 'Internal Server Error',
    message: error.message,
  });
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export { app, prisma }; 