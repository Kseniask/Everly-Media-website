// Cloudflare Worker — serves the static site AND handles POST /api/contact
//
// This project deploys with `wrangler deploy` (Workers + static assets), not
// classic Cloudflare Pages — that product does NOT understand the Pages
// "/functions" folder convention, which is why /api/contact was 404ing even
// though functions/api/contact.js existed and was correctly committed.
// This single Worker script replaces that: it intercepts /api/contact itself
// and hands every other request off to the static assets binding.
//
// The real Web3Forms access key lives in a Cloudflare environment
// variable/secret named WEB3FORMS_ACCESS_KEY and is injected here at request
// time — it never appears in any file served to visitors.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }

    // Everything else — index.html, images, videos — comes straight from
    // the static assets binding declared in wrangler.jsonc.
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  if (!env.WEB3FORMS_ACCESS_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server is not configured (missing WEB3FORMS_ACCESS_KEY).",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let incoming;
  try {
    incoming = await request.formData();
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid form submission." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Overwrite whatever the client sent (or didn't) with the real, secret key.
  incoming.set("access_key", env.WEB3FORMS_ACCESS_KEY);

  const upstream = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: incoming,
  });

  const data = await upstream.json().catch(() => ({
    success: false,
    message: "Unexpected response from email service.",
  }));

  return new Response(JSON.stringify(data), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
