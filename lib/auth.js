// lib/auth.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get the current server session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Middleware to protect API routes
 * Usage: In your API route, call this first
 */
export async function requireAuth(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return {
      authenticated: false,
      user: null,
      error: 'Unauthorized - Please sign in'
    };
  }
  
  return {
    authenticated: true,
    user: session.user,
    error: null
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}