const searchInput = document.querySelector("#search-input");
const eventCards = [...document.querySelectorAll(".event-card")];
const categories = [...document.querySelectorAll(".category")];
const emptyState = document.querySelector("#empty-state");
const modal = document.querySelector("#create-modal");
const toast = document.querySelector("#toast");
let activeCategory = "all";
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function filterEvents() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  eventCards.forEach((card) => {
    const categoryMatch = activeCategory === "all" || card.dataset.category === activeCategory;
    const searchMatch = !query || card.dataset.searchable.includes(query);
    card.hidden = !(categoryMatch && searchMatch);
    if (!card.hidden) visible += 1;
  });
  emptyState.hidden = visible > 0;
}

categories.forEach((button) => button.addEventListener("click", () => {
  categories.forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  activeCategory = button.dataset.category;
  filterEvents();
}));

document.querySelector("#event-search").addEventListener("submit", (event) => event.preventDefault());
searchInput.addEventListener("input", filterEvents);

document.querySelectorAll(".save-button").forEach((button) => button.addEventListener("click", (event) => {
  event.stopPropagation();
  const saved = button.classList.toggle("saved");
  button.textContent = saved ? "♥" : "♡";
  showToast(saved ? "Saved to your plans" : "Removed from your plans");
}));

eventCards.forEach((card) => card.addEventListener("click", () => {
  showToast(`${card.querySelector("h3").textContent} selected`);
}));

function openModal() {
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => document.querySelector("#event-name").focus(), 0);
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll(".js-create").forEach((button) => button.addEventListener("click", openModal));
document.querySelectorAll("[data-close-modal]").forEach((element) => element.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});

document.querySelectorAll(".occasion-grid button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".occasion-grid button").forEach((item) => item.classList.remove("selected"));
  button.classList.add("selected");
}));

document.querySelector(".modal-next").addEventListener("click", () => {
  const name = document.querySelector("#event-name").value.trim();
  const selected = document.querySelector(".occasion-grid .selected");
  const params = new URLSearchParams();
  if (name) params.set("title", name);
  if (selected) params.set("category", selected.textContent.replace(/^\S+\s*/, "").trim());
  window.location.href = `create.html${params.size ? `?${params}` : ""}`;
});

document.querySelector("#shuffle-templates").addEventListener("click", () => {
  const rail = document.querySelector(".template-rail");
  rail.append(rail.firstElementChild);
  showToast("Fresh vibes, coming up");
});

const menuButton = document.querySelector(".menu-button");
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  showToast(open ? "Menu closed" : "Explore · For hosts · Sell tickets");
});
