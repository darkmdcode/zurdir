// instrumentation.ts

// Next.js 14 instrumentation: called once on app/server start
export async function register() {
  // Instrumentation initialization
}

// Required by Next.js 14 for router transition tracing
export function onRouterTransitionStart() {
  // No-op for now; Next.js expects this export.
}


