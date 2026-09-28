import Link from "next/link";

type Props = {
  title: string;
  emoji?: string;
  action?: { href: string; label: string };
  back?: { href: string; label: string };
};

export function PageHeader({ title, emoji, action, back }: Props) {
  return (
    <header className="rise mb-6 flex flex-col gap-2">
      {back && (
        <Link href={back.href} transitionTypes={["nav-back"]} className="self-start text-sm font-medium text-muted">
          ← {back.label}
        </Link>
      )}
      <div className="flex items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          {emoji && (
            <span aria-hidden className="pop">
              {emoji}
            </span>
          )}
          {title}
        </h1>
        {action && (
          <Link href={action.href} transitionTypes={["nav-forward"]} className="btn-primary shrink-0 text-sm">
            {action.label}
          </Link>
        )}
      </div>
    </header>
  );
}
