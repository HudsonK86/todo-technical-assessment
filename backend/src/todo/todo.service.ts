// Import NestJS decorators and exceptions used by the service.
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

// Import Prisma types for strongly typed database updates.
import { Prisma } from '@prisma/client';

// Import the shared Prisma service used to access SQLite.
import { PrismaService } from '../prisma/prisma.service';

// Mark this class as injectable through NestJS dependency injection.
@Injectable()
export class TodoService {
  // Ask NestJS to provide PrismaService when TodoService is created.
  constructor(private readonly prisma: PrismaService) {}

  // Return every Todo stored in the database.
  async findAll() {
    // Use Prisma to load all Todo records, newest first.
    return this.prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Return one Todo using its numeric database ID.
  async findOne(id: number) {
    // Ask Prisma for the record with this primary key.
    const todo = await this.prisma.todo.findUnique({
      where: {
        id,
      },
    });

    // Prisma returns null when no matching Todo exists.
    if (!todo) {
      // Convert the missing record into a clear GraphQL error.
      throw new NotFoundException(`Todo with ID ${id} was not found.`);
    }

    // Return the existing Todo to the resolver.
    return todo;
  }

  // Create a new Todo using the title supplied by GraphQL.
  async create(titleInput: string) {
    // Remove extra spaces from both ends of the title.
    const title = titleInput.trim();

    // Prevent empty tasks such as an empty string or only spaces.
    if (!title) {
      throw new BadRequestException('Todo title cannot be empty.');
    }

    // Insert the new Todo and return the record created by Prisma.
    return this.prisma.todo.create({
      data: {
        title,
      },
    });
  }

  // Update one or more editable fields on an existing Todo.
  async update(
    id: number,
    input: {
      title?: string | null;
      completed?: boolean | null;
    },
  ) {
    // Check that the record exists before trying to change it.
    await this.findOne(id);

    // Start with an empty, strongly typed Prisma update object.
    const data: Prisma.TodoUpdateInput = {};

    // Only change the title if GraphQL actually supplied it.
    if (input.title !== undefined && input.title !== null) {
      // Clean surrounding spaces before validation.
      const title = input.title.trim();

      // Reject an empty edited title.
      if (!title) {
        throw new BadRequestException('Todo title cannot be empty.');
      }

      // Add the cleaned title to the update operation.
      data.title = title;
    }

    // Only change completed if GraphQL supplied a Boolean value.
    if (input.completed !== undefined && input.completed !== null) {
      // Add the requested completion state to the update operation.
      data.completed = input.completed;
    }

    // Send the update to Prisma and return the changed record.
    return this.prisma.todo.update({
      where: {
        id,
      },
      data,
    });
  }

  // Delete one Todo using its ID.
  async remove(id: number) {
    // Confirm the record exists so the error message stays clear.
    await this.findOne(id);

    // Delete and return the removed record.
    return this.prisma.todo.delete({
      where: {
        id,
      },
    });
  }
}
