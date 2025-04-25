const kingdomId = new URLSearchParams(window.location.search).get("kingdomId") || "3599";
const kingdomNameMap = {
  "3599": "3599 베르디나 왕국",
  "3550": "3550 미로 왕국"
};

document.getElementById("kingdomName").textContent = kingdomNameMap[kingdomId] || "Kingdom";

const sheetLinks = {
  "3599": {
    KVK1: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK1",
    KVK2: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK2",
    KVK3: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK3"
  },
  "3550": {
    KVK1: "https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_3550/gviz/tq?tqx=out:json&sheet=KVK1",
    KVK2: "https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_3550/gviz/tq?tqx=out:json&sheet=KVK2",
    KVK3: "https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_3550/gviz/tq?tqx=out:json&sheet=KVK3"
  }
};

let rawData = [];
let filteredData = [];
let pageSize = 10;
let currentPage = 1;

function loadKVK(kvkKey) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelector(`.tab[onclick*='${kvkKey}']`).classList.add("active");

  const url = sheetLinks[kingdomId][kvkKey];
  if (!url) return;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;

      rawData = rows.map(r => ({
        uid: r.c[0]?.v || "",
        name: r.c[1]?.v || "",
        totalKP: r.c[3]?.v || 0,
        deaths: r.c[4]?.v || 0,
        t4: r.c[5]?.v || 0,
        t5: r.c[6]?.v || 0
      }));

      filteredData = [...rawData];
      currentPage = 1;
      renderPage();
    });
}

function renderPage() {
  const start = (currentPage - 1) * pageSize;
  const page = filteredData.slice(start, start + pageSize);
  const container = document.getElementById("cardGrid");

  container.innerHTML = page.map(d => `
    <div class="card">
      <h3>${d.name}</h3>
      <p><strong>UID:</strong> ${d.uid}</p>
      <p><strong>T4:</strong> ${Number(d.t4).toLocaleString()}</p>
      <p><strong>T5:</strong> ${Number(d.t5).toLocaleString()}</p>
      <p><strong>Deaths:</strong> ${Number(d.deaths).toLocaleString()}</p>
      <p><strong>Total KP:</strong> ${Number(d.totalKP).toLocaleString()}</p>
    </div>
  `).join("");

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderPage();
    };
    if (i === currentPage) btn.style.fontWeight = "bold";
    container.appendChild(btn);
  }
}

function handlePageSizeChange(size) {
  pageSize = parseInt(size);
  currentPage = 1;
  renderPage();
}

document.getElementById("searchInput").addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  filteredData = rawData.filter(d =>
    d.name.toLowerCase().includes(query) || d.uid.toString().includes(query)
  );
  currentPage = 1;
  renderPage();
});

window.addEventListener("DOMContentLoaded", () => {
  loadKVK("KVK3"); // KVK3 기본 표시
});
