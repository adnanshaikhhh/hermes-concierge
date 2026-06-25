import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const redirectTo = sp.redirect || "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(redirectTo);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1420] p-8">
        <h1 className="mb-2 text-2xl font-bold text-[#f0f4ff]">Sign in</h1>
        <p className="mb-6 text-sm text-[#8b9dc3]">
          We&apos;ll email you a magic link — no password needed.
        </p>
        <LoginForm redirectTo={redirectTo} />
        <p className="mt-6 border-t border-[#1e2d4a] pt-4 text-center text-xs text-[#4a5980]">
          New here?{" "}
          <Link href="/" className="text-[#3b6fe8] hover:underline">
            Browse services →
          </Link>
        </p>
      </div>
    </div>
  );
}
