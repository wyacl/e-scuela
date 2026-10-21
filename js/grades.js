function populateGradeFilters() {
  const y = $("gradeFilterYear");
  if (y) {
    y.innerHTML = `<option value="">All Year Levels</option>` + gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
  }
}

function handleGradeYearChange() {
  const year = $("gradeFilterYear")?.value || "";
  const isJHS = year !== "" && year !== "Grade 11" && year !== "Grade 12";
  const strandEl = $("gradeFilterStrand");
  if (strandEl) strandEl.style.display = isJHS ? "none" : "";
  filterGradeStudents();
}

function handleGradeStrandChange() { 
  filterGradeStudents(); 
}

function filterGradeStudents() {
  const y = $("gradeFilterYear")?.value || "";
  const strand = $("gradeFilterStrand")?.value || "";
  const sec = $("gradeFilterSection")?.value || "";
  const el = $("gradeStudent");
  if (!el) return;

  const currentSelected = el.value;

  const filtered = data.students.filter(s => {
    if (y && s.grade !== y) return false;
    if (sec && s.section !== sec) return false;
    if (strand) {
      const enr = data.enrollments.find(e => e.student === s.id);
      if (enr && enr.strand !== strand) return false;
    }
    return true;
  });

  if (filtered.length) {
    el.disabled = false;
    el.innerHTML = filtered.map(s => `<option value="${esc(s.id)}">${esc(formatNameId(s))}</option>`).join("");
    // Preserves the currently edited student instead of snapping back to index 0
    if (currentSelected && filtered.some(s => s.id === currentSelected)) {
      el.value = currentSelected;
    } else {
      el.value = filtered[0].id;
    }
    renderGrades();
  } else {
    el.disabled = true;
    el.innerHTML = `<option value="">No matching students</option>`;
    $("gradeTable").innerHTML = `<tr><td colspan="7">No students found for this filter.</td></tr>`;
  }
}

function renderGrades() {
  const id = $("gradeStudent")?.value;
  if (!id) return;
  const arr = data.grades[id] || [];
  $("gradeTable").innerHTML = arr.map((g, i) => {
    const finalScore = calc(g);
    return `<tr>
      <td><b>${esc(g[0])}</b></td>
      ${[1, 2, 3, 4].map(j => `<td><input type="number" min="0" max="100" value="${g[j] ?? ''}" data-idx="${i}" data-q="${j}" class="grade-input"></td>`).join("")}
      <td><b>${finalScore}</b></td>
      <td>${badge(statusOf(finalScore))}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="7">No subjects enrolled.</td></tr>`;
}

function saveGrades() {
  const id = $("gradeStudent")?.value;
  if (!id) return;
  const arr = data.grades[id] || [];
  document.querySelectorAll("[data-idx]").forEach(inp => {
    const i = Number(inp.dataset.idx);
    const q = Number(inp.dataset.q);
    const v = inp.value.trim();
    if (arr[i]) arr[i][q] = v === "" ? "" : Math.min(100, Math.max(0, Number(v) || 0));
  });
  data.grades[id] = arr;
  persist();
  renderAll();
  toast("Grades successfully saved.");
}