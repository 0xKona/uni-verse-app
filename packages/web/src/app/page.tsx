import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Home() {

  const authenticated = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec);
          return !!session.tokens;
        } catch {
          return false;
        }
      },
    });

  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="flex flex-col items-center gap-6 text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                  Welcome to Uni-Verse
              </h1>
          </div>
        <div className="flex gap-3 mt-5">
          {authenticated ? (
            <Link href="/dashboard" className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all">
                  Sign In
              </Link>
              <Link href="/signup" className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted">
                  Create Account
              </Link>
            </>
          )}
        </div>
      </div>
  );
}
