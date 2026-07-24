import { redirect } from "next/navigation";

// Friendly entry point: doughmination.info/st/<code> drops the visitor on the
// signup page with their code already filled in. (Next 15+ hands params as a
// promise.)
export default async function StCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const clean = (code || "").replace(/[^A-Za-z0-9._-]/g, "");
  redirect(`/signup?code=${encodeURIComponent(clean)}`);
}
