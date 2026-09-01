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
    const data = await res.json().catch(() => null);
    return Response.json(data ?? { error: "Backend error" }, { status: res.status });
  } catch {
    return Response.json({ error: "Could not reach backend" }, { status: 503 });
  }
}
