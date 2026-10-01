import { config } from '@/config';
import { connectDatabase, disconnectDatabase } from '@/database/client';
import { app } from '@/app';

async function bootstrap() {
  try {
    console.log(`🚀 Starting Portfolio REST API [${config.env}]...`);

    // Ensure database connection
    await connectDatabase();

    // Start Elysia server
    app.listen({ port: config.port, hostname: config.host }, ({ hostname, port }) => {
      console.log(`\n======================================================`);
      console.log(`🌟 Server running at: http://${hostname}:${port}`);
      console.log(`📚 Swagger Docs:       http://${hostname}:${port}/swagger`);
      console.log(`🩺 Health Check:       http://${hostname}:${port}/api/health`);
      console.log(`======================================================\n`);
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      try {
        await disconnectDatabase();
        console.log('✅ Graceful shutdown completed.');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during graceful shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('💥 Application failed to start:', error);
    process.exit(1);
  }
}

bootstrap();
