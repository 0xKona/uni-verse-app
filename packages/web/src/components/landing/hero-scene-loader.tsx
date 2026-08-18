"use client";

import { Component, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

const HeroScene = dynamic(() => import("./hero-scene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => <CosmicBackdrop />,
});

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl");
  return !!gl;
}

class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function CosmicBackdrop() {
  return (
    <div className="absolute inset-0 bg-cosmic" aria-hidden="true">
      <div className="absolute left-[8%] top-[12%] size-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute right-[10%] top-[30%] size-32 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-[14%] left-[35%] size-44 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}

function WebGLNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="absolute top-5 left-1/2 z-30 w-[min(94%,36rem)] -translate-x-1/2 animate-in fade-in-0 slide-in-from-top-3 duration-300">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background/85 p-3 shadow-lg backdrop-blur-xl">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="flex-1 text-sm leading-relaxed">
          <p className="font-medium text-foreground">WebGL is disabled</p>
          <p className="mt-0.5 text-muted-foreground">
            This page uses WebGL which appears to be disabled in your browser. Enable graphics acceleration
            in your browser settings (Brave/Chrome: Settings &rarr; System &rarr;
            &ldquo;Use graphics acceleration when available&rdquo;, then restart
            the browser) to see it in full.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss WebGL notice"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function useWebGLSupport() {
  return useSyncExternalStore(
    emptySubscribe,
    () => typeof window !== "undefined" && supportsWebGL(),
    () => false,
  );
}

export function HeroSceneLoader() {
  const supported = useWebGLSupport();

  return (
    <>
      <div className="absolute inset-0" aria-hidden="true">
        {supported ? (
          <SceneBoundary fallback={<CosmicBackdrop />}>
            <HeroScene />
          </SceneBoundary>
        ) : (
          <CosmicBackdrop />
        )}
      </div>
      {!supported && <WebGLNotice />}
    </>
  );
}
