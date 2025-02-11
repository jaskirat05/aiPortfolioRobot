import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";


const openRoutes=createRouteMatcher(["/"]);
const isProtectedRoute=createRouteMatcher(["/clients"]);

export default clerkMiddleware
(async (auth, req) => {
    
    if (isProtectedRoute(req)) await auth.protect()
  },
  {
    organizationSyncOptions: {
      organizationPatterns: [
        '/organization/:slug', // Match the org slug
        '/organizations/:slug/(.*)', // Wildcard match for optional trailing path segments
      ],
      personalAccountPatterns: [
        '/me', // Match the personal account
        '/me/(.*)', // Wildcard match for optional trailing path segments
      ],
    },
  },
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};