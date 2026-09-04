// Import Injectable so NestJS can inject this service into other classes.
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

// Import PrismaClient, the generated database client from Prisma.
import { PrismaClient } from '@prisma/client';

// Mark this class as injectable through NestJS dependency injection.
@Injectable()

// Extend PrismaClient so this service directly exposes Prisma database methods.
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // NestJS calls this method when the module starts.
  async onModuleInit() {
    // Open the Prisma database connection.
    await this.$connect();
  }

  // NestJS calls this method when the application shuts down.
  async onModuleDestroy() {
    // Close the Prisma connection cleanly.
    await this.$disconnect();
  }
}
