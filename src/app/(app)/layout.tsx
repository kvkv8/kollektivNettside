import { BottomNav } from "@/components/BottomNav";
import { requireSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();

  return (
    <>
      <main className="mx-auto w-full max-w-xl px-4 pt-6 pb-28">{children}</main>
      <BottomNav />
    </>
  );
}
