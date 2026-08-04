"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TicketTier = {
  name: string;
  type: "free" | "paid" | "donation";
  price: string;
  quantity: string;
};

type FormState = {
  title: string;
  slug: string;
  category: string;
  location: string;
  startsAt: string;
  endsAt: string;
  coverImageUrl: string;
  status: "draft" | "published";
  ticketTiers: TicketTier[];
};

function todayInputValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function nextDayInputValue() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

const defaultTier = (): TicketTier => ({ name: "", type: "paid", price: "95", quantity: "100" });

export function EventCreationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    category: "Music",
    location: "",
    startsAt: todayInputValue(),
    endsAt: nextDayInputValue(),
    coverImageUrl: "",
    status: "published",
    ticketTiers: [defaultTier()],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<{ id: string; title: string } | null>(null);

  const summary = useMemo(() => {
    const start = form.startsAt ? new Date(form.startsAt) : null;
    const end = form.endsAt ? new Date(form.endsAt) : null;
    return {
      startLabel: start ? start.toLocaleString("en", { dateStyle: "medium", timeStyle: "short" }) : "Not set",
      endLabel: end ? end.toLocaleString("en", { dateStyle: "medium", timeStyle: "short" }) : "Not set",
      tierCount: form.ticketTiers.length,
      totalCapacity: form.ticketTiers.reduce((sum, tier) => sum + Number(tier.quantity || 0), 0),
    };
  }, [form.endsAt, form.startsAt, form.ticketTiers]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    if (field === "title" && typeof value === "string") {
      const generatedSlug = slugify(value);
      if (!form.slug || form.slug === slugify(form.title)) {
        setForm((current) => ({ ...current, slug: generatedSlug }));
      }
    }
  }

  function updateTier(index: number, field: keyof TicketTier, value: string) {
    setForm((current) => ({
      ...current,
      ticketTiers: current.ticketTiers.map((tier, tierIndex) => tierIndex === index ? { ...tier, [field]: value } : tier),
    }));
  }

  function addTier() {
    setForm((current) => ({ ...current, ticketTiers: [...current.ticketTiers, defaultTier()] }));
  }

  function removeTier(index: number) {
    setForm((current) => ({ ...current, ticketTiers: current.ticketTiers.filter((_, tierIndex) => tierIndex !== index) }));
  }

  function validateStepOne() {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Add an event title.";
    if (!form.slug.trim()) nextErrors.slug = "Add a clean URL slug.";
    if (!form.category.trim()) nextErrors.category = "Choose a category.";
    if (!form.location.trim()) nextErrors.location = "Add a location.";
    if (!form.startsAt) nextErrors.startsAt = "Choose a start time.";
    if (!form.endsAt) nextErrors.endsAt = "Choose an end time.";
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) nextErrors.endsAt = "End time must be after start time.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateStepTwo() {
    const nextErrors: Record<string, string> = {};
    if (form.ticketTiers.length === 0) nextErrors.ticketTiers = "Add at least one ticket tier.";
    form.ticketTiers.forEach((tier, index) => {
      if (!tier.name.trim()) nextErrors[`tierName-${index}`] = "Name this tier.";
      if (!tier.quantity || Number(tier.quantity) < 1) nextErrors[`tierQuantity-${index}`] = "Set a capacity.";
      if (tier.type !== "free" && (!tier.price || Number(tier.price) < 0)) nextErrors[`tierPrice-${index}`] = "Set a price or use free.";
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitEvent() {
    if (!validateStepOne() || !validateStepTwo()) return;
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        category: form.category.trim(),
        location: form.location.trim(),
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        coverImageUrl: form.coverImageUrl.trim() || undefined,
        status: form.status,
        ticketTiers: form.ticketTiers.map((tier) => ({
          name: tier.name.trim(),
          type: tier.type,
          price: Number(tier.price || 0),
          quantity: Number(tier.quantity || 1),
        })),
      };
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your event could not be published.");
      setCreatedEvent({ id: data.event.id, title: data.event.title });
      setSubmitMessage("Event published successfully.");
      setStep(3);
      window.setTimeout(() => router.push("/organizer/dashboard"), 1000);
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "A problem occurred while publishing.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="workspace-list wizard-shell">
      <div className="wizard-card">
        <div className="wizard-head">
          <div>
            <span className="step-label">EVENT CREATION</span>
            <h2>Build your event in three quick steps.</h2>
            <p>Launch a real event with your details, ticket tiers, and publish flow.</p>
          </div>
          <div className="wizard-progress" aria-label="Wizard progress">
            {[1, 2, 3].map((item) => (
              <span key={item} className={`wizard-step ${step >= item ? "active" : ""} ${createdEvent && item <= 3 ? "complete" : ""}`}>
                {item === 1 ? "Details" : item === 2 ? "Tickets" : "Review"}
              </span>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="wizard-panel">
            <div className="wizard-grid">
              <label className="wizard-field">
                <span>Event title</span>
                <input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Summer rooftop session" />
                {errors.title ? <small className="field-error">{errors.title}</small> : null}
              </label>
              <label className="wizard-field">
                <span>Public URL slug</span>
                <input value={form.slug} onChange={(event) => updateField("slug", event.target.value)} placeholder="summer-rooftop-session" />
                {errors.slug ? <small className="field-error">{errors.slug}</small> : null}
              </label>
              <label className="wizard-field">
                <span>Category</span>
                <input value={form.category} onChange={(event) => updateField("category", event.target.value)} placeholder="Music" />
                {errors.category ? <small className="field-error">{errors.category}</small> : null}
              </label>
              <label className="wizard-field">
                <span>Location</span>
                <input value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="The Rooftop, Dubai" />
                {errors.location ? <small className="field-error">{errors.location}</small> : null}
              </label>
              <label className="wizard-field">
                <span>Start</span>
                <input type="datetime-local" value={form.startsAt} onChange={(event) => updateField("startsAt", event.target.value)} />
                {errors.startsAt ? <small className="field-error">{errors.startsAt}</small> : null}
              </label>
              <label className="wizard-field">
                <span>End</span>
                <input type="datetime-local" value={form.endsAt} onChange={(event) => updateField("endsAt", event.target.value)} />
                {errors.endsAt ? <small className="field-error">{errors.endsAt}</small> : null}
              </label>
              <label className="wizard-field full">
                <span>Cover image URL</span>
                <input value={form.coverImageUrl} onChange={(event) => updateField("coverImageUrl", event.target.value)} placeholder="https://images.example.com/cover.jpg" />
              </label>
            </div>
            <div className="wizard-actions">
              <button className="button-link primary" type="button" onClick={() => { if (validateStepOne()) setStep(2); }}>Continue to ticket tiers</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-panel">
            <div className="wizard-stack">
              {form.ticketTiers.map((tier, index) => (
                <div className="tier-card" key={`${tier.name}-${index}`}>
                  <div className="tier-row">
                    <label className="wizard-field">
                      <span>Tier name</span>
                      <input value={tier.name} onChange={(event) => updateTier(index, "name", event.target.value)} placeholder="General admission" />
                      {errors[`tierName-${index}`] ? <small className="field-error">{errors[`tierName-${index}`]}</small> : null}
                    </label>
                    <label className="wizard-field">
                      <span>Type</span>
                      <select value={tier.type} onChange={(event) => updateTier(index, "type", event.target.value)}>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                        <option value="donation">Donation</option>
                      </select>
                    </label>
                    <label className="wizard-field">
                      <span>Price</span>
                      <input type="number" min="0" step="1" value={tier.price} onChange={(event) => updateTier(index, "price", event.target.value)} disabled={tier.type === "free"} />
                      {errors[`tierPrice-${index}`] ? <small className="field-error">{errors[`tierPrice-${index}`]}</small> : null}
                    </label>
                    <label className="wizard-field">
                      <span>Capacity</span>
                      <input type="number" min="1" step="1" value={tier.quantity} onChange={(event) => updateTier(index, "quantity", event.target.value)} />
                      {errors[`tierQuantity-${index}`] ? <small className="field-error">{errors[`tierQuantity-${index}`]}</small> : null}
                    </label>
                  </div>
                  {form.ticketTiers.length > 1 ? <button className="text-link" type="button" onClick={() => removeTier(index)}>Remove tier</button> : null}
                </div>
              ))}
            </div>
            <div className="wizard-actions split">
              <button className="button-link" type="button" onClick={() => setStep(1)}>Back</button>
              <div className="wizard-actions-inline">
                <button className="button-link" type="button" onClick={addTier}>Add another tier</button>
                <button className="button-link primary" type="button" onClick={() => { if (validateStepTwo()) setStep(3); }}>Review & publish</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-panel">
            <div className="wizard-summary">
              <div className="wizard-summary-card">
                <span className="mono">EVENT SUMMARY</span>
                <h3>{form.title || "Your event"}</h3>
                <p>{form.location || "Location to be announced"}</p>
                <p>{summary.startLabel} → {summary.endLabel}</p>
              </div>
              <div className="wizard-summary-card accent">
                <span className="mono">TICKETS</span>
                <h3>{summary.tierCount} tier{summary.tierCount === 1 ? "" : "s"}</h3>
                <p>{summary.totalCapacity} total spots</p>
                <ul>
                  {form.ticketTiers.map((tier, index) => (
                    <li key={`${tier.name}-${index}`}>
                      <b>{tier.name || `Tier ${index + 1}`}</b>
                      <span>{tier.type} · {tier.price ? `${tier.price}` : "0"} · {tier.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {submitMessage ? <div className={`workspace-alert ${submitMessage.includes("success") ? "success" : ""}`} role="status">{submitMessage}</div> : null}
            <div className="wizard-actions split">
              <button className="button-link" type="button" onClick={() => setStep(2)}>Back</button>
              <div className="wizard-actions-inline">
                {createdEvent ? <a className="button-link" href="/organizer/dashboard">View dashboard</a> : null}
                <button className="button-link primary" type="button" onClick={submitEvent} disabled={isSubmitting}>
                  {isSubmitting ? "Publishing..." : "Publish event"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
