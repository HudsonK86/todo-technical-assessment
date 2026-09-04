// Import GraphQL decorators used to map schema operations to TypeScript methods.
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

// Import TodoService so the resolver can delegate application logic.
import { TodoService } from './todo.service';

// Describe the createTodo input defined in schema.graphql.
type CreateTodoInput = {
  // A new Todo always requires a title.
  title: string;
};

// Describe the optional fields accepted by updateTodo.
type UpdateTodoInput = {
  // The caller may change the title.
  title?: string | null;

  // The caller may change the completion state.
  completed?: boolean | null;
};

// Register this class as the resolver for the Todo GraphQL type.
@Resolver('Todo')
export class TodoResolver {
  // Ask NestJS to inject TodoService into this resolver.
  constructor(private readonly todoService: TodoService) {}

  // Connect this method to Query.todos from schema.graphql.
  @Query('todos')
  async findAll() {
    // Keep the resolver thin by passing the work to TodoService.
    return this.todoService.findAll();
  }

  // Connect this method to Query.todo from schema.graphql.
  @Query('todo')
  async findOne(
    // Read the numeric id argument supplied in the GraphQL query.
    @Args('id') id: number,
  ) {
    // Ask TodoService to load and validate the requested record.
    return this.todoService.findOne(id);
  }

  // Connect this method to Mutation.createTodo from schema.graphql.
  @Mutation('createTodo')
  async create(
    // Read the CreateTodoInput object sent by the client.
    @Args('input') input: CreateTodoInput,
  ) {
    // Pass only the title to the service, where validation and creation happen.
    return this.todoService.create(input.title);
  }

  // Connect this method to Mutation.updateTodo from schema.graphql.
  @Mutation('updateTodo')
  async update(
    // Read the ID of the Todo being updated.
    @Args('id') id: number,

    // Read the optional fields the caller wants to change.
    @Args('input') input: UpdateTodoInput,
  ) {
    // Delegate validation and database work to TodoService.
    return this.todoService.update(id, input);
  }

  // Connect this method to Mutation.deleteTodo from schema.graphql.
  @Mutation('deleteTodo')
  async remove(
    // Read the ID supplied by the GraphQL mutation.
    @Args('id') id: number,
  ) {
    // Delegate deletion to TodoService.
    return this.todoService.remove(id);
  }
}
