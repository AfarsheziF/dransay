# Coding Challenges for Interview Practice

## Challenge 1: Basic tRPC Setup (15 minutes)
**Scenario**: "Set up a simple health check endpoint"

### Your Task:
1. Create a tRPC procedure that returns server status
2. Add a Remix route that calls this procedure
3. Display the result on a simple page

### Expected Implementation:

```typescript
// Add to src/server/trpc.ts
health: publicProcedure
  .query(async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected' // Check DB connection here
    };
  })
```

```typescript
// app/routes/health.tsx
import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { appRouter } from "~/server/trpc";

export const loader: LoaderFunction = async () => {
  const health = await appRouter.createCaller({}).health();
  return json({ health });
};

export default function Health() {
  const { health } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>System Health</h1>
      <p>Status: {health.status}</p>
      <p>Uptime: {health.uptime}s</p>
      <p>Database: {health.database}</p>
    </div>
  );
}
```

**Interview Questions**:
- "Why use a loader here instead of useQuery?"
- "How would you handle errors in this setup?"

---

## Challenge 2: Form Validation (30 minutes)
**Scenario**: "Create a task creation form with proper validation"

### Requirements:
- Title: Required, 3-50 characters
- Description: Optional, max 500 characters  
- Priority: One of 'low', 'medium', 'high'
- Due date: Optional, must be future date
- Show validation errors
- Handle server errors gracefully

### Your Task:
Implement both client-side AND server-side validation

### Starter Code:
```typescript
// app/routes/tasks.new.tsx
import { json, redirect, type ActionFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional().refine((date) => {
    if (!date) return true;
    return new Date(date) > new Date();
  }, "Due date must be in the future")
});

export const action: ActionFunction = async ({ request }) => {
  // TODO: Implement validation and task creation
};

export default function NewTask() {
  // TODO: Implement form with validation
}
```

**Expected Features**:
- Real-time client validation
- Server-side validation as fallback
- Loading states during submission
- Clear error messages
- Accessibility considerations

**Interview Discussion Points**:
- "Why validate on both client and server?"
- "How would you handle race conditions?"
- "What about progressive enhancement?"

---

## Challenge 3: Real-time Updates (45 minutes)
**Scenario**: "Add real-time task completion notifications"

### Your Task:
When a user marks a task as complete, other users should see it update in real-time.

### Implementation Options:
1. **WebSockets with tRPC subscriptions**
2. **Server-Sent Events**
3. **Polling with React Query**

### Choose ONE approach and implement:

```typescript
// Option 1: tRPC Subscriptions (Advanced)
taskCompleted: protectedProcedure
  .input(z.object({ taskId: z.number() }))
  .subscription(({ input }) => {
    return observable<Task>((emit) => {
      // Set up real-time listener
      const unsubscribe = eventEmitter.on('task-completed', (task) => {
        if (task.id === input.taskId) {
          emit.next(task);
        }
      });
      
      return unsubscribe;
    });
  })
```

```typescript
// Option 2: Polling (Simpler)
export default function TaskList() {
  const { data: tasks } = trpc.tasks.getAll.useQuery(undefined, {
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true
  });
  
  return (
    <div>
      {tasks?.map(task => (
        <TaskItem 
          key={task.id} 
          task={task}
          onComplete={() => {
            // Optimistic update
            completeTask.mutate(task.id);
          }}
        />
      ))}
    </div>
  );
}
```

**Interview Questions**:
- "What are the trade-offs between these approaches?"
- "How would you handle offline scenarios?"
- "What about performance with many concurrent users?"

---

## Challenge 4: Database Optimization (30 minutes)
**Scenario**: "The task list is slow with 10,000+ tasks"

### Your Task:
Optimize the task listing for performance

### Current Implementation:
```typescript
// Slow version
tasks: {
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, ctx.userId!));
    })
}
```

### Requirements:
1. Add pagination (cursor or offset-based)
2. Add filtering by status/category
3. Add sorting options
4. Include related data (categories) efficiently
5. Add database indexes

### Expected Implementation:
```typescript
getAll: protectedProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(20),
    cursor: z.number().optional(),
    completed: z.boolean().optional(),
    categoryId: z.number().optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }))
  .query(async ({ ctx, input }) => {
    // TODO: Implement efficient pagination and filtering
  })
```

**Bonus Points**:
- Cursor-based pagination for infinite scroll
- SQL query optimization
- Proper database indexes
- Caching strategy

**Interview Discussion**:
- "Cursor vs offset pagination - when to use each?"
- "How would you handle search functionality?"
- "What caching strategies would you implement?"

---

## Challenge 5: Error Handling (25 minutes)
**Scenario**: "Implement comprehensive error handling"

### Your Task:
Create a robust error handling system that covers:

1. **Network errors** (API down)
2. **Validation errors** (Bad input)
3. **Authorization errors** (Expired token)
4. **Business logic errors** (Can't delete completed task)
5. **Database errors** (Connection lost)

### Implementation Areas:

```typescript
// tRPC Error Handling
export const taskRouter = router({
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if task exists and belongs to user
      const task = await db
        .select()
        .from(tasks)
        .where(and(
          eq(tasks.id, input.id),
          eq(tasks.userId, ctx.userId!)
        ))
        .limit(1);

      if (!task.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found or unauthorized'
        });
      }

      // Business rule: Can't delete completed tasks
      if (task[0].completed) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete completed tasks'
        });
      }

      // TODO: Handle database deletion with proper error handling
    })
});
```

```typescript
// Remix Error Boundary
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-container">
        <h1>Oops! Something went wrong</h1>
        <p>Status: {error.status}</p>
        <p>{error.data?.message || 'An unexpected error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="error-container">
      <h1>Application Error</h1>
      <p>We're sorry, but something went wrong on our end.</p>
    </div>
  );
}
```

```typescript
// Client-side Error Handling
export default function TaskList() {
  const { data: tasks, error, isLoading } = trpc.tasks.getAll.useQuery();
  const deleteTask = trpc.tasks.delete.useMutation({
    onError: (error) => {
      // Handle specific error types
      if (error.data?.code === 'BAD_REQUEST') {
        toast.error(error.message);
      } else if (error.data?.code === 'UNAUTHORIZED') {
        // Redirect to login
        navigate('/login');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  });

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // TODO: Implement loading states and error recovery
}
```

**Expected Features**:
- Graceful degradation
- User-friendly error messages  
- Error recovery options
- Logging for debugging
- Retry mechanisms

---

## Challenge 6: Testing Strategy (40 minutes)
**Scenario**: "Write tests for the task management system"

### Your Task:
Implement tests at different levels:

1. **Unit tests** for tRPC procedures
2. **Integration tests** for database operations
3. **Component tests** for React components
4. **E2E tests** for critical user flows

### Test Examples:

```typescript
// Unit test for tRPC procedure
import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '../src/server/trpc';
import { db } from '../src/db';

describe('Task Router', () => {
  beforeEach(async () => {
    // Clean database before each test
    await db.delete(tasks);
    await db.delete(users);
  });

  it('should create a task for authenticated user', async () => {
    // Create test user
    const [user] = await db.insert(users).values({
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User'
    }).returning();

    // Create caller with authenticated context
    const caller = appRouter.createCaller({ userId: user.id });

    // Test task creation
    const task = await caller.tasks.create({
      title: 'Test Task',
      description: 'Test Description',
      priority: 'medium'
    });

    expect(task.title).toBe('Test Task');
    expect(task.userId).toBe(user.id);
  });

  it('should throw error for unauthenticated user', async () => {
    const caller = appRouter.createCaller({}); // No userId

    await expect(
      caller.tasks.create({
        title: 'Test Task',
        priority: 'medium'
      })
    ).rejects.toThrow('UNAUTHORIZED');
  });
});
```

```typescript
// Component test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../app/components/TaskForm';

describe('TaskForm', () => {
  it('should show validation error for short title', async () => {
    render(<TaskForm />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /create/i });

    fireEvent.change(titleInput, { target: { value: 'ab' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });
  });
});
```

**Your Task**: Implement the missing test cases and explain your testing strategy.

---

## Mock Interview Questions

### Technical Deep-Dive Questions:

1. **"Walk me through how you would implement search functionality for tasks."**
   - Database indexing strategy
   - Full-text search vs LIKE queries
   - Debouncing user input
   - Pagination with search
   - Highlighting search results

2. **"How would you handle file uploads in this stack?"**
   - Remix action handling
   - tRPC with multipart forms
   - Cloud storage integration (S3, Cloudinary)
   - File validation and security
   - Progress indicators

3. **"Explain how you would implement role-based access control."**
   - Database schema for roles/permissions
   - Middleware for authorization
   - Route-level protection
   - Component-level permissions
   - Admin dashboard functionality

4. **"How would you optimize this application for mobile?"**
   - Responsive design considerations
   - Touch interactions
   - Performance on slow networks
   - Offline functionality
   - PWA features

### Architecture Questions:

1. **"How would you structure this application as it grows to 50+ routes?"**
   - File organization strategies
   - Shared components and layouts
   - Code splitting approaches
   - State management patterns
   - Testing organization

2. **"Describe your deployment and CI/CD strategy."**
   - Environment configuration
   - Database migrations in production
   - Zero-downtime deployments
   - Monitoring and logging
   - Error tracking

---

## Bonus Challenge: Performance Optimization

**Scenario**: "The app is slow on mobile devices with poor network connectivity"

### Your Task:
Identify and implement performance optimizations:

1. **Bundle size optimization**
2. **Image optimization** 
3. **Database query optimization**
4. **Caching strategies**
5. **Loading state improvements**

### Implementation Ideas:
- Route-based code splitting
- Image lazy loading
- Database query batching
- React Query caching
- Service worker for offline functionality

**Interview Discussion**:
- "How would you measure and monitor performance?"
- "What are the key Web Vitals and how would you optimize them?"
- "How would you handle slow network conditions?"

---

## Summary Checklist

After completing these challenges, you should be comfortable discussing:

- ✅ **tRPC setup and type safety benefits**
- ✅ **Remix loaders vs client-side data fetching**
- ✅ **Database design with Drizzle ORM**
- ✅ **Form handling with progressive enhancement**
- ✅ **Error handling strategies**
- ✅ **Performance optimization techniques**
- ✅ **Testing approaches for full-stack applications**
- ✅ **Real-time functionality implementation**
- ✅ **State management patterns**
- ✅ **Security considerations**

Good luck with your interview! Remember to explain your thought process and ask clarifying questions.