// Import Module so this feature can be registered with NestJS.
import { Module } from '@nestjs/common';

// Import the GraphQL resolver for Todo operations.
import { TodoResolver } from './todo.resolver';

// Import the service containing Todo business/database logic.
import { TodoService } from './todo.service';

// Mark this class as the Todo feature module.
@Module({
  // Register the resolver and service with NestJS dependency injection.
  providers: [TodoResolver, TodoService],
})
// Export the Todo module so AppModule can register it.
export class TodoModule {}
