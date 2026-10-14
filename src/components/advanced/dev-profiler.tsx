"use client";

import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from "react";

const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration) => {
  // Dev-only measurement. actual = time spent this commit; base = cost without memoisation.
  console.debug(`[Profiler] ${id} ${phase}: ${actualDuration.toFixed(2)} ms (base ${baseDuration.toFixed(2)} ms)`);
};

/** React Profiler API wrapper; a plain passthrough in production builds. */
export function DevProfiler({ id, children }: { id: string; children: ReactNode }) {
  if (process.env.NODE_ENV !== "development") return <>{children}</>;
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}
