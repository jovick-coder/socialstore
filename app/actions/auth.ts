"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Server action for email/password signup
 */
export async function signupWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${(await headers()).get("origin")}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding");
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

  if (!vendor) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
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
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
