const kingdomMap = {
  "3599": "1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso", // 3599 시트 ID
  "3550": "YOUR_SPREADSHEET_ID_FOR_3550" // 필요 시 교체
};

const kingdomId = new URLSearchParams(window.location.search).get("kingdomId");
const sheetId = kingdomMap[kingdomId] || kingdomMap["3599"];
let currentKVK = "KVK3";
let originalData = [];
let currentPage = 1;
let pageSize = 10;

function fetchData(kvk) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${kvk}`;
  fetch(url)
    .then(res => res.text())
    .then(text => JSON.parse(text.substr(47).slice(0, -2)))
    .then(json => {
      const rows = json.table.rows;
      originalData = rows.map(r => ({
        uid: r.c[0]?.v || "",
        name: r.c[1]?.v || "",
        score: r.c[2]?.v || 0,
      }));
      currentPage = 1;
      renderTable();
    });
}

function renderTable() {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const data = originalData.slice(start, end);

  const table = document.getElementById("data");
  table.innerHTML = data.map(d => `
    <tr>
      <td>${d.uid}</td>
      <td>${d.name}</td>
      <td>${d.score}</td>
    </tr>`).join("");

  renderPagination();
}

function renderPagination() {
  const pageCount = Math.ceil(originalData.length / pageSize);
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderTable();
    };
    if (i === currentPage) btn.style.fontWeight = "bold";
    container.appendChild(btn);
  }
}

function handleSearch() {
  const q = document.getElementById("search").value.toLowerCase();
  const filtered = originalData.filter(
    d => d.uid.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
  );
  originalData = filtered;
  currentPage = 1;
  renderTable();
}

function handlePageSizeChange(value) {
  pageSize = parseInt(value);
  currentPage = 1;
  renderTable();
}

function loadKVK(kvk) {
  currentKVK = kvk;
  fetchData(kvk);
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(kvk).classList.add("active");
}

window.onload = () => {
  fetchData(currentKVK);
};
