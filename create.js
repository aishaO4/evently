const STORAGE_KEY = "gatherly-event-draft-v1";
const steps = [...document.querySelectorAll(".wizard-step")];
const stepButtons = [...document.querySelectorAll("[data-go-step]")];
const form = document.querySelector("#event-form");
const tierList = document.querySelector("#tier-list");
const template = document.querySelector("#tier-template");
const saveStatus = document.querySelector("#save-status");
const draftMeta = document.querySelector(".draft-meta");
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const stepNote = document.querySelector("#step-note");
const toast = document.querySelector("#wizard-toast");
let currentStep = 1;
let maxStep = 1;
let saveTimer;
let toastTimer;
let coverData = "";

const defaultTier = () => ({ id: crypto.randomUUID?.() || String(Date.now()), type: "paid", name: "General admission", price: "120", quantity: "100", saleStart: "", saleEnd: "", earlyEnabled: false, earlyPrice: "", earlyEnd: "" });
let tiers = [defaultTier()];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "your-event";
}

function getFormData() {
  return {
    title: document.querySelector("#event-title").value.trim(),
    date: document.querySelector("#event-date").value,
    time: document.querySelector("#event-time").value,
    location: document.querySelector("#event-location").value.trim(),
    category: document.querySelector("#event-category").value,
    description: document.querySelector("#event-description").value.trim(),
    payout: form.elements.payout.value,
    accountName: document.querySelector("#account-name").value.trim(),
    iban: document.querySelector("#iban").value.trim(),
    fees: form.elements.fees.value,
    slug: document.querySelector("#event-slug").value,
    cover: coverData,
    tiers,
    maxStep,
    updatedAt: new Date().toISOString()
  };
}

function setFormData(data) {
  if (!data) return;
  const fields = ["title", "date", "time", "location", "category", "description", "accountName", "iban"];
  fields.forEach((key) => { if (data[key] != null && form.elements[key]) form.elements[key].value = data[key]; });
  if (data.payout) form.elements.payout.value = data.payout;
  if (data.fees) form.elements.fees.value = data.fees;
  if (data.slug) document.querySelector("#event-slug").value = data.slug;
  if (Array.isArray(data.tiers) && data.tiers.length) tiers = data.tiers;
  if (data.cover) coverData = data.cover;
  maxStep = Math.max(1, Math.min(4, Number(data.maxStep) || 1));
}

function saveDraft(immediate = false) {
  clearTimeout(saveTimer);
  draftMeta.classList.add("saving");
  saveStatus.textContent = "Saving…";
  const run = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData()));
      saveStatus.textContent = `Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
      draftMeta.classList.remove("saving");
    } catch {
      saveStatus.textContent = "Changes saved for this session";
      draftMeta.classList.remove("saving");
    }
  };
  if (immediate) run(); else saveTimer = setTimeout(run, 650);
}

function updateTierFromCard(card) {
  const tier = tiers.find((item) => item.id === card.dataset.id);
  if (!tier) return;
  card.querySelectorAll("[data-key]").forEach((input) => {
    tier[input.dataset.key] = input.type === "checkbox" ? input.checked : input.value;
  });
  const name = tier.name.trim() || "Untitled ticket";
  card.querySelector(".tier-heading").textContent = name;
  card.querySelector(".early-fields").hidden = !tier.earlyEnabled;
  updateTierSummary();
  renderPreview();
  saveDraft();
}

function setTierType(card, type) {
  const tier = tiers.find((item) => item.id === card.dataset.id);
  tier.type = type;
  card.querySelectorAll("[data-type]").forEach((button) => button.classList.toggle("active", button.dataset.type === type));
  const priceField = card.querySelector(".price-field");
  const priceLabel = priceField.querySelector("label");
  const priceInput = priceField.querySelector("input");
  priceField.hidden = type === "free";
  priceLabel.textContent = type === "donation" ? "Suggested amount (AED)" : "Price (AED) *";
  priceInput.placeholder = type === "donation" ? "50" : "120";
  card.querySelector(".tier-kind-label").textContent = `${type.toUpperCase()} TICKET`;
  card.querySelector(".early-row").hidden = type !== "paid";
  updateTierSummary();
  renderPreview();
  saveDraft();
}

function renderTiers() {
  tierList.innerHTML = "";
  tiers.forEach((tier, index) => {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.id = tier.id;
    card.querySelector(".tier-number").textContent = String(index + 1).padStart(2, "0");
    card.querySelectorAll("[data-key]").forEach((input) => {
      input.value = input.type === "checkbox" ? "" : (tier[input.dataset.key] ?? "");
      if (input.type === "checkbox") input.checked = Boolean(tier[input.dataset.key]);
      input.addEventListener("input", () => updateTierFromCard(card));
      input.addEventListener("change", () => updateTierFromCard(card));
    });
    card.querySelectorAll("[data-type]").forEach((button) => button.addEventListener("click", () => setTierType(card, button.dataset.type)));
    card.querySelector(".remove-tier").addEventListener("click", () => {
      if (tiers.length === 1) return showToast("Keep at least one ticket type");
      tiers = tiers.filter((item) => item.id !== tier.id);
      renderTiers();
      saveDraft();
      showToast("Ticket type removed");
    });
    tierList.append(card);
    setTierType(card, tier.type || "paid");
    updateTierFromCard(card);
  });
}

function updateTierSummary() {
  document.querySelector("#total-capacity").textContent = tiers.reduce((sum, tier) => sum + (Number(tier.quantity) || 0), 0).toLocaleString();
  document.querySelector("#tier-count").textContent = tiers.length;
  const prices = tiers.filter((tier) => tier.type !== "free" && Number(tier.price) > 0).map((tier) => Number(tier.earlyEnabled && tier.earlyPrice ? tier.earlyPrice : tier.price));
  const hasFree = tiers.some((tier) => tier.type === "free");
  let range = "Free";
  if (prices.length) {
    const low = Math.min(...prices), high = Math.max(...prices);
    range = `${hasFree ? "Free / " : ""}AED ${low}${high !== low ? `–${high}` : ""}`;
  }
  document.querySelector("#price-range").textContent = range;
}

function formatDate(dateValue, timeValue) {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours = 0, minutes = 0] = (timeValue || "00:00").split(":").map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  return {
    long: date.toLocaleDateString("en-AE", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) + (timeValue ? ` · ${date.toLocaleTimeString("en-AE", { hour: "numeric", minute: "2-digit" })}` : ""),
    month: date.toLocaleDateString("en-AE", { month: "short" }).toUpperCase(),
    day: String(day)
  };
}

function renderPreview() {
  const data = getFormData();
  const formatted = formatDate(data.date, data.time);
  document.querySelector("#preview-title").textContent = data.title || "Your event title";
  const artTitle = document.querySelector("#preview-art-title");
  const artTitleWords = (data.title || "YOUR EVENT").split(/\s+/).slice(0, 4);
  artTitle.replaceChildren(...artTitleWords.flatMap((word, index) => index ? [document.createElement("br"), word] : [word]));
  document.querySelector("#preview-description").textContent = data.description || "Add a short description to give guests the vibe.";
  document.querySelector("#preview-category").textContent = data.category.toUpperCase();
  document.querySelector("#preview-date").textContent = formatted?.long || "Choose a date and time";
  document.querySelector("#preview-date-badge b").textContent = formatted?.day || "—";
  document.querySelector("#preview-date-badge small").textContent = formatted?.month || "—";
  document.querySelector("#preview-location").textContent = data.location || "Add your venue";
  document.querySelector("#map-name").textContent = data.location || "Your venue will appear here";
  const paid = tiers.filter((tier) => tier.type !== "free" && Number(tier.price)).map((tier) => Number(tier.earlyEnabled && tier.earlyPrice ? tier.earlyPrice : tier.price));
  const free = tiers.some((tier) => tier.type === "free");
  document.querySelector("#preview-price").textContent = free ? "Free entry available" : paid.length ? `AED ${Math.min(...paid)}` : "Set up ticket tiers";
  const cover = document.querySelector("#preview-cover");
  cover.style.backgroundImage = coverData ? `url(${JSON.stringify(coverData).slice(1, -1)})` : "";
  cover.classList.toggle("has-cover", Boolean(coverData));
  document.querySelector("#title-count").textContent = data.title.length;
  if (!document.querySelector("#event-slug").dataset.edited) document.querySelector("#event-slug").value = slugify(data.title);
  renderChecklist();
}

function renderChecklist() {
  const data = getFormData();
  const checks = [
    { ok: Boolean(data.title && data.date && data.time && data.location), title: "Event details", text: "Title, schedule, and venue", step: 1 },
    { ok: validateTickets(false), title: "Ticket lineup", text: `${tiers.length} type${tiers.length === 1 ? "" : "s"} · ${tiers.reduce((sum, tier) => sum + (Number(tier.quantity) || 0), 0)} total capacity`, step: 2 },
    { ok: !needsPayout() || data.payout === "paypal" || Boolean(data.accountName && data.iban.replace(/\s/g, "").length >= 15), title: "Payout setup", text: needsPayout() ? "Required for paid ticket sales" : "Not required for a free event", step: 3 }
  ];
  document.querySelector("#checklist").innerHTML = checks.map((check) => `<div class="check-item ${check.ok ? "" : "blocker"}"><span>${check.ok ? "✓" : "!"}</span><div><b>${check.title}</b><small>${check.text}</small></div><button type="button" data-fix-step="${check.step}">${check.ok ? "Edit" : "Fix"}</button></div>`).join("");
  document.querySelectorAll("[data-fix-step]").forEach((button) => button.addEventListener("click", () => goToStep(Number(button.dataset.fixStep))));
}

function clearFieldErrors() {
  document.querySelectorAll("[aria-invalid=true]").forEach((field) => field.removeAttribute("aria-invalid"));
  document.querySelectorAll(".error").forEach((error) => error.textContent = "");
}

function validateDetails(show = true) {
  clearFieldErrors();
  const fields = [
    ["event-title", "title-error", "Add an event title."],
    ["event-date", "date-error", "Choose an event date."],
    ["event-time", "time-error", "Choose a start time."],
    ["event-location", "location-error", "Add a venue or address."]
  ];
  let firstInvalid = null;
  fields.forEach(([id, errorId, message]) => {
    const field = document.querySelector(`#${id}`);
    if (!field.value.trim()) {
      if (show) { field.setAttribute("aria-invalid", "true"); document.querySelector(`#${errorId}`).textContent = message; }
      firstInvalid ||= field;
    }
  });
  if (show && firstInvalid) { firstInvalid.focus(); showToast("Complete the highlighted details"); }
  return !firstInvalid;
}

function validateTickets(show = true) {
  let firstInvalid = null;
  tierList.querySelectorAll("input").forEach((input) => input.removeAttribute("aria-invalid"));
  tiers.forEach((tier) => {
    const card = tierList.querySelector(`[data-id="${CSS.escape(tier.id)}"]`);
    const required = [["name", tier.name?.trim()], ["quantity", Number(tier.quantity) > 0]];
    if (tier.type === "paid") required.push(["price", Number(tier.price) > 0]);
    if (tier.earlyEnabled) required.push(["earlyPrice", Number(tier.earlyPrice) > 0], ["earlyEnd", tier.earlyEnd]);
    required.forEach(([key, valid]) => {
      if (!valid && card) { const input = card.querySelector(`[data-key="${key}"]`); if (show) input.setAttribute("aria-invalid", "true"); firstInvalid ||= input; }
    });
  });
  if (show && firstInvalid) { firstInvalid.focus(); showToast("Complete the highlighted ticket fields"); }
  return !firstInvalid;
}

function needsPayout() { return tiers.some((tier) => tier.type === "paid" || tier.type === "donation"); }

function validatePayment(show = true) {
  if (!needsPayout()) return true;
  if (form.elements.payout.value === "paypal") return true;
  const account = document.querySelector("#account-name");
  const iban = document.querySelector("#iban");
  [account, iban].forEach((field) => field.removeAttribute("aria-invalid"));
  const invalid = !account.value.trim() ? account : (form.elements.payout.value === "bank" && iban.value.replace(/\s/g, "").length < 15 ? iban : null);
  if (invalid && show) { invalid.setAttribute("aria-invalid", "true"); invalid.focus(); showToast("Add valid payout details to continue"); }
  return !invalid;
}

function stepValid(step, show = true) {
  if (step === 1) return validateDetails(show);
  if (step === 2) return validateTickets(show);
  if (step === 3) return validatePayment(show);
  return validateDetails(false) && validateTickets(false) && validatePayment(false);
}

function goToStep(step, push = true) {
  step = Math.max(1, Math.min(4, step));
  if (step > maxStep) return;
  currentStep = step;
  steps.forEach((section) => { const active = Number(section.dataset.step) === step; section.hidden = !active; section.classList.toggle("active", active); });
  stepButtons.forEach((button) => {
    const number = Number(button.dataset.goStep);
    button.disabled = number > maxStep;
    button.classList.toggle("complete", number < step);
    if (number === step) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
  });
  document.querySelector("#progress-fill").style.width = `${((step - 1) / 3) * 100}%`;
  backButton.hidden = step === 1;
  nextButton.classList.toggle("publish", step === 4);
  nextButton.innerHTML = step === 4 ? "Publish event <span>↗</span>" : "Continue <span>→</span>";
  const notes = ["Next: build your ticket lineup", "Next: connect your payout", "Next: review the attendee page", "Your event stays private until you publish"];
  stepNote.textContent = notes[step - 1];
  if (step === 4) { renderPreview(); document.querySelector("#terms").checked = false; }
  if (push) history.pushState({ step }, "", `#step-${step}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector(`[data-step="${step}"] h1`).focus?.({ preventScroll: true });
}

function continueFlow() {
  if (currentStep < 4) {
    if (!stepValid(currentStep, true)) return;
    maxStep = Math.max(maxStep, currentStep + 1);
    saveDraft(true);
    goToStep(currentStep + 1);
    return;
  }
  if (!stepValid(4, false)) { showToast("Resolve the blockers before publishing"); return; }
  if (!document.querySelector("#terms").checked) { document.querySelector("#terms").focus(); showToast("Agree to the organizer terms to publish"); return; }
  nextButton.disabled = true;
  nextButton.textContent = "Publishing…";
  setTimeout(() => {
    nextButton.textContent = "Published ✓";
    saveStatus.textContent = "Event live";
    showToast(`Live at gatherly.com/e/${document.querySelector("#event-slug").value}`);
    localStorage.removeItem(STORAGE_KEY);
  }, 700);
}

function updatePaymentUI() {
  document.querySelector("#bank-fields").hidden = form.elements.payout.value !== "bank";
  document.querySelector("#fee-example").textContent = form.elements.fees.value === "pass" ? "You receive AED 120.00" : "You receive approximately AED 113.80";
  saveDraft();
}

document.querySelector("#add-tier").addEventListener("click", () => {
  tiers.push({ ...defaultTier(), name: `Ticket type ${tiers.length + 1}`, price: "", quantity: "50" });
  renderTiers();
  tierList.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
  tierList.lastElementChild.querySelector('[data-key="name"]').select();
});

form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("input", (event) => {
  if (event.target.id === "event-slug") event.target.dataset.edited = "true";
  renderPreview();
  saveDraft();
});
form.addEventListener("change", (event) => { if (event.target.name === "payout" || event.target.name === "fees") updatePaymentUI(); });
nextButton.addEventListener("click", continueFlow);
backButton.addEventListener("click", () => goToStep(currentStep - 1));
stepButtons.forEach((button) => button.addEventListener("click", () => goToStep(Number(button.dataset.goStep))));
document.querySelector("#exit-button").addEventListener("click", () => { saveDraft(true); window.location.href = "index.html"; });

document.querySelector("#cover-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2.5 * 1024 * 1024) { showToast("Choose an image smaller than 2.5 MB"); return; }
  const reader = new FileReader();
  reader.onload = () => { coverData = reader.result; showCover(); renderPreview(); saveDraft(); };
  reader.readAsDataURL(file);
});

function showCover() {
  const thumb = document.querySelector("#cover-thumb");
  thumb.hidden = !coverData;
  thumb.src = coverData;
  document.querySelector(".cover-upload").classList.toggle("has-image", Boolean(coverData));
}

function openMobilePreview() {
  renderPreview();
  const source = document.querySelector(".attendee-page");
  document.querySelector("#mobile-preview-content").innerHTML = source.outerHTML;
  document.querySelector("#mobile-preview").hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector("#close-preview").focus();
}
document.querySelector("#preview-button").addEventListener("click", openMobilePreview);
document.querySelector("#close-preview").addEventListener("click", () => { document.querySelector("#mobile-preview").hidden = true; document.body.style.overflow = ""; document.querySelector("#preview-button").focus(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !document.querySelector("#mobile-preview").hidden) document.querySelector("#close-preview").click(); });
window.addEventListener("popstate", () => { const step = Number(location.hash.match(/step-(\d)/)?.[1]) || 1; if (step <= maxStep) goToStep(step, false); });

// Restore a saved draft, then apply details handed off by the homepage creation modal.
try { setFormData(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { /* Start clean if an old draft is malformed. */ }
const params = new URLSearchParams(location.search);
if (params.get("title")) document.querySelector("#event-title").value = params.get("title");
if (params.get("category")) {
  const option = [...document.querySelector("#event-category").options].find((item) => item.text.toLowerCase().includes(params.get("category").toLowerCase()));
  if (option) document.querySelector("#event-category").value = option.value;
}
if (!document.querySelector("#event-date").value) {
  const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
  document.querySelector("#event-date").value = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(nextMonth.getDate()).padStart(2, "0")}`;
  document.querySelector("#event-time").value = "19:00";
}
showCover();
renderTiers();
updatePaymentUI();
renderPreview();
const requestedStep = Number(location.hash.match(/step-(\d)/)?.[1]) || 1;
goToStep(Math.min(requestedStep, maxStep), false);
history.replaceState({ step: currentStep }, "", `${location.pathname}${location.search}#step-${currentStep}`);
