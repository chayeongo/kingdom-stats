const sheetLinks = {
  "3599": {
    name: "3599 베르디나 왕국",
    kvk1: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK1",
    kvk2: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK2",
    kvk3: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK3"
  },
  "3550": {
    name: "3550 미로 왕국",
    kvk1: "https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_3550/gviz/tq?tqx=out:json&sheet=KVK1",
    kvk2: "https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_3550/gviz/tq?tqx=out:json&sheet=KVK2",
    kvk3: "https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_3550/gviz/tq?tqx=out:json&sheet=KVK3"
  }
};

const kingdomId = new URLSearchParams(window.location.search).get("kingdomId") || "3599";
const currentKingdom = sheetLinks[kingdomId];
document.getElementById("kingdom-title").textContent = `${currentKingdom.name} - 전쟁 통계`;

let allRows = [], headers = [], pageSize = 10, currentPage = 1;

function loadKVK(kvkNumber) {
  const url = currentKingdom[`kvk${kvkNumber}`];
  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const table = json.table;
      headers = table.cols.map(col => col.label);
      allRows = table.rows.map(row => row.c.map(cell => cell?.v ?? ""));
      currentPage = 1;
      renderTable();
    });
}

function renderTable() {
  const container = document.getElementById("data-table");
  const pagination = document.getElementById("pagination-controls");
  container.innerHTML = "";
  pagination.innerHTML = "";

  const searchText = document.getElementById("search").value.toLowerCase();
  const filteredRows = allRows.filter(row => row.some(cell => `${cell}`.toLowerCase().includes(searchText)));

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = filteredRows.slice(start, end);

  const table = document.createElement("table");
  table.className = "dkp-table";

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  pageRows.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  // 페이지네이션 렌더링
  const totalPages = Math.ceil(filteredRows.length / pageSize);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;
    btn.onclick = () => {
      currentPage = i;
      renderTable();
    };
    pagination.appendChild(btn);
  }
}

// 초기 페이지 설정
window.onload = () => {
  document.getElementById("page-size").addEventListener("change", (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
  });

  document.getElementById("search").addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  loadKVK(3); // 기본 탭: KVK3
};
