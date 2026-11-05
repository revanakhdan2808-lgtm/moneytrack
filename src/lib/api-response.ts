export function notImplemented() {
  return Response.json(
    { error: "Endpoint ini belum diimplementasikan." },
    { status: 501 },
  );
}
