// kingdom.js
const sheetId = "1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso";
const table = document.getElementById("kvkTable");
const pagination = document.getElementById("pagination");
const searchBox = document.getElementById("searchBox");
const pageSizeSelector = document.getElementById("pageSize");

let originalData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
let currentSheet = "KVK3";

function buildUrl(sheet) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheet}`;
}

async function loadKVK(sheet) {
  currentSheet = sheet;
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelector(`.tab[onclick*='${sheet}']`).classList.add("active");

  const response = await fetch(buildUrl(sheet));
  const text = await response.text();
  const json = JSON.parse(text.substring(47).slice(0, -2));

  originalData = json.table.rows.map(row => {
    return {
      uid: row.c[0]?.v || "",
      name: row.c[1]?.v || "",
      total_kp: row.c[2]?.v || 0,
      death: row.c[3]?.v || 0,
      t5: row.c[4]?.v || 0
    };
  });

  handleSearch();
}

function handleSearch() {
  const keyword = searchBox.value.toLowerCase();
  filteredData = originalData.filter(row =>
    row.name.toLowerCase().includes(keyword) || row.uid.toString().includes(keyword)
  );
  currentPage = 1;
  renderTable();
}

function handlePageSizeChange() {
  pageSize = parseInt(pageSizeSelector.value);
  currentPage = 1;
  renderTable();
}

function renderTable() {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filteredData.slice(start, end);

  let html = "<table><thead><tr><th>UID</th><th>Name</th><th>Total KP</th><th>Deaths</th><th>T5 Kills</th></tr></thead><tbody>";
  pageData.forEach(row => {
    html += `<tr>
      <td>${row.uid}</td>
      <td>${row.name}</td>
      <td>${Number(row.total_kp).toLocaleString()}</td>
      <td>${Number(row.death).toLocaleString()}</td>
      <td>${Number(row.t5).toLocaleString()}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  table.innerHTML = html;

  renderPagination();
}

function renderPagination() {
  const pageCount = Math.ceil(filteredData.length / pageSize);
  let buttons = "";
  for (let i = 1; i <= pageCount; i++) {
    buttons += `<button onclick="goToPage(${i})" ${i === currentPage ? "style='font-weight:bold'" : ""}>${i}</button>`;
  }
  pagination.innerHTML = buttons;
}

function goToPage(page) {
  currentPage = page;
  renderTable();
}

// Load default
loadKVK(currentSheet);
