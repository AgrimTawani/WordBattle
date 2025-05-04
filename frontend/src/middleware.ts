import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware((auth, req) => {
  // Skip middleware for API routes to prevent loops
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get the auth object from the promise
  auth().then(async authObj => {
    // Only proceed if user is signed in
    if (authObj.userId) {
      try {
        // Get the user's email from Clerk
        const response = await fetch(`https://api.clerk.dev/v1/users/${authObj.userId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data from Clerk');
        }

        const userData = await response.json();
        const email = userData.email_addresses[0]?.email_address;

        if (email) {
          // Get the session token
          const token = await authObj.getToken();
          
          // Create or update user
          const upsertResponse = await fetch(`${req.nextUrl.origin}/api/users/${authObj.userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ email }),
          });

          if (!upsertResponse.ok) {
            throw new Error(`HTTP error! status: ${upsertResponse.status}`);
          }
        }
      } catch (error) {
        // Silently handle errors
      }
    }
  }).catch(error => {
    // Silently handle errors
  });

  return NextResponse.next();
});

// Update the matcher to include API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}; 