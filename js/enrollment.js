function syncEnrollmentStudentData() {
  const sId = $("eStudent")?.value;
  const s = data.students.find(x => x.id === sId);
  if (!s) return;

  const gradeSelect = $("eGrade");
  if (gradeSelect) {
    const currentGrade = s.grade || "Grade 1";
    const startIdx = gradeLevels.indexOf(currentGrade);
    const allowedGrades = startIdx !== -1 ? gradeLevels.slice(startIdx) : gradeLevels;

    gradeSelect.innerHTML = allowedGrades
      .map(g => `<option value="${g}">${g}</option>`)
      .join("");
    gradeSelect.value = allowedGrades.includes(currentGrade) ? currentGrade : allowedGrades[0];
  }

  const existing = data.enrollments.find(e => e.student === sId);
  if ($("eEnrollmentStatus")) {
    $("eEnrollmentStatus").value = existing?.enrollmentStatus || "Enrolled";
  }

  // Lock picker strictly to today's date (disables both past and future dates)
  const today = new Date().toISOString().slice(0, 10);
  const dateInput = $("eDate");
  if (dateInput) {
    dateInput.value = today;
    dateInput.min = today;
    dateInput.max = today;
  }

  if ($("eStrand")) {
    if (existing?.strand && existing.strand !== "N/A") {
      $("eStrand").value = existing.strand;
    } else if (s.section && s.section.includes("-")) {
      const secStrand = s.section.split("-")[0];
      if (shsStrands.includes(secStrand)) $("eStrand").value = secStrand;
    }
  }

  if ($("eSemester")) {
    $("eSemester").value = (existing?.semester && existing.semester !== "N/A")
      ? existing.semester
      : "1st Sem";
  }

  updateEnrollmentFields();
  if (existing?.section && $("eSection") && Array.from($("eSection").options).some(o => o.value === existing.section)) {
    $("eSection").value = existing.section;
  }
}

function updateEnrollmentFields() {
  const sId = $("eStudent")?.value;
  const s = data.students.find(x => x.id === sId);
  const grade = $("eGrade")?.value || (s ? s.grade : "Grade 1");
  const isSHS = grade === "Grade 11" || grade === "Grade 12";

  const strandField = $("eStrand")?.closest(".field");
  if (strandField) strandField.style.display = isSHS ? "" : "none";

  const semField = $("eSemesterField");
  if (semField) semField.style.display = isSHS ? "" : "none";

  const sectionSelect = $("eSection");
  if (sectionSelect) {
    const prevSec = sectionSelect.value;
    if (isSHS) {
      const strand = $("eStrand")?.value || "ABM";
      const sections = [`${strand}-A`, `${strand}-B`, `${strand}-C`];
      sectionSelect.innerHTML = sections.map(sec => `<option value="${sec}">${sec}</option>`).join("");
    } else {
      sectionSelect.innerHTML = [
        `<option value="Section A">Section A</option>`,
        `<option value="Section B">Section B</option>`,
        `<option value="Section C">Section C</option>`
      ].join("");
    }
    if (prevSec && Array.from(sectionSelect.options).some(o => o.value === prevSec)) {
      sectionSelect.value = prevSec;
    }
  }

  if (sId) renderEnrollmentSubjects(sId);
}

function renderEnrollmentSubjects(studentId) {
  const container = $("enrollmentSubjects");
  if (!container) return;

  const s = data.students.find(x => x.id === studentId);
  const grade = $("eGrade")?.value || s?.grade || "Grade 1";
  const isSHS = grade === "Grade 11" || grade === "Grade 12";
  const strand = isSHS ? ($("eStrand")?.value || "ABM") : "";
  const semester = isSHS ? ($("eSemester")?.value || "1st Sem") : "";

  const assignedSubjects = getSubjectsForGrade(grade, strand, semester);
  const currentGrades = data.grades[studentId] || [];
  const existingNames = currentGrades.map(g => g[0]);

  if (!assignedSubjects.length) {
    const detailText = isSHS ? ` (${esc(strand)} - ${esc(semester)})` : "";
    container.innerHTML = `<span style="color:var(--text-muted);font-size:13px;">No subjects assigned to ${esc(grade)}${detailText} yet. Assign subjects in the Subjects menu.</span>`;
    return;
  }

  const sameGradeLevel = s && s.grade === grade;
  const hasOverlap = sameGradeLevel && assignedSubjects.some(sub => existingNames.includes(sub));

  container.innerHTML = assignedSubjects.map(sub => {
    const isChecked = hasOverlap
      ? existingNames.includes(sub)
      : true;
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

  const grade = val("eGrade") || s.grade || "Grade 1";
  const isSHS = grade === "Grade 11" || grade === "Grade 12";
  const strand = isSHS ? (val("eStrand") || "ABM") : "N/A";
  const semester = isSHS ? (val("eSemester") || "1st Sem") : "N/A";
  const section = val("eSection");
  const today = new Date().toISOString().slice(0, 10);
  const date = today;

  if ($("eDate")) {
    $("eDate").value = today;
    $("eDate").min = today;
    $("eDate").max = today;
  }

  const enrollmentStatus = val("eEnrollmentStatus") || "Enrolled";

  const checked = Array.from(document.querySelectorAll("input[name='enrollSubject']:checked")).map(c => c.value);
  if (!checked.length && enrollmentStatus === "Enrolled") {
    return toast("Please select at least one subject.");
  }

  const rec = {
    student: id,
    schoolYear: val("eSY") || "2026-2027",
    grade,
    strand,
    semester,
    section,
    date,
    status: enrollmentStatus,
    enrollmentStatus
  };

  // Preserve grades from the other semester if staying in the same grade level;
  // otherwise initialize fresh subjects for the promoted grade level (e.g. Grade 7 -> Grade 8)
  const isSameGrade = s.grade === grade;
  const currentGrades = isSameGrade ? (data.grades[id] || []) : [];
  const gradeMap = new Map(currentGrades.map(g => [g[0], g]));
  const activeSemPool = new Set(getSubjectsForGrade(grade, strand, semester));
  const preservedOtherSem = (isSameGrade && isSHS)
    ? currentGrades.filter(g => !activeSemPool.has(g[0]))
    : [];

  const updatedSemGrades = checked.map(sub =>
    gradeMap.has(sub) ? gradeMap.get(sub) : [sub, "", "", "", ""]
  );

  data.grades[id] = [...preservedOtherSem, ...updatedSemGrades];

  const idx = data.enrollments.findIndex(e => e.student === id);
  if (idx !== -1) {
    data.enrollments[idx] = rec;
  } else {
    data.enrollments.push(rec);
  }

  s.grade = grade;
  s.section = enrollmentStatus === "Dropped" ? "Dropped" : (enrollmentStatus === "Pending" ? "Pending Enrollment" : section);
  s.status = enrollmentStatus;

  persist();
  renderAll();
  toast(`Enrollment updated for ${formatNameId(s)} (${grade})`);
}

function renderEnrollments() {
  $("enrollmentTable").innerHTML = data.enrollments.map(e => {
    const s = data.students.find(x => x.id === e.student);
    const statusVal = e.enrollmentStatus || "Pending";
    const statusClass = statusVal.toLowerCase();
    const isSHS = e.grade === "Grade 11" || e.grade === "Grade 12";
    const semVal = isSHS ? (e.semester && e.semester !== "N/A" ? e.semester : "1st Sem") : "N/A";
    const semDisplay = isSHS
      ? `<span class="badge ${semVal === "2nd Sem" ? "silver" : "enrolled"}">${esc(semVal)}</span>`
      : `<span style="color:var(--text-muted);font-size:12px;">N/A</span>`;

    return `<tr>
      <td><b>${esc(s ? formatNameId(s) : e.student)}</b></td>
      <td>${esc(e.schoolYear)}</td>
      <td>${esc(e.grade)}</td>
      <td>${esc(e.strand)}</td>
      <td>${semDisplay}</td>
      <td>${esc(e.section)}</td>
      <td>${esc(e.date || "2026-06-15")}</td>
      <td><span class="badge ${esc(statusClass)}">${esc(statusVal)}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="8">No enrollment records found.</td></tr>`;
}