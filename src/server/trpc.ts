import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { db } from "../db";
import { users, tasks, categories } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Context type
export interface Context {
  userId?: number;
  req?: Request;
}

// Create context function
export const createContext = async (opts: {
  req?: Request;
  headers?: Headers;
}): Promise<Context> => {
  const { req, headers } = opts;

  // Extract token from Authorization header
  const authHeader =
    headers?.get("authorization") || req?.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return { req };
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    return { userId: decoded.userId, req };
  } catch (error) {
    // Invalid token
    return { req };
  }
};

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Middleware for authentication
// const isAuthenticated = t.middleware(({ ctx, next }) => {
//   if (!ctx.userId) {
//     throw new TRPCError({ code: "UNAUTHORIZED" });
//   }
//   return next({
//     ctx: {
//       ...ctx,
//       userId: ctx.userId,
//     },
//   });
// });

// Base procedures
export const router = t.router;
export const publicProcedure = t.procedure;
// export const protectedProcedure = t.procedure.use(isAuthenticated);

// Main app router
export const appRouter = router({
  // Auth procedures
  auth: router({
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(2),
        })
      )
      .mutation(async ({ input }) => {
        // Check if user exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already exists",
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Create user
        const [newUser] = await db
          .insert(users)
          .values({
            email: input.email,
            password: hashedPassword,
            name: input.name,
          })
          .returning({ id: users.id, email: users.email, name: users.name });

        // Generate JWT
        const token = jwt.sign(
          { userId: newUser.id },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" }
        );

        return { user: newUser, token };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Find user
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid credentials",
          });
        }

        // Verify password
        const validPassword = await bcrypt.compare(
          input.password,
          user.password
        );
        if (!validPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
          expiresIn: "7d",
        });

        return {
          user: { id: user.id, email: user.email, name: user.name },
          token,
        };
      }),
  }),

  // Task procedures
  tasks: router({
    getAll: publicProcedure
      .input(
        z
          .object({
            completed: z.boolean().optional(),
            categoryId: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        let whereConditions = [eq(tasks.userId, ctx.userId!)];

        if (input?.completed !== undefined) {
          whereConditions.push(eq(tasks.completed, input.completed));
        }

        if (input?.categoryId) {
          whereConditions.push(eq(tasks.categoryId, input.categoryId));
        }

        return await db
          .select()
          .from(tasks)
          .where(and(...whereConditions))
          .orderBy(desc(tasks.createdAt));
      }),

    create: publicProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
          dueDate: z.date().optional(),
          categoryId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const [newTask] = await db
          .insert(tasks)
          .values({
            ...input,
            userId: ctx.userId!,
          })
          .returning();

        return newTask;
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          completed: z.boolean().optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
          dueDate: z.date().optional(),
          categoryId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;

        const [updatedTask] = await db
          .update(tasks)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.userId!)))
          .returning();

        if (!updatedTask) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Task not found",
          });
        }

        return updatedTask;
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const [deletedTask] = await db
          .delete(tasks)
          .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId!)))
          .returning();

        if (!deletedTask) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Task not found",
          });
        }

        return { success: true };
      }),
  }),

  // Category procedures
  categories: router({
    getAll: publicProcedure.query(async ({ ctx }) => {
      return await db
        .select()
        .from(categories)
        .where(eq(categories.userId, ctx.userId!));
    }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          color: z.string().default("#3B82F6"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const [newCategory] = await db
          .insert(categories)
          .values({
            ...input,
            userId: ctx.userId!,
          })
          .returning();

        return newCategory;
      }),
  }),

  health: publicProcedure.query(async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected", // Check DB connection here
    };
  }),
});

// Export type definition
export type AppRouter = typeof appRouter;
