function renderDashboard() {
  const droppedIds = new Set(data.enrollments.filter(e => e.enrollmentStatus === "Dropped").map(e => e.student));
  const enrolledCount = data.students.filter(s => !droppedIds.has(s.id) && s.section !== "Dropped" && s.section !== "Pending Enrollment").length;

  $("totalStudents").textContent = data.students.length;
  $("enrolledStudents").textContent = enrolledCount;
  $("graduatingStudents").textContent = data.students.filter(s => s.grade === "Grade 12").length;
  $("failedCount").textContent = Object.values(data.grades).flat().filter(g => statusOf(calc(g)) === "Failed").length;
  $("droppedCount").textContent = droppedIds.size;

  $("recentStudents").innerHTML = data.students.slice(0, 6).map(s =>
    `<p><b>${esc(formatNameId(s))}</b><br><small>${esc(s.grade)} • ${esc(s.section)}</small></p>`
  ).join("");
}

function populateSelects() {
  const el = $("eStudent");
  if (el) {
    const old = el.value;
    el.innerHTML = data.students.map(s => `<option value="${esc(s.id)}">${esc(formatNameId(s))}</option>`).join("");
    if (old && data.students.some(s => s.id === old)) el.value = old;
  }
  if ($("eDate") && !$("eDate").value) {
    $("eDate").value = new Date().toISOString().slice(0, 10);
  }
  syncEnrollmentStudentData();

  const filterGrade = $("studentGrade");
  if (filterGrade) {
    filterGrade.innerHTML = `<option value="">All Grade Levels</option>` + gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
  }
  const fGrade = $("fGrade");
  if (fGrade) fGrade.innerHTML = gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
}

function renderAll() {
  populateGradeFilters();
  populateSelects();
  renderDashboard();
  renderStudents();
  filterGradeStudents();
  renderEnrollments();
  renderPerformance();
  populateStatusSubjects();
  renderStatus();
}

function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

document.addEventListener("DOMContentLoaded", () => {
  $("gradeStudent")?.addEventListener("change", renderGrades);
  $("studentSearch")?.addEventListener("input", renderStudents);
  $("studentGrade")?.addEventListener("change", renderStudents);
  $("eStudent")?.addEventListener("change", syncEnrollmentStudentData);
  $("eStrand")?.addEventListener("change", updateEnrollmentFields);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeDrawer();
      closeStudentModal();
      closeReportModal();
    }
  });

  ["username", "password"].forEach(id => {
    $(id)?.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
  });

if ($("reportList")) {
    $("reportList").innerHTML = [
      "Student Academic Report", "Enrollment Report", "Grade Report",
      "Subject Status Report", "Student Masterlist"
    ].map(n => `
      <div class="report">
        <span><b>${esc(n)}</b></span>
        <div class="report-actions">
          <button class="secondary table-btn" onclick="viewReport('${esc(n)}')"><i class="fa-solid fa-eye fa-fw"></i> View</button>
          <button class="secondary table-btn" onclick="printReport('${esc(n)}')"><i class="fa-solid fa-print fa-fw"></i> Print</button>
          <button class="primary table-btn" onclick="downloadReportPDF('${esc(n)}')"><i class="fa-solid fa-file-pdf fa-fw"></i> Download (PDF)</button>
        </div>
      </div>`
    ).join("");
  }

  const idInp = $("fId");
  if (idInp) {
    idInp.addEventListener("input", e => {
      let digits = e.target.value.replace(/\D/g, "").slice(0, 7);
      e.target.value = digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
    });
  }

  renderAll();
});