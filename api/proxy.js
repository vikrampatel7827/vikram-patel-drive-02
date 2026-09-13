export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Grab the intended Google URL from the custom header
  const targetUrl = req.headers.get('x-target-url');

  if (!targetUrl) {
    return new Response('Missing target URL', { status: 400 });
  }

  const headers = new Headers(req.headers);
  headers.delete('x-target-url');
  headers.delete('host');

  try {
    const proxyRes = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      // Stream the data chunks natively
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      duplex: 'half' 
    });

    const responseHeaders = new Headers(proxyRes.headers);
    // Crucial: Expose the Location header so your frontend can find the active upload link
    responseHeaders.set('Access-Control-Expose-Headers', 'Location');

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Tunnel error:', error);
    return new Response(JSON.stringify({ error: 'Proxy tunnel failed' }), { status: 500 });
  }
}