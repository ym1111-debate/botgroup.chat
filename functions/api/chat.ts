export async function onRequest(context: { request: Request }) {
  const method = context.request.method;

  return new Response(JSON.stringify({
    ok: true,
    message: "chat function alive",
    method
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
