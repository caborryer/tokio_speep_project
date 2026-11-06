import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/scoreStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const csv = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/**
 * Exporta el ranking con correos (CSV) para contactar a los ganadores / marcas.
 * Protegido: requiere ADMIN_KEY en el hosting y enviarla en `?key=` o en el header `x-admin-key`.
 * Sin ADMIN_KEY definida, la ruta no existe (404).
 */
export async function GET(req: NextRequest) {
  const admin = process.env.ADMIN_KEY;
  if (!admin) return new NextResponse("Not found", { status: 404 });
  const given = req.nextUrl.searchParams.get("key") ?? req.headers.get("x-admin-key") ?? "";
  if (given !== admin) return new NextResponse("Unauthorized", { status: 401 });

  const store = getStore();
  if (!store) return new NextResponse("Ranking no configurado", { status: 503 });
  const limit = Math.min(1000, Number(req.nextUrl.searchParams.get("limit")) || 100);
  const rows = await store.all(limit);
  const body = [
    "posicion,apodo,correo,puntaje,actualizado",
    ...rows.map((r) => [r.rank, csv(r.nick), csv(r.email), r.score, new Date(r.updatedAt).toISOString()].join(",")),
  ].join("\n");
  return new NextResponse(body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store", "Content-Disposition": 'attachment; filename="ranking.csv"' },
  });
}
