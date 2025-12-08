declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare module "*.mp4" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}

declare namespace Express {
  interface Request {
    user?: {
      id: number;
      username: string;
      email?: string | null;
      isAdmin?: boolean;
    };
  }
  interface Session {
    userId?: number;
    isAdmin?: boolean;
  }
}
