export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/submit" && request.method === "POST") {
      return handleSubmit(request, env);
    }

    // Everything else falls through to your static site files
    return env.ASSETS.fetch(request);
  },
};

async function handleSubmit(request, env) {
  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    if (!name || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    const airtableRes = await fetch(
      "https://api.airtable.com/v0/app2NTrklLiQ54INc/Requests",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: { Name: name, Email: email, Message: message },
        }),
      }
    );

    if (!airtableRes.ok) {
      const errText = await airtableRes.text();
      console.error("Airtable error:", errText);
      return new Response("Failed to submit form", { status: 502 });
    }

    return new Response("OK", { status: 200 });  } catch (err) {
    console.error("Submit handler error:", err);
    return new Response("Something went wrong", { status: 500 });
  }
}
