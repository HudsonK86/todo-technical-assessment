// Import NestFactory, which creates a running NestJS application.
import { NestFactory } from '@nestjs/core';

// Import the root module that connects all application modules together.
import { AppModule } from './app.module';

// Create the application's startup function.
async function bootstrap() {
  // Create a NestJS application using the configuration from AppModule.
  const app = await NestFactory.create(AppModule);

  // Allow the Next.js frontend to send requests to this backend during local development.
  app.enableCors({
    // The frontend runs on port 3001 in this project.
    origin: 'http://localhost:3001',
  });

  // Read the port from the environment and fall back to 3000 when it is not provided.
  const port = process.env.PORT ?? 3000;

  // Start the HTTP server and wait for incoming GraphQL requests.
  await app.listen(port);

  // Print a useful message so the developer knows where the API is running.
  console.log(`Backend running at http://localhost:${port}/graphql`);
}

// Run the startup function when this file is executed.
bootstrap();
