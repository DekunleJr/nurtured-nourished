import { siteConfig } from "@/lib/site";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${siteConfig.apiUrl}/api/discovery-intake`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = await res.text();
      return Response.json({ error: "Backend rejected intake", detail }, { status: 502 });
    }
    const data = await res.json();
    return Response.json(data, { status: 201 });
  } catch {
    return Response.json({ error: "Could not reach backend" }, { status: 502 });
  }
}