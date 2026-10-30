// TEKZITHON router: opens the first working website, in priority order.
// Edit the list below to add, remove or reorder websites.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WEBSITES = [
  "https://tekzithon.vercel.app/",
  "https://tekzithon-backup-2.vercel.app/",
  "https://tekzithon-backup-3.vercel.app/"
];

const TIMEOUT_MS = 3000;

async function isWorking(url) {
  try {
    let res = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
    }
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  // Check all three at the same time (fast), then pick the first healthy one by priority.
  const results = await Promise.all(WEBSITES.map(isWorking));
  const index = results.findIndex(Boolean);

  if (index !== -1) {
    return new Response(null, {
      status: 307,
      headers: {
        Location: WEBSITES[index],
        "Cache-Control": "no-store, max-age=0"
      }
    });
  }

  return new Response(
    "All TEKZITHON websites are temporarily unavailable. Please try again in a minute.",
    {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Retry-After": "30",
        "Cache-Control": "no-store"
      }
    }
  );
}
