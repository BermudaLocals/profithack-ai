import { db, withRetry } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";
import * as schema from "./shared/schema";

export interface IStorage {
  getUser(id: number): Promise<schema.User | null>;
  getUserByUsername(username: string): Promise<schema.User | null>;
  getUserByEmail(email: string): Promise<schema.User | null>;
  createUser(data: schema.InsertUser): Promise<schema.User>;
  updateUser(id: number, data: Partial<schema.InsertUser>): Promise<schema.User | null>;
  
  getVideos(limit?: number, offset?: number): Promise<schema.Video[]>;
  getVideoById(id: number): Promise<schema.Video | null>;
  getVideosByUserId(userId: number): Promise<schema.Video[]>;
  createVideo(data: schema.InsertVideo): Promise<schema.Video>;
  
  getConversations(userId: number): Promise<schema.Conversation[]>;
  getMessages(conversationId: number): Promise<schema.Message[]>;
  createMessage(data: schema.InsertMessage): Promise<schema.Message>;
  
  getTransactions(userId: number): Promise<schema.Transaction[]>;
  createTransaction(data: schema.InsertTransaction): Promise<schema.Transaction>;
}

class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<schema.User | null> {
    return withRetry(async () => {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      return user || null;
    });
  }

  async getUserByUsername(username: string): Promise<schema.User | null> {
    return withRetry(async () => {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
      return user || null;
    });
  }

  async getUserByEmail(email: string): Promise<schema.User | null> {
    return withRetry(async () => {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      return user || null;
    });
  }

  async createUser(data: schema.InsertUser): Promise<schema.User> {
    return withRetry(async () => {
      const [user] = await db.insert(schema.users).values(data).returning();
      return user;
    });
  }

  async updateUser(id: number, data: Partial<schema.InsertUser>): Promise<schema.User | null> {
    return withRetry(async () => {
      const [user] = await db.update(schema.users).set(data).where(eq(schema.users.id, id)).returning();
      return user || null;
    });
  }

  async getVideos(limit: number = 50, offset: number = 0): Promise<schema.Video[]> {
    return withRetry(async () => {
      return db.select().from(schema.videos).orderBy(desc(schema.videos.id)).limit(limit).offset(offset);
    });
  }

  async getVideoById(id: number): Promise<schema.Video | null> {
    return withRetry(async () => {
      const [video] = await db.select().from(schema.videos).where(eq(schema.videos.id, id)).limit(1);
      return video || null;
    });
  }

  async getVideosByUserId(userId: number): Promise<schema.Video[]> {
    return withRetry(async () => {
      return db.select().from(schema.videos).where(eq(schema.videos.userId, userId)).orderBy(desc(schema.videos.id));
    });
  }

  async createVideo(data: schema.InsertVideo): Promise<schema.Video> {
    return withRetry(async () => {
      const [video] = await db.insert(schema.videos).values(data).returning();
      return video;
    });
  }

  async getConversations(userId: number): Promise<schema.Conversation[]> {
    return withRetry(async () => {
      return db.select().from(schema.conversations)
        .where(or(
          eq(schema.conversations.user1Id, userId),
          eq(schema.conversations.user2Id, userId)
        ))
        .orderBy(desc(schema.conversations.updatedAt));
    });
  }

  async getMessages(conversationId: number): Promise<schema.Message[]> {
    return withRetry(async () => {
      return db.select().from(schema.messages)
        .where(eq(schema.messages.conversationId, conversationId))
        .orderBy(schema.messages.createdAt);
    });
  }

  async createMessage(data: schema.InsertMessage): Promise<schema.Message> {
    return withRetry(async () => {
      const [message] = await db.insert(schema.messages).values(data).returning();
      return message;
    });
  }

  async getTransactions(userId: number): Promise<schema.Transaction[]> {
    return withRetry(async () => {
      return db.select().from(schema.transactions)
        .where(eq(schema.transactions.userId, userId))
        .orderBy(desc(schema.transactions.createdAt));
    });
  }

  async createTransaction(data: schema.InsertTransaction): Promise<schema.Transaction> {
    return withRetry(async () => {
      const [transaction] = await db.insert(schema.transactions).values(data).returning();
      return transaction;
    });
  }
}

export const storage = new DatabaseStorage();
export default storage;
