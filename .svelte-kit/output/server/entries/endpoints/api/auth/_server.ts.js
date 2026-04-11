import { a as auth } from "../../../../chunks/auth.js";
import { redirect } from "@sveltejs/kit";
async function GET({ request }) {
  const session = await auth.api.getSession({
    headers: request.headers
  });
  if (!session) {
    throw redirect(302, "/login");
  }
  return new Response(JSON.stringify(session), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}
async function POST({ request }) {
  try {
    const result = await auth.api.signInEmail({
      body: await request.json(),
      headers: request.headers
    });
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error2) {
    return new Response(
      JSON.stringify({ error: "Authentication failed" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
export {
  GET,
  POST
};
