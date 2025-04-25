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
    KVK1: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_3550/gviz/tq?tqx=out:json&sheet=KVK1",
    KVK2: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_3550/gviz/tq?tqx=out:json&sheet=KVK2",
    KVK3: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_3550/gviz/tq?tqx=out:json&sheet=KVK3"
  }
};

let tableData = [];
let filteredData = [];
let currentKVK = "KVK3";
let pageSize = 10;
let currentPage = 1;

function loadKVK(kvkKey) {
  currentKVK = kvkKey;
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelector(`.tab[onclick*='${kvkKey}']`).classList.add("active");

  const url = sheetLinks[kingdomId][kvkKey];
  if (!url) return;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const table = json.table;
      tableData = table.rows.map(row => row.c.map(cell => cell?.v ?? ""));
      filteredData = [...tableData];

      const headers = table.cols.map(col => col.label || "열");
      renderTable(headers, filteredData);
      renderPagination();
    });
}

function renderTable(headers, dataSlice) {
  const thead = document.querySelector("#kvkTable thead");
  const tbody = document.querySelector("#kvkTable tbody");

  if (!thead || !tbody) {
    console.warn("테이블 요소가 존재하지 않습니다.");
    return;
  }

  const start = (currentPage - 1) * pageSize;
  const current = dataSlice.slice(start, start + pageSize);

  thead.innerHTML = `
    <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
  `;

  tbody.innerHTML = current.map(row => `
    <tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>
  `).join("");
}

function renderPagination() {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  const totalPages = Math.ceil(filteredData.length / pageSize);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderTableFromState();
    };
    if (i === currentPage) btn.style.fontWeight = "bold";
    container.appendChild(btn);
  }
}

function renderTableFromState() {
  const thead = document.querySelector("#kvkTable thead");
  if (!thead || !thead.querySelector("tr")) return;

  const headers = Array.from(thead.querySelectorAll("th")).map(th => th.textContent);
  renderTable(headers, filteredData);
}

document.getElementById("searchInput").addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  filteredData = tableData.filter(row =>
    row.some(cell => cell.toString().toLowerCase().includes(query))
  );
  currentPage = 1;
  renderTableFromState();
});

function handlePageSizeChange(val) {
  pageSize = parseInt(val);
  currentPage = 1;
  renderTableFromState();
}

window.addEventListener("DOMContentLoaded", () => {
  loadKVK("KVK3");
});
