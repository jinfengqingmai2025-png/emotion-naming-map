const cardsRoot = document.querySelector("#cards");
const search = document.querySelector("#search");
const random = document.querySelector("#random");
let cards = [];

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);

function render(items) {
  if (!items.length) {
    cardsRoot.innerHTML = '<p class="empty">No matching card. Try a different word.</p>';
    return;
  }
  cardsRoot.innerHTML = items.map((card) => `
    <article class="card" id="card-${card.id}">
      <div class="card-top"><span>${card.id}</span><span>SELF-REFLECTION</span></div>
      <h2>${escapeHtml(card.title)}</h2>
      <p class="description">${escapeHtml(card.description)}</p>
      <div class="sections">
        <section><h3>Mechanism</h3><p>${escapeHtml(card.mechanism)}</p></section>
        <section><h3>Reflection direction</h3><p>${escapeHtml(card.healingDirection)}</p></section>
        <section><h3>Safe practice</h3><p>${escapeHtml(card.safePractice)}</p></section>
      </div>
    </article>`).join("");
}

function filter() {
  const query = search.value.trim().toLowerCase();
  render(cards.filter((card) => JSON.stringify(card).toLowerCase().includes(query)));
}

search.addEventListener("input", filter);
random.addEventListener("click", () => {
  const selected = cards[Math.floor(Math.random() * cards.length)];
  search.value = "";
  render([selected]);
  document.querySelector(`#card-${selected.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
});

cards = await fetch("./data/cards.json").then((response) => response.json());
render(cards);
