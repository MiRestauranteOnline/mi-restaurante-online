export const onRequest: PagesFunction = async () => {
  return new Response(JSON.stringify({ ok: true, status: 'healthy', ts: new Date().toISOString() }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
