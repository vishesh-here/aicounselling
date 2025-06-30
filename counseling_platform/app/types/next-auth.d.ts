
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      approvalStatus?: string;
    };
  }

  interface User {
    role: string;
    approvalStatus?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    approvalStatus?: string;
  }
}
