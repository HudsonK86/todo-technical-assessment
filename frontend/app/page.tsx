'use client';

// Import React hooks used for component state and lifecycle work.
import { FormEvent, useCallback, useEffect, useState } from 'react';

// Import the shared helper that sends GraphQL requests to NestJS.
import { graphqlRequest } from '@/lib/graphql';

// Describe one Todo object returned by the backend.
type Todo = {
  // Database identifier.
  id: number;

  // Text shown to the user.
  title: string;

  // Completion state used by the checkbox.
  completed: boolean;
};

// GraphQL query used to load all Todo items.
const GET_TODOS = `
  query GetTodos {
    todos {
      id
      title
      completed
    }
  }
`;

// GraphQL mutation used to create a Todo.
const CREATE_TODO = `
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      completed
    }
  }
`;

// GraphQL mutation used for both title editing and completion toggling.
const UPDATE_TODO = `
  mutation UpdateTodo($id: Int!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      id
      title
      completed
    }
  }
`;

// GraphQL mutation used to remove a Todo.
const DELETE_TODO = `
  mutation DeleteTodo($id: Int!) {
    deleteTodo(id: $id) {
      id
    }
  }
`;

// The main page contains the complete basic Todo UI.
export default function Home() {
  // Store the Todo list displayed on the page.
  const [todos, setTodos] = useState<Todo[]>([]);

  // Store the text entered into the new Todo field.
  const [newTitle, setNewTitle] = useState('');

  // Store which Todo is currently being edited.
  const [editingId, setEditingId] = useState<number | null>(null);

  // Store the temporary title used inside the edit field.
  const [editingTitle, setEditingTitle] = useState('');

  // Track whether the initial Todo list is loading.
  const [loading, setLoading] = useState(true);

  // Track whether a write operation is currently running.
  const [saving, setSaving] = useState(false);

  // Store a simple error message for the user.
  const [error, setError] = useState('');

  // Load Todo items from the backend.
  const loadTodos = useCallback(async () => {
    try {
      // Clear an old error before trying again.
      setError('');

      // Send the GetTodos query and define the expected result type.
      const data = await graphqlRequest<{ todos: Todo[] }>(GET_TODOS);

      // Put the backend records into React state.
      setTodos(data.todos);
    } catch (err) {
      // Convert an unknown caught value into a readable message.
      setError(err instanceof Error ? err.message : 'Could not load todos.');
    } finally {
      // Stop showing the loading message whether the request passed or failed.
      setLoading(false);
    }
  }, []);

  // Run loadTodos once when this page first appears.
  useEffect(() => {
    // Start the initial GraphQL query.
    void loadTodos();
  }, [loadTodos]);

  // Handle submission of the Add Todo form.
  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    // Prevent the browser from reloading the whole page.
    event.preventDefault();

    // Remove unnecessary surrounding spaces.
    const title = newTitle.trim();

    // Do nothing if the user entered only empty spaces.
    if (!title) {
      return;
    }

    try {
      // Prevent duplicate clicks while the request is running.
      setSaving(true);

      // Clear any old error.
      setError('');

      // Send the createTodo mutation.
      const data = await graphqlRequest<{ createTodo: Todo }>(CREATE_TODO, {
        // GraphQL variables keep values separate from the query text.
        input: {
          title,
        },
      });

      // Add the newly returned Todo to the beginning of the UI list.
      setTodos((current) => [data.createTodo, ...current]);

      // Clear the input after creation succeeds.
      setNewTitle('');
    } catch (err) {
      // Show a readable GraphQL or network error.
      setError(err instanceof Error ? err.message : 'Could not add todo.');
    } finally {
      // Re-enable buttons after the request completes.
      setSaving(false);
    }
  }

  // Toggle a Todo between complete and incomplete.
  async function handleToggle(todo: Todo) {
    try {
      // Mark the UI as busy.
      setSaving(true);

      // Clear any old error.
      setError('');

      // Send only the completed field that needs to change.
      const data = await graphqlRequest<{ updateTodo: Todo }>(UPDATE_TODO, {
        id: todo.id,
        input: {
          completed: !todo.completed,
        },
      });

      // Replace the changed Todo in local state with the backend response.
      setTodos((current) =>
        current.map((item) =>
          item.id === data.updateTodo.id ? data.updateTodo : item,
        ),
      );
    } catch (err) {
      // Show an error without losing the existing Todo list.
      setError(err instanceof Error ? err.message : 'Could not update todo.');
    } finally {
      // Allow more actions after the mutation ends.
      setSaving(false);
    }
  }

  // Enter edit mode for one Todo.
  function beginEdit(todo: Todo) {
    // Remember which Todo is being edited.
    setEditingId(todo.id);

    // Copy the current title into the edit input.
    setEditingTitle(todo.title);
  }

  // Save the edited Todo title.
  async function saveEdit(todo: Todo) {
    // Clean the new title before sending it.
    const title = editingTitle.trim();

    // Keep edit mode open when the title is empty.
    if (!title) {
      setError('Todo title cannot be empty.');
      return;
    }

    try {
      // Disable actions while updating.
      setSaving(true);

      // Clear the previous error.
      setError('');

      // Send the new title to the backend.
      const data = await graphqlRequest<{ updateTodo: Todo }>(UPDATE_TODO, {
        id: todo.id,
        input: {
          title,
        },
      });

      // Replace the old Todo with the updated backend value.
      setTodos((current) =>
        current.map((item) =>
          item.id === data.updateTodo.id ? data.updateTodo : item,
        ),
      );

      // Leave edit mode after a successful save.
      setEditingId(null);

      // Clear the temporary edit field.
      setEditingTitle('');
    } catch (err) {
      // Keep edit mode available so the user can retry.
      setError(err instanceof Error ? err.message : 'Could not edit todo.');
    } finally {
      // Re-enable the interface.
      setSaving(false);
    }
  }

  // Delete one Todo.
  async function handleDelete(id: number) {
    try {
      // Disable actions while deleting.
      setSaving(true);

      // Clear previous errors.
      setError('');

      // Send the Todo ID to the delete mutation.
      await graphqlRequest<{ deleteTodo: { id: number } }>(DELETE_TODO, {
        id,
      });

      // Remove the deleted Todo from React state.
      setTodos((current) => current.filter((todo) => todo.id !== id));
    } catch (err) {
      // Display a backend or network error.
      setError(err instanceof Error ? err.message : 'Could not delete todo.');
    } finally {
      // Re-enable the UI.
      setSaving(false);
    }
  }

  // Render the page.
  return (
    <main className="page">
      <section className="card">
        <div className="heading">
          <p className="eyebrow">Technical Assessment</p>
          <h1>Todo List</h1>
          <p className="subtitle">
            NestJS + GraphQL + Prisma + SQLite + Next.js
          </p>
        </div>

        <form className="addForm" onSubmit={handleAdd}>
          <input
            aria-label="New todo title"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
          />

          <button
            className="primaryButton"
            disabled={saving || !newTitle.trim()}
            type="submit"
          >
            Add
          </button>
        </form>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="status">Loading todos...</p>
        ) : todos.length === 0 ? (
          <p className="status">No todos yet. Add your first task above.</p>
        ) : (
          <ul className="todoList">
            {todos.map((todo) => (
              <li className="todoItem" key={todo.id}>
                <input
                  aria-label={`Mark ${todo.title} as ${
                    todo.completed ? 'incomplete' : 'complete'
                  }`}
                  checked={todo.completed}
                  disabled={saving}
                  onChange={() => void handleToggle(todo)}
                  type="checkbox"
                />

                <div className="todoContent">
                  {editingId === todo.id ? (
                    <input
                      aria-label="Edit todo title"
                      autoFocus
                      className="editInput"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          void saveEdit(todo);
                        }

                        if (event.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                    />
                  ) : (
                    <span
                      className={
                        todo.completed ? 'todoTitle completed' : 'todoTitle'
                      }
                    >
                      {todo.title}
                    </span>
                  )}
                </div>

                <div className="actions">
                  {editingId === todo.id ? (
                    <>
                      <button
                        className="textButton"
                        disabled={saving}
                        onClick={() => void saveEdit(todo)}
                        type="button"
                      >
                        Save
                      </button>

                      <button
                        className="textButton"
                        disabled={saving}
                        onClick={() => setEditingId(null)}
                        type="button"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="textButton"
                      disabled={saving}
                      onClick={() => beginEdit(todo)}
                      type="button"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    className="deleteButton"
                    disabled={saving}
                    onClick={() => void handleDelete(todo.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
