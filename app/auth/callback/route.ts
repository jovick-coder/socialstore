import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * OAuth callback handler
 * Exchanges the auth code for a session and redirects user appropriately
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createServerSupabaseClient();

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code);

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if vendor has completed onboarding
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Redirect to dashboard if onboarding complete, otherwise to onboarding
      const redirectPath = vendor ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // If no code or user, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
