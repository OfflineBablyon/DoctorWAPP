import { buildApp } from './app';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Give time for logs to be written before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Not exiting here to allow the application to continue running
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const app = await buildApp();
    
    // Listen on all interfaces
    await app.listen({ port: port, host: '0.0.0.0' });
    
    app.log.info(`Server listening on port ${port}`);
    app.log.info(`Environment: ${env}`);
    
    if (process.env.ENABLE_SWAGGER === 'true') {
      app.log.info(`Documentation available at http://localhost:${port}/docs`);
    }
    
    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      app.log.info(`${signal} received, shutting down...`);
      await app.close();
      process.exit(0);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start(); 