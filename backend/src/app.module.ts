// Import Module so this class can act as a NestJS module.
import { Module } from '@nestjs/common';

// Import GraphQLModule to add GraphQL support to NestJS.
import { GraphQLModule } from '@nestjs/graphql';

// Import the Apollo driver used by NestJS to serve GraphQL.
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

// Import join so we can create file-system paths safely.
import { join } from 'path';

// Import the Todo feature module.
import { TodoModule } from './todo/todo.module';

// Import the Prisma module so PrismaService is available globally.
import { PrismaModule } from './prisma/prisma.module';

// Mark this class as a NestJS module.
@Module({
  // Imports register other modules that this root module depends on.
  imports: [
    // Configure NestJS GraphQL using the schema-first approach.
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // Tell NestJS to use Apollo as the GraphQL server driver.
      driver: ApolloDriver,

      // Load the GraphQL schema we wrote manually.
      typePaths: ['./**/*.graphql'],

      // Generate TypeScript definitions from the GraphQL schema.
      definitions: {
        // Store the generated types inside src/graphql.ts.
        path: join(process.cwd(), 'src/graphql.ts'),

        // Generate TypeScript interfaces rather than classes.
        outputAs: 'interface',
      },
    }),

    // Register the shared Prisma database module.
    PrismaModule,

    // Register the Todo feature and its resolver/service.
    TodoModule,
  ],
})
// Export the root application module.
export class AppModule {}
