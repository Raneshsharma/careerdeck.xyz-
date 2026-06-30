import { createClient } from "@/lib/supabase-server";
import { DashboardProvider } from "@/src/evaluation/dashboardProvider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user || user.email !== (process.env.ADMIN_EMAIL || "raneshsharma33@gmail.com")) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = DashboardProvider.getData();
    return Response.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 500 });
  }
}
