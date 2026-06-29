import { DashboardProvider } from "@/src/evaluation/dashboardProvider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = DashboardProvider.getData();
    return Response.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 500 });
  }
}
