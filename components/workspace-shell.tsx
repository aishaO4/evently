"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import type { SafeUser } from "@/lib/auth";

export function WorkspaceShell({ user, eyebrow, title, children }: { user: SafeUser; eyebrow: string; title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const links = user.role === "organizer"
    ? [{ href: "/organizer/dashboard", label: "Events" }, { href: "/create", label: "Create event" }]
    : [{ href: "/", label: "Explore" }, { href: "/tickets", label: "Tickets" }];
  const active = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return <main className="workspace">
    <header className="workspace-header">
      <div className="workspace-brand"><Link className="brand" href="/"><span className="brand-mark">+</span> gatherly</Link><span className="role-chip">{user.role} workspace</span></div>
      <nav aria-label={`${user.role} navigation`}>
        {links.map((link) => <Link key={link.href} href={link.href} aria-current={active(link.href) ? "page" : undefined}>{link.label}</Link>)}
        <Link href="/account" aria-current={active("/account") ? "page" : undefined}>Account</Link>
        <LogoutButton />
      </nav>
    </header>
    <section className="workspace-title" aria-labelledby="workspace-heading"><span className="step-label">{eyebrow}</span><h1 id="workspace-heading">{title}</h1><p><strong>{user.name}</strong><span aria-hidden="true"> · </span>{user.email}</p></section>
    {children}
  </main>;
}
