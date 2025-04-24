const sheetLinks = {
  "3599": "https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK2"
};

const kingdomId = new URLSearchParams(window.location.search).get("kingdomId") || "3599";
const sheetURL = sheetLinks[kingdomId];

let allData = [], filteredData = [], currentPage = 1;
const pageSize = 10;
let gradeFilter = "ALL";

function calculateGrade(score) {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

function fetchData() {
  fetch(sheetURL)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const table = json.table;
      const cols = table.cols.map(col => col.label);
      const rows = table.rows.map(row => row.c.map(cell => cell?.v ?? ""));

      const uidIdx = cols.findIndex(c => c.toLowerCase().includes("uid"));
      const nameIdx = cols.findIndex(c => c.toLowerCase().includes("name"));
      const deathIdx = cols.findIndex(c => c === "Death");
      const kpIdx = cols.findIndex(c => c === "Total KP (T4 + T5)");
      const t4Idx = cols.findIndex(c => c === "T4-Kills");
      const t5Idx = cols.findIndex(c => c === "T5-Kills");

      allData = rows.map(r => {
        const uid = r[uidIdx];
        const name = r[nameIdx];
        const death = parseInt(r[deathIdx] || 0);
        const kp = parseInt(r[kpIdx] || 0);
        const t4 = parseInt(r[t4Idx] || 0);
        const t5 = parseInt(r[t5Idx] || 0);

        const score = Math.min(
          (t4 * 0.0000006) +
          (t5 * 0.0000026) +
          (death * 0.0000095),
          100
        ).toFixed(1);

        const grade = calculateGrade(score);
        return { uid, name, score: parseFloat(score), grade };
      }).sort((a, b) => b.score - a.score);

      filteredData = [...allData];
      renderPage();
    });
}

function renderPage() {
  const tableContainer = document.getElementById("contribution-table");
  const pagination = document.getElementById("pagination-controls");

  const start = (currentPage - 1) * pageSize;
  const visible = filteredData.filter(d => gradeFilter === "ALL" || d.grade === gradeFilter);
  const pageData = visible.slice(start, start + pageSize);

  tableContainer.innerHTML = "";
  const table = document.createElement("table");
  table.className = "dkp-table";
  table.innerHTML = `
    <thead>
      <tr><th>UID</th><th>닉네임</th><th>기여도 점수</th><th>등급</th></tr>
    </thead>
    <tbody>
      ${pageData.map(d => `<tr class="grade-${d.grade.toLowerCase()}"><td>${d.uid}</td><td>${d.name}</td><td>${d.score}</td><td>${d.grade}</td></tr>`).join("")}
    </tbody>
  `;
  tableContainer.appendChild(table);

  pagination.innerHTML = "";
  const totalPages = Math.ceil(visible.length / pageSize);
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "◀ Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    renderPage();
  };
  pagination.appendChild(prevBtn);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ▶";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    renderPage();
  };
  pagination.appendChild(nextBtn);
}

function renderFilters() {
  const filterContainer = document.getElementById("grade-filters");
  ["ALL", "S", "A", "B", "C", "D"].forEach(grade => {
    const btn = document.createElement("button");
    btn.textContent = grade === "ALL" ? "전체 보기" : `${grade} 등급만`;
    btn.onclick = () => {
      gradeFilter = grade;
      currentPage = 1;
      renderPage();
    };
    filterContainer.appendChild(btn);
  });
}

document.getElementById("search").addEventListener("input", e => {
  const val = e.target.value.toLowerCase();
  filteredData = allData.filter(d =>
    d.uid.toLowerCase().includes(val) ||
    d.name.toLowerCase().includes(val)
  );
  currentPage = 1;
  renderPage();
});

window.onload = () => {
  renderFilters();
  fetchData();
};
