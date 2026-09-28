import Link from "next/link";

export function PageHeader({ title, action }: { title: string; action?: { href: string; label: string } }) {
  return (
    <header className="mb-5 flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {action && (
        <Link href={action.href} className="btn-primary text-sm">
          {action.label}
        </Link>
      )}
    </header>
  );
}
