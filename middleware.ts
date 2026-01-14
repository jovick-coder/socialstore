import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware to protect routes and handle authentication
 * Runs before every request to check user authentication status
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const url = request.nextUrl.clone();

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/onboarding"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  // Auth routes (login, signup) that should redirect if already authenticated
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is authenticated and on onboarding page, check if they've completed it
  if (user && url.pathname === "/onboarding") {
    // Create supabase client to check vendor status
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // If vendor has completed onboarding, redirect to dashboard
    if (vendor) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // If user is authenticated and trying to access auth routes
  if (user && isAuthRoute) {
    // Check if they've completed onboarding
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // Redirect to dashboard if onboarding is complete, otherwise to onboarding
    url.pathname = vendor ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
