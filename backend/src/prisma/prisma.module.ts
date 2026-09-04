// Import Global so PrismaService can be available throughout the application.
import { Global, Module } from '@nestjs/common';

// Import the service that wraps PrismaClient.
import { PrismaService } from './prisma.service';

// Make this module global so feature modules do not need to import it repeatedly.
@Global()

// Mark this class as a NestJS module.
@Module({
  // Register PrismaService so NestJS can create and inject it.
  providers: [PrismaService],

  // Export PrismaService so other modules can use it.
  exports: [PrismaService],
})
// Export the Prisma module.
export class PrismaModule {}
