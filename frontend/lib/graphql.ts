// Read the backend URL from the browser-safe Next.js environment variable.
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:3000/graphql';

// Describe the standard GraphQL response shape returned by the backend.
type GraphQLResponse<T> = {
  // Successful GraphQL data is stored here.
  data?: T;

  // GraphQL returns one or more errors when an operation fails.
  errors?: Array<{
    // Each GraphQL error contains a human-readable message.
    message: string;
  }>;
};

// Create one reusable helper for all frontend GraphQL requests.
export async function graphqlRequest<T>(
  // GraphQL query or mutation text.
  query: string,

  // Optional variables supplied to the operation.
  variables: Record<string, unknown> = {},
): Promise<T> {
  // Send an HTTP POST request to the NestJS GraphQL endpoint.
  const response = await fetch(GRAPHQL_URL, {
    // GraphQL commonly uses POST for queries and mutations.
    method: 'POST',

    // Tell the backend that the request body contains JSON.
    headers: {
      'Content-Type': 'application/json',
    },

    // Convert the GraphQL operation and variables into JSON.
    body: JSON.stringify({
      query,
      variables,
    }),

    // Avoid caching Todo data because the UI should show recent changes.
    cache: 'no-store',
  });

  // Parse the JSON returned by the GraphQL server.
  const result = (await response.json()) as GraphQLResponse<T>;

  // Convert GraphQL errors into a normal JavaScript Error for the UI.
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  // Guard against a malformed response that contains neither data nor errors.
  if (!result.data) {
    throw new Error('The GraphQL server returned no data.');
  }

  // Return the strongly typed successful result.
  return result.data;
}
