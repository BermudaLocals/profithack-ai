/**
 * PROFITHACK AI - TypeScript Type Declarations
 * Fixes common type issues in routes.ts
 */

import { users } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string | null;
      username: string | null;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
      createdAt: Date | null;
      passwordHash?: string | null;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
