"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

/**
 * Server action for email/password signup
 */
export async function signupWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerSupabaseClient();

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${(await headers()).get("origin")}/auth/callback`,
      data: {
        email_confirm: true, // Auto-confirm for development
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Auto sign-in after signup (since email confirmation is disabled)
  if (data.user && !data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return { error: signInError.message };
    }
  }

  return { success: true, redirectTo: "/onboarding" };
}

/**
 * Server action for email/password login
 */
export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerSupabaseClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if vendor has completed onboarding
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", data.user.id)
    .single();

  const redirectTo = vendor ? "/dashboard" : "/onboarding";

  return { success: true, redirectTo };
}

/**
 * Get the OAuth URL for Google sign in
 */
export async function getGoogleOAuthUrl() {
  const supabase = await createServerSupabaseClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      //  redirectTo: 'http://localhost:3000/dashboard' // or your production dashboard
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

/**
 * Server action for logging out
 */
export async function logout() {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, redirectTo: "/login" };
  } catch (error: any) {
    console.error("Logout exception:", error);
    return { success: false, error: error?.message || "Failed to logout" };
  }
}
