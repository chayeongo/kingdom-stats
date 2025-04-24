const sheetLinks = {
  "3599": {
    name: "3599 베르디나 왕국",
    kvk1: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK1",
    kvk2: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK2",
    kvk3: "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK3"
  }
};
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

function loadKVK(kvkNumber) {
  const url = currentKingdom[`kvk${kvkNumber}`];
  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const table = json.table;
      const headers = table.cols.map(col => col.label);
      const rows = table.rows.map(row => row.c.map(cell => cell?.v ?? ""));
      renderTable(headers, rows);
    });
}

function renderTable(headers, rows) {
  const container = document.getElementById("data-table");
  container.innerHTML = "";

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
  rows.forEach(row => {
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
}

// 기본 탭 자동 로딩
loadKVK(1);
