export const onRequest: PagesFunction = async ({ request }) => {
  try {
    const { pathname, host } = new URL(request.url);
    return new Response(
      JSON.stringify({ ok: true, runtime: 'pages-functions', host, pathname, timestamp: new Date().toISOString() }),
      { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message || err) }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};