# QueryLab — React Data Management Playground

Responsive React + Vite playground demonstrating asynchronous state management, smart query caching, background refetching, mutations, and optimistic UI with automatic rollback. Built with a simulated API backed by `localStorage` so CRUD operations and error handling scenarios can be tested without an external backend.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Features

### 1. Product Catalogue — Caching, Search & Background Fetching

- `src/main.jsx` initializes a `QueryClient` and wraps the app in `QueryClientProvider` with Devtools enabled.
- `useProducts(searchTerm)` uses query key `['products', { search: searchTerm }]`, with `staleTime: 30 * 1000` and `gcTime: 5 * 60 * 1000`.
- Search input state is local UI state; product results are managed asynchronously with automatic caching.
- UI demonstrates `isPending`, `isFetching`, `isError`, and `isSuccess` states; Refresh Products triggers manual refetching.
- A product API failure toggle allows testing error states and recovery. `placeholderData: previousData => previousData` keeps previous results visible while a new search query loads.

### 2. User Management — Mutations & Optimistic Rollback

- `useUsers()` fetches and caches team members under `['users']`.
- `useCreateUser()` handles mutation workflows and invalidates `['users']` upon successful creation. Form includes name, email, role, pending indicators, input validation, and toast feedback.
- `useDeleteUser()` demonstrates a full optimistic update lifecycle:
  1. Cancels in-flight queries.
  2. Snapshots existing cache state.
  3. Immediately removes the user from UI via local cache updates (`setQueryData`).
  4. Automatically rolls back to snapshot if the mutation fails.
  5. Invalidates and refetches on completion (`onSettled`) to maintain sync with server state.
- Failure toggles allow simulating network/API errors to observe optimistic rollback in real time.

## Verification Checklist

1. Start the app and observe the initial product loading state.
2. Search `home`, then `lamp`; inspect the changing query key in Devtools.
3. Click Refresh Products and observe existing results while background fetching is active.
4. Enable product API failure, refresh, and verify error UI. Disable failure and retry to recover.
5. Revisit a query within its 30-second stale time and inspect cached data.
6. Create a user and verify pending state, success message, and users list invalidation/refetch.
7. Enable create failure and confirm the mutation error notice.
8. Enable delete failure, delete a user, and observe the immediate UI removal followed by rollback.
9. Turn off delete failure and delete a user successfully.
10. Use "Reset demo" to restore initial users and clear mock failure toggles.

## Mock API Notes

`src/api.js` simulates network latency with artificial delays. User records and failure switches use browser `localStorage`. Clear site storage or click "Reset demo" in the top bar to reset state at any time.
