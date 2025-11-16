import type { PropsWithChildren } from "react";
import { clsx } from "clsx";

export function LayoutShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div
        className={clsx(
          "mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8",
          "sm:px-6 lg:px-10"
        )}
      >
        {children}
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-60 bg-[radial-gradient(circle_at_top,_rgba(23,136,255,0.35),_transparent_65%)]" />
      </div>
    </div>
  );
}
