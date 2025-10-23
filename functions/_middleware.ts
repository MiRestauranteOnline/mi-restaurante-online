// Global error and rejection logging to help identify crashes at runtime
addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  // Some runtimes don't expose .reason safely
  const reason = (event as any).reason ?? 'unknown reason';
  console.error('[WORKER-UNHANDLED] unhandledrejection', reason);
});

addEventListener('error', (event: ErrorEvent) => {
  const err = (event as any).error ?? (event as any).message ?? 'unknown error';
  console.error('[WORKER-UNHANDLED] error', err);
});

export const onRequest: PagesFunction = async (ctx) => {
  try {
    return await ctx.next();
  } catch (err: any) {
    console.error('[WORKER-UNHANDLED] onRequest error', err?.stack || String(err));
    const body = JSON.stringify({ ok: false, error: String(err?.message || err), stack: err?.stack });
    return new Response(body, {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
};