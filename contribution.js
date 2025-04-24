let data = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;

const gradeColors = {
  S: "grade-S",
  A: "grade-A",
  B: "grade-B",
  C: "grade-C",
  D: "grade-D"
};

function calculateGrade(score) {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

function renderTable() {
  const table = document.getElementById("contributionTable");
  if (!table) return;

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const current = filteredData.slice(start, end);

  table.innerHTML = current.map(d => `
    <tr class="${gradeColors[d.grade]}">
      <td>${d.uid}</td>
      <td>${d.name}</td>
      <td>${d.score.toFixed(1)}</td>
      <td>${d.grade}</td>
    </tr>
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
      renderTable();
    };
    if (i === currentPage) btn.style.fontWeight = "bold";
    container.appendChild(btn);
  }
}

function renderFilters() {
  const grades = ["S", "A", "B", "C", "D"];
  const container = document.getElementById("grade-filters");
  container.innerHTML = "";

  grades.forEach(grade => {
    const btn = document.createElement("button");
    btn.textContent = grade;
    btn.onclick = () => {
      filteredData = data.filter(d => d.grade === grade);
      currentPage = 1;
      renderTable();
      renderPagination();

      document.querySelectorAll("#grade-filters button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
    container.appendChild(btn);
  });
}

function renderPage() {
  renderTable();
  renderPagination();
  renderFilters();
}

function handleSearch() {
  const query = document.getElementById("search").value.toLowerCase();
  filteredData = data.filter(d =>
    d.uid.toString().includes(query) || d.name.toLowerCase().includes(query)
  );
  currentPage = 1;
  renderPage();
}

function handlePageSizeChange(val) {
  pageSize = parseInt(val);
  currentPage = 1;
  renderPage();
}

// ✅ Google Sheets 불러오기 (KVK2만 사용)
async function fetchData() {
  const kingdomId = new URLSearchParams(window.location.search).get("kingdomId");
  const url = `https://docs.google.com/spreadsheets/d/1G2RwOq32kSubrYRtO5xt6UsaIXQBdfjKsz9r386PFso/gviz/tq?tqx=out:json&sheet=KVK2`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    data = rows.map(r => {
      const uid = r.c[0]?.v || "";
      const name = r.c[1]?.v || "";
      const score = parseFloat(r.c[2]?.v || 0);
      const grade = calculateGrade(score);
      return { uid, name, score, grade };
    });

    filteredData = [...data];
    renderPage();
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
}

// ✅ 페이지 로딩 완료 후 실행
window.addEventListener("DOMContentLoaded", () => {
  fetchData();
  document.getElementById("search").addEventListener("input", handleSearch);
});
