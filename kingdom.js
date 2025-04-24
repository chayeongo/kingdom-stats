// kingdom.js

const sheetLinks = {
  "3599": {
    name: "3599 베르디나 왕국",
    kvk1: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK1",
    kvk2: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK2",
    kvk3: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK3"
  }
};

const kingdomId = new URLSearchParams(window.location.search).get("kingdomId") || "3599";
const currentKingdom = sheetLinks[kingdomId];

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
    if (!['Total KP (T4 + T5)', 'Death', 'T4-Kills', 'T5-Kills', '기여도 점수'].includes(header)) {
      const th = document.createElement("th");
      th.textContent = header;
      trHead.appendChild(th);
    }
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  pageRows.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach((cell, idx) => {
      if (!['Total KP (T4 + T5)', 'Death', 'T4-Kills', 'T5-Kills', '기여도 점수'].includes(headers[idx])) {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      }
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

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

function showContributionAnalysis() {
  const url = currentKingdom.kvk2;
  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const table = json.table;
      const rows = table.rows.map(row => row.c.map(cell => cell?.v ?? ""));
      const cols = table.cols.map(col => col.label);

      const nameIdx = cols.findIndex(c => c.toLowerCase().includes("name"));
      const uidIdx = cols.findIndex(c => c.toLowerCase().includes("uid"));
      const deathIdx = cols.findIndex(c => c === "Death");
      const totalKPIdx = cols.findIndex(c => c === "Total KP (T4 + T5)");
      const t4Idx = cols.findIndex(c => c === "T4-Kills");
      const t5Idx = cols.findIndex(c => c === "T5-Kills");

      const maxDeath = Math.max(...rows.map(r => parseInt(r[deathIdx] || 0)));
      const maxKP = Math.max(...rows.map(r => parseInt(r[totalKPIdx] || 0)));

      const contributions = rows.map(row => {
        const uid = row[uidIdx] || "-";
        const name = row[nameIdx] || "-";
        const death = parseInt(row[deathIdx] || 0);
        const kp = parseInt(row[totalKPIdx] || 0);
        const t4 = parseInt(row[t4Idx] || 0);
        const t5 = parseInt(row[t5Idx] || 0);
        const score = (
          (death / (maxDeath || 1)) * 50 +
          (kp / (maxKP || 1)) * 30 +
          (t5 / ((t4 + t5) || 1)) * 20
        ).toFixed(1);
        return { uid, name, score: parseFloat(score) };
      }).sort((a, b) => b.score - a.score);

      renderContributionTable(contributions);
    });
}

function renderContributionTable(data) {
  document.getElementById("contribution-section").style.display = "block";
  const tableContainer = document.getElementById("contribution-table");
  const pagination = document.getElementById("contribution-pagination");
  const searchInput = document.getElementById("contribution-search");

  let filtered = [...data];
  let currentPage = 1;
  const pageSize = 10;

  searchInput.addEventListener("input", () => {
    const search = searchInput.value.toLowerCase();
    filtered = data.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.uid.toLowerCase().includes(search)
    );
    currentPage = 1;
    renderPage();
  });

  function renderPage() {
    tableContainer.innerHTML = "";
    pagination.innerHTML = "";

    const start = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);

    const table = document.createElement("table");
    table.className = "dkp-table";

    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>UID</th><th>닉네임</th><th>기여도 점수</th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    pageData.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${d.uid}</td><td>${d.name}</td><td>${d.score}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    const totalPages = Math.ceil(filtered.length / pageSize);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.disabled = true;
      btn.onclick = () => {
        currentPage = i;
        renderPage();
      };
      pagination.appendChild(btn);
    }
  }

  renderPage();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("kingdom-title").textContent = `${currentKingdom.name} - 전쟁 통계`;
  document.getElementById("page-size").addEventListener("change", (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
  });
  document.getElementById("search").addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });
  loadKVK(3);
});
