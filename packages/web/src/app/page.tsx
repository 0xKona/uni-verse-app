import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { cookies } from "next/headers";
import { TopNav } from "@/components/landing/top-nav";
import { HeroSceneLoader } from "@/components/landing/hero-scene-loader";
import { HeroContent } from "@/components/landing/hero-content";
import { TranslationDemo } from "@/components/landing/translation-demo";

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
      <div className="flex min-h-screen flex-col bg-cosmic">
        <TopNav authenticated={authenticated} />
        <section className="relative flex min-h-[560px] flex-1 items-center justify-center overflow-hidden px-4">
          <HeroSceneLoader />
          <div className="relative z-10 flex w-full flex-col items-center justify-center gap-10 px-4">
            <HeroContent authenticated={authenticated} />
            <TranslationDemo />
          </div>
        </section>
      </div>
  );
}
