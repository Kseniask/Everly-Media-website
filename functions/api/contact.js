// Cloudflare Pages Function — handles POST /api/contact
//
// The browser only ever talks to this same-origin endpoint. The real
// Web3Forms access key lives in a Cloudflare Pages environment variable
// (set as an encrypted secret named WEB3FORMS_ACCESS_KEY in the dashboard)
// and is injected here at request time — it never appears in any file
// served to visitors, so `view-source:` reveals nothing.

export async function onRequestPost(context) {
  const { request, env } = context;

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
