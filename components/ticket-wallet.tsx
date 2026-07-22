"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
type Ticket = { id: string; tier: string; status: string; event: { title: string; startsAt: string; location: string; category: string } };
export function TicketWallet() {
  const [tickets, setTickets] = useState<Ticket[]>([]); const [state, setState] = useState("loading");
  function load() { setState("loading"); fetch("/api/tickets").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setTickets(data.tickets); setState("ready"); }).catch(() => setState("error")); }
  useEffect(() => { fetch("/api/tickets").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setTickets(data.tickets); setState("ready"); }).catch(() => setState("error")); }, []);
  if (state === "loading") return <div className="workspace-loading ticket-skeleton" role="status" aria-label="Loading your tickets"><span /><span /><span /></div>;
  if (state === "error") return <div className="workspace-alert" role="alert"><b>Your wallet is out of reach.</b><span>Check your connection and try again.</span><button className="button-link" type="button" onClick={load}>Try again</button></div>;
  if (!tickets.length) return <section className="workspace-empty"><b>No tickets yet.</b><p>When you book an event, your ticket will land here.</p><Link className="button-link primary" href="/">Explore events</Link></section>;
  return <section className="ticket-grid" aria-label="Your tickets">{tickets.map((ticket) => <Link href={`/tickets/${ticket.id}`} className="wallet-ticket" key={ticket.id}><div className="ticket-card-top"><span className="mono">{ticket.event.category}</span><span className={`status-label ${ticket.status}`}>{ticket.status}</span></div><h2>{ticket.event.title}</h2><p><time dateTime={ticket.event.startsAt}>{new Date(ticket.event.startsAt).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time><br />{ticket.event.location}</p><b>{ticket.tier}<span aria-hidden="true"> →</span></b></Link>)}</section>;
}
