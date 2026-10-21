function syncEnrollmentStudentData() {
  const sId = $("eStudent")?.value;
  const s = data.students.find(x => x.id === sId);
  if (!s) return;

  if ($("eGrade")) $("eGrade").value = s.grade || "Grade 1";
  if ($("eStatus")) $("eStatus").value = s.status || "Regular";

  const existing = data.enrollments.find(e => e.student === sId);
  if ($("eEnrollmentStatus")) $("eEnrollmentStatus").value = existing?.enrollmentStatus || "Enrolled";

  // Sync strand FIRST so updateEnrollmentFields builds the correct section choices
  if ($("eStrand") && existing?.strand && existing.strand !== "N/A") {
    $("eStrand").value = existing.strand;
  }

  updateEnrollmentFields();
  if (existing?.section && $("eSection")) $("eSection").value = existing.section;

  renderEnrollmentSubjects(sId);
}

function updateEnrollmentFields() {
  const sId = $("eStudent")?.value;
  const s = data.students.find(x => x.id === sId);
  const grade = s ? s.grade : ($("eGrade")?.value || "");
  const isSHS = grade === "Grade 11" || grade === "Grade 12";

  const strandField = $("eStrand")?.closest(".field");
  if (strandField) strandField.style.display = isSHS ? "" : "none";

  const sectionSelect = $("eSection");
  if (!sectionSelect) return;

  if (isSHS) {
    const strand = $("eStrand")?.value || "STEM";
    const sections = strand === "STEM" ? ["STEM-A", "STEM-B"] : strand === "ABM" ? ["ABM-A", "ABM-B"] : ["HUMSS-A", "HUMSS-B"];
    sectionSelect.innerHTML = sections.map(sec => `<option value="${sec}">${sec}</option>`).join("");
  } else {
    sectionSelect.innerHTML = `<option value="Section A">Section A</option><option value="Section B">Section B</option><option value="Section C">Section C</option>`;
  }
}

function renderEnrollmentSubjects(studentId) {
  const container = $("enrollmentSubjects");
  if (!container) return;
  const currentGrades = data.grades[studentId] || [];
  const existingNames = currentGrades.map(g => g[0]);

  container.innerHTML = availableSubjects.map(sub => {
    const isChecked = existingNames.length > 0 ? existingNames.includes(sub) : true;
    return `
      <label class="subject-checkbox-label">
        <input type="checkbox" name="enrollSubject" value="${esc(sub)}" ${isChecked ? "checked" : ""}>
        <span>${esc(sub)}</span>
      </label>
    `;
  }).join("");
}

function saveEnrollment() {
  const id = val("eStudent");
  const s = data.students.find(x => x.id === id);
  if (!s) return toast("Select a student.");

  const section = val("eSection");
  const date = val("eDate") || new Date().toISOString().slice(0, 10);
  const enrollmentStatus = val("eEnrollmentStatus") || "Enrolled";

  const checked = Array.from(document.querySelectorAll("input[name='enrollSubject']:checked")).map(c => c.value);
  if (!checked.length && enrollmentStatus === "Enrolled") return toast("Please select at least one subject.");

  const currentGrades = data.grades[id] || [];
  const gradeMap = new Map(currentGrades.map(g => [g[0], g]));
  data.grades[id] = checked.map(sub => gradeMap.has(sub) ? gradeMap.get(sub) : [sub, "", "", "", ""]);

  const rec = {
    student: id,
    schoolYear: val("eSY") || "2026-2027",
    grade: s.grade,
    strand: (s.grade === "Grade 11" || s.grade === "Grade 12") ? (val("eStrand") || "STEM") : "N/A",
    section,
    date,
    status: s.status,
    enrollmentStatus
  };

  const idx = data.enrollments.findIndex(e => e.student === id);
  if (idx !== -1) data.enrollments[idx] = rec; else data.enrollments.push(rec);

  s.section = enrollmentStatus === "Dropped" ? "Dropped" : section;
  persist();
  renderAll();
  toast(`Enrollment updated for ${formatNameId(s)}`);
}

function renderEnrollments() {
  $("enrollmentTable").innerHTML = data.enrollments.map(e => {
    const s = data.students.find(x => x.id === e.student);
    return `<tr>
      <td><b>${esc(s ? formatNameId(s) : e.student)}</b></td>
      <td>${esc(e.schoolYear)}</td>
      <td>${esc(e.grade)}</td>
      <td>${esc(e.strand)}</td>
      <td>${esc(e.section)}</td>
      <td>${esc(e.date || "2026-06-15")}</td>
      <td><span class="badge ${esc(e.status.toLowerCase())}">${esc(e.status)}</span></td>
      <td><span class="badge ${esc(e.enrollmentStatus.toLowerCase())}">${esc(e.enrollmentStatus)}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="8">No enrollment records found.</td></tr>`;
}