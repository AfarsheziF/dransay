# Angular vs Remix: Key Differences Cheat Sheet

## Data Fetching Patterns

### Angular Approach:
```typescript
// Service-based data fetching
@Injectable()
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>('/api/tasks');
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>('/api/tasks', task);
  }
}

// Component usage
@Component({...})
export class TaskListComponent {
  tasks$ = this.taskService.getTasks();
  
  constructor(private taskService: TaskService) {}
}
```

### Remix + tRPC Approach:
```typescript
// Remix loader (SSR)
export const loader: LoaderFunction = async () => {
  const tasks = await db.select().from(tasksTable);
  return json({ tasks });
};

// tRPC procedure
export const taskRouter = router({
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ input, ctx }) => {
      return db.insert(tasksTable).values({
        ...input,
        userId: ctx.userId
      }).returning();
    })
});

// React component usage
export default function TaskList() {
  const { tasks } = useLoaderData<typeof loader>();
  const createTask = trpc.tasks.create.useMutation();
  
  return (
    <div>
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </div>
  );
}
```

**Key Difference**: Remix provides SSR out of the box, Angular requires Universal

---

## Form Handling

### Angular Reactive Forms:
```typescript
@Component({...})
export class TaskFormComponent {
  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['medium']
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.taskForm.valid) {
      this.taskService.createTask(this.taskForm.value).subscribe();
    }
  }
}
```

### Remix Progressive Enhancement:
```typescript
import { Form, useActionData, useNavigation } from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  
  // Server-side validation
  if (!title || title.length < 3) {
    return json({ error: "Title must be at least 3 characters" });
  }
  
  // Create task via tRPC or direct DB call
  return redirect("/dashboard");
};

export default function TaskForm() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post">
      <input 
        type="text" 
        name="title" 
        required 
        minLength={3}
      />
      {actionData?.error && <p>{actionData.error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Task"}
      </button>
    </Form>
  );
}
```

**Key Difference**: Remix forms work without JavaScript, Angular forms require it

---

## State Management

### Angular (NgRx):
```typescript
// Actions
export const loadTasks = createAction('[Task] Load Tasks');
export const loadTasksSuccess = createAction(
  '[Task] Load Tasks Success',
  props<{ tasks: Task[] }>()
);

// Reducer
const taskReducer = createReducer(initialState,
  on(loadTasksSuccess, (state, { tasks }) => ({ ...state, tasks }))
);

// Effects
@Injectable()
export class TaskEffects {
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTasks),
      switchMap(() =>
        this.taskService.getTasks().pipe(
          map(tasks => loadTasksSuccess({ tasks }))
        )
      )
    )
  );
}

// Component
@Component({...})
export class TaskListComponent {
  tasks$ = this.store.select(selectTasks);
  
  constructor(private store: Store) {
    this.store.dispatch(loadTasks());
  }
}
```

### Remix + tRPC:
```typescript
// No global state needed! Server state via loaders/tRPC
export default function TaskList() {
  // Server state from loader (SSR)
  const { tasks } = useLoaderData<typeof loader>();
  
  // Client state via tRPC (with React Query caching)
  const { data: updatedTasks } = trpc.tasks.getAll.useQuery();
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      // Automatic cache invalidation
      utils.tasks.getAll.invalidate();
    }
  });

  // Local state for UI only
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  const displayTasks = updatedTasks || tasks;
  
  return (
    <div>
      <FilterBar value={filter} onChange={setFilter} />
      {displayTasks
        .filter(task => filter === 'all' || task.completed === (filter === 'completed'))
        .map(task => <TaskItem key={task.id} task={task} />)
      }
    </div>
  );
}
```

**Key Difference**: Less boilerplate, server state handled by Remix/tRPC automatically

---

## Routing & Navigation

### Angular Router:
```typescript
// Route configuration
const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'tasks/:id', component: TaskDetailComponent },
  { path: 'login', component: LoginComponent }
];

// Navigation
@Component({...})
export class NavigationComponent {
  constructor(private router: Router) {}

  navigateToTask(id: number) {
    this.router.navigate(['/tasks', id]);
  }
}

// Route guards
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}
```

### Remix File-based Routing:
```
app/
  routes/
    _index.tsx          // /
    login.tsx          // /login
    dashboard.tsx      // /dashboard
    tasks.$id.tsx      // /tasks/:id
    _auth.tsx          // Layout route
      _auth.dashboard.tsx  // Nested: /dashboard (with auth layout)
```

```typescript
// app/routes/_auth.tsx (Layout with auth check)
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireAuth(request);
  return json({ userId });
};

export default function AuthLayout() {
  return (
    <div className="app-layout">
      <Navigation />
      <Outlet /> {/* Nested routes render here */}
    </div>
  );
}

// Navigation with Remix
import { Link, useLocation } from "@remix-run/react";

export default function Navigation() {
  const location = useLocation();
  
  return (
    <nav>
      <Link 
        to="/dashboard" 
        className={location.pathname === '/dashboard' ? 'active' : ''}
      >
        Dashboard
      </Link>
    </nav>
  );
}
```

**Key Difference**: File-based routing vs configuration-based, automatic code splitting

---

## Interview Questions: Angular vs Remix

### "Why would you choose Remix over Angular for this project?"

**Good Answer**:
- **SSR by default**: Better SEO and initial page load
- **Progressive enhancement**: Forms work without JavaScript
- **Simpler state management**: Server state via loaders, less client state needed
- **Better DX**: File-based routing, fewer abstractions
- **Performance**: Automatic code splitting, optimized loading

### "What would you miss from Angular when using Remix?"

**Good Answer**:
- **Dependency Injection**: More explicit dependency management in Angular
- **Decorators**: Clean metadata for components/services
- **RxJS**: Powerful reactive programming (though tRPC provides similar benefits)
- **Angular CLI**: Comprehensive tooling and generators
- **Enterprise features**: Advanced testing utilities, strict typing

### "How would you handle complex forms in Remix vs Angular?"

**Angular**: Reactive Forms with FormBuilder, custom validators, complex validation logic
**Remix**: Progressive enhancement + client-side validation, server-side validation, simpler but still powerful

---

## Practice Migration Exercise

### Convert this Angular component to Remix:

```typescript
// Angular version
@Component({
  template: `
    <div>
      <h1>Tasks ({{totalTasks}})</h1>
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        <input formControlName="title" placeholder="Task title">
        <button type="submit" [disabled]="taskForm.invalid">Add</button>
      </form>
      <div *ngFor="let task of tasks$ | async">
        {{task.title}} - {{task.completed ? 'Done' : 'Pending'}}
      </div>
    </div>
  `
})
export class TaskListComponent {
  tasks$ = this.taskService.getTasks();
  totalTasks = 0;
  taskForm = this.fb.group({
    title: ['', Validators.required]
  });

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.tasks$.subscribe(tasks => this.totalTasks = tasks.length);
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.taskService.createTask(this.taskForm.value).subscribe();
    }
  }
}
```

### Remix equivalent:
```typescript
// app/routes/tasks.tsx
import { json, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
  const tasks = await db.select().from(tasksTable);
  return json({ tasks, totalTasks: tasks.length });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  
  if (!title) {
    return json({ error: "Title is required" }, { status: 400 });
  }
  
  await db.insert(tasksTable).values({ title });
  return redirect("/tasks");
};

export default function TaskList() {
  const { tasks, totalTasks } = useLoaderData<typeof loader>();
  const actionData = useActionData();

  return (
    <div>
      <h1>Tasks ({totalTasks})</h1>
      <Form method="post">
        <input name="title" placeholder="Task title" required />
        <button type="submit">Add</button>
        {actionData?.error && <p style={{color: 'red'}}>{actionData.error}</p>}
      </Form>
      {tasks.map((task) => (
        <div key={task.id}>
          {task.title} - {task.completed ? 'Done' : 'Pending'}
        </div>
      ))}
    </div>
  );
}
```

**Key improvements in Remix version**:
- SSR: Page loads with data immediately
- Progressive enhancement: Works without JavaScript
- Simpler state management: No subscriptions needed
- Better error handling: Server-side validation
- Automatic revalidation: Data stays fresh