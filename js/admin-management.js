// ==========================================================
// ADMIN MANAGEMENT: FACULTY MEMBERS, SUBJECTS & SCHEDULES
// ==========================================================

// --------------------------------------------------
// 0. ADMINISTRATOR REMOVE CONFIRMATION MODAL
// --------------------------------------------------
let pendingAdminDelete = null;

function openAdminDeleteModal({ type, id, title, subtitle, messageHTML }) {
  pendingAdminDelete = { type, id };
  if ($("adminDeleteTitle")) $("adminDeleteTitle").textContent = title;
  if ($("adminDeleteSub")) $("adminDeleteSub").textContent = subtitle;
  if ($("adminDeleteMessage")) $("adminDeleteMessage").innerHTML = messageHTML;
  $("adminDeleteModal")?.classList.remove("hidden");
}

function closeAdminDeleteModal(e) {
  if (!e || e.target === $("adminDeleteModal") || e.type === "click") {
    $("adminDeleteModal")?.classList.add("hidden");
    pendingAdminDelete = null;
  }
}

function confirmAdminDelete() {
  if (!pendingAdminDelete) return;
  const { type, id } = pendingAdminDelete;
  closeAdminDeleteModal();

  if (type === "faculty") {
    executeRemoveAdminFaculty(id);
  } else if (type === "subject") {
    executeRemoveAdminSubject(id);
  } else if (type === "schedule") {
    executeRemoveAdminSchedule(id);
  }
}

// --------------------------------------------------
// 1. FACULTY MEMBER MANAGEMENT
// --------------------------------------------------
function renderFacultySubjectCheckboxes(selectedSubjects = []) {
  const container = $("facSubjectsCheckboxes");
  if (!container) return;

  const subjects = data.subjects || [];
  if (!subjects.length) {
    container.innerHTML = `<span style="color:var(--text-muted);font-size:13px;">No subjects available. Add subjects in the Subjects menu first.</span>`;
    return;
  }

  container.innerHTML = subjects.map(sub => {
    const checked = selectedSubjects.includes(sub.name) ? "checked" : "";
    return `
      <label class="subject-checkbox-label">
        <input type="checkbox" name="facAssignedSubject" value="${esc(sub.name)}" ${checked}>
        <span>${esc(sub.name)}</span>
      </label>
    `;
  }).join("");
}

function generateNextFacultyId() {
  const existing = (data.facultyList || []).map(f => f.id);
  let num = existing.length + 1;
  let candidate = `FAC-2026-${String(num).padStart(2, "0")}`;
  while (existing.includes(candidate)) {
    num++;
    candidate = `FAC-2026-${String(num).padStart(2, "0")}`;
  }
  return candidate;
}

function resetAdminFacultyForm() {
  if ($("facEditId")) $("facEditId").value = "";
  if ($("facFormTitle")) $("facFormTitle").textContent = "Add Faculty Member";
  if ($("facIdInput")) {
    $("facIdInput").value = generateNextFacultyId();
    $("facIdInput").readOnly = false;
  }
  if ($("facNameInput")) $("facNameInput").value = "";
  if ($("facUsernameInput")) $("facUsernameInput").value = "";
  if ($("facPasswordInput")) $("facPasswordInput").value = "";
  if ($("facDeptInput")) $("facDeptInput").value = "";
  if ($("facEmailInput")) $("facEmailInput").value = "";
  if ($("facContactInput")) $("facContactInput").value = "";
  if ($("facOfficeInput")) $("facOfficeInput").value = "";
  if ($("facStatusInput")) $("facStatusInput").value = "Active";
  $("facStatusField")?.classList.add("hidden");
  if ($("facSaveBtn")) $("facSaveBtn").innerHTML = `<i class="fa-solid fa-user-plus fa-fw"></i> Save Faculty Member`;
  $("facCancelEditBtn")?.classList.add("hidden");
  renderFacultySubjectCheckboxes([]);
}

function editAdminFaculty(facId) {
  const fac = (data.facultyList || []).find(f => f.id === facId);
  if (!fac) return;

  if ($("facEditId")) $("facEditId").value = fac.id;
  if ($("facFormTitle")) $("facFormTitle").textContent = `Edit Faculty Member — ${fac.name}`;
  if ($("facIdInput")) {
    $("facIdInput").value = fac.id;
    $("facIdInput").readOnly = true;
  }
  if ($("facNameInput")) $("facNameInput").value = fac.name;
  if ($("facUsernameInput")) $("facUsernameInput").value = fac.username || "";
  if ($("facPasswordInput")) $("facPasswordInput").value = fac.password || "";
  if ($("facDeptInput")) $("facDeptInput").value = fac.department || "";
  if ($("facEmailInput")) $("facEmailInput").value = fac.email || "";
  if ($("facContactInput")) $("facContactInput").value = fac.contact || "";
  if ($("facOfficeInput")) $("facOfficeInput").value = fac.office || "";
  if ($("facStatusInput")) $("facStatusInput").value = fac.status || "Active";
  $("facStatusField")?.classList.remove("hidden");
  if ($("facSaveBtn")) $("facSaveBtn").innerHTML = `<i class="fa-solid fa-floppy-disk fa-fw"></i> Update Faculty Member`;
  $("facCancelEditBtn")?.classList.remove("hidden");

  renderFacultySubjectCheckboxes(fac.subjects || []);
  $("facultyMembers")?.scrollIntoView({ behavior: "smooth" });
}

function saveAdminFaculty() {
  const editId = val("facEditId");
  const id = val("facIdInput") || generateNextFacultyId();
  const name = val("facNameInput");
  const username = val("facUsernameInput").toLowerCase();
  const password = val("facPasswordInput");
  const department = val("facDeptInput") || "Academic Faculty";
  const email = val("facEmailInput") || `${username || "faculty"}@salette.edu.ph`;
  const contact = val("facContactInput") || "N/A";
  const office = val("facOfficeInput") || "Faculty Room";
  const status = editId ? (val("facStatusInput") || "Active") : "Active";

  if (!name || !username || !password) {
    return toast("Full Name, Login Username, and Password are required.");
  }

  const assignedSubjects = Array.from(
    document.querySelectorAll("input[name='facAssignedSubject']:checked")
  ).map(cb => cb.value);

  if (!assignedSubjects.length) {
    return toast("Assign at least one subject to the faculty member.");
  }

  if (!Array.isArray(data.facultyList)) data.facultyList = [];

  if (editId) {
    const idx = data.facultyList.findIndex(f => f.id === editId);
    if (idx !== -1) {
      data.facultyList[idx] = {
        ...data.facultyList[idx],
        name,
        username,
        password,
        department,
        email,
        contact,
        office,
        status,
        subjects: assignedSubjects
      };
      (data.schedules || []).forEach(sch => {
        if (sch.facultyId === editId) sch.facultyName = name;
      });
    }
    toast(`Updated faculty member: ${name}`);
  } else {
    if (data.facultyList.some(f => f.id === id)) {
      return toast("Faculty Employee ID already exists.");
    }
    if (data.facultyList.some(f => f.username.toLowerCase() === username) || username === "admin") {
      return toast("Login username is already taken.");
    }

    data.facultyList.push({
      id,
      username,
      password,
      name,
      department,
      email,
      contact,
      office,
      status: "Active",
      subjects: assignedSubjects
    });
    toast(`Added faculty member: ${name}`);
  }

  persist();
  resetAdminFacultyForm();
  renderAll();
}

function promptRemoveAdminFaculty(facId) {
  const fac = (data.facultyList || []).find(f => f.id === facId);
  if (!fac) return;

  openAdminDeleteModal({
    type: "faculty",
    id: fac.id,
    title: "Remove Faculty Member",
    subtitle: `ID: ${fac.id} • ${fac.department || "Faculty"}`,
    messageHTML: `Are you sure you want to remove <strong>${esc(fac.name)}</strong>? This will permanently delete their faculty account and remove all assigned class schedules.`
  });
}

function executeRemoveAdminFaculty(facId) {
  const fac = (data.facultyList || []).find(f => f.id === facId);
  if (!fac) return;

  data.facultyList = data.facultyList.filter(f => f.id !== facId);
  data.schedules = (data.schedules || []).filter(sch => sch.facultyId !== facId);

  persist();
  if ($("facEditId")?.value === facId) resetAdminFacultyForm();
  renderAll();
  toast(`Removed faculty member: ${fac.name}`);
}

const removeAdminFaculty = promptRemoveAdminFaculty;

function renderAdminFaculty() {
  const list = data.facultyList || [];
  const activeCount = list.filter(f => (f.status || "Active") === "Active").length;
  if ($("adminFacultyCount")) $("adminFacultyCount").textContent = `${activeCount} Active`;

  if (!$("facEditId")?.value) {
    if ($("facIdInput") && !$("facIdInput").value) {
      $("facIdInput").value = generateNextFacultyId();
    }
    if ($("facSubjectsCheckboxes") && !$("facSubjectsCheckboxes").children.length) {
      renderFacultySubjectCheckboxes([]);
    }
  }

  const tbody = $("adminFacultyTable");
  if (!tbody) return;

  tbody.innerHTML = list.map(f => {
    const subjectPills = (f.subjects || []).map(sub =>
      `<span class="modal-pill" style="font-size:11px;padding:3px 8px;">${esc(sub)}</span>`
    ).join("") || `<span style="color:var(--text-muted);font-size:12px;">None</span>`;

    const status = f.status || "Active";
    const statusBadge = status === "Inactive"
      ? `<span class="badge dropped">Inactive</span>`
      : `<span class="badge regular">Active</span>`;

    return `
      <tr>
        <td><b>${esc(f.id)}</b></td>
        <td><b>${esc(f.name)}</b><br><small style="color:var(--text-muted);">${esc(f.email || "")}</small></td>
        <td><code>${esc(f.username)}</code></td>
        <td>${esc(f.department || "Faculty")}</td>
        <td><div class="modal-pills" style="margin-top:0;">${subjectPills}</div></td>
        <td>${statusBadge}</td>
        <td style="white-space:nowrap;">
          <button class="secondary table-btn" onclick="editAdminFaculty('${esc(f.id)}')"><i class="fa-solid fa-pen-to-square fa-fw"></i> Edit</button>
          <button class="secondary table-btn" style="color:var(--primary);margin-left:4px;" onclick="promptRemoveAdminFaculty('${esc(f.id)}')"><i class="fa-solid fa-trash fa-fw"></i> Remove</button>
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="7">No faculty members registered.</td></tr>`;
}

// --------------------------------------------------
// 2. SUBJECTS & GRADE-LEVEL / STRAND MANAGEMENT
// --------------------------------------------------
function renderSubjectGradeCheckboxes(selectedGrades = []) {
  const container = $("subGradeCheckboxes");
  if (!container) return;

  container.innerHTML = gradeLevels.map(g => {
    const checked = selectedGrades.includes(g) ? "checked" : "";
    return `
      <label class="subject-checkbox-label">
        <input type="checkbox" name="subGradeLevel" value="${esc(g)}" ${checked}>
        <span>${esc(g)}</span>
      </label>
    `;
  }).join("");
}

function renderSubjectStrandCheckboxes(selectedStrands = ["ABM", "HUMSS"]) {
  const container = $("subStrandCheckboxes");
  if (!container) return;

  container.innerHTML = shsStrands.map(st => {
    const checked = selectedStrands.includes(st) ? "checked" : "";
    return `
      <label class="subject-checkbox-label">
        <input type="checkbox" name="subStrandLevel" value="${esc(st)}" ${checked}>
        <span>${esc(st)}</span>
      </label>
    `;
  }).join("");
}

function selectSubjectGradePreset(preset) {
  const boxes = document.querySelectorAll("input[name='subGradeLevel']");
  boxes.forEach((cb, idx) => {
    const gradeNum = idx + 1;
    if (preset === "all") cb.checked = true;
    else if (preset === "none") cb.checked = false;
    else if (preset === "elem13") cb.checked = gradeNum >= 1 && gradeNum <= 3;
    else if (preset === "elem46") cb.checked = gradeNum >= 4 && gradeNum <= 6;
    else if (preset === "jhs") cb.checked = gradeNum >= 7 && gradeNum <= 10;
    else if (preset === "shs") cb.checked = gradeNum >= 11 && gradeNum <= 12;
  });
}

function resetAdminSubjectForm() {
  if ($("subEditId")) $("subEditId").value = "";
  if ($("subFormTitle")) $("subFormTitle").textContent = "Add Subject & Grade Assignment";
  if ($("subNameInput")) $("subNameInput").value = "";
  if ($("subSaveBtn")) $("subSaveBtn").innerHTML = `<i class="fa-solid fa-plus fa-fw"></i> Save Subject`;
  $("subCancelEditBtn")?.classList.add("hidden");
  renderSubjectGradeCheckboxes([]);
  renderSubjectStrandCheckboxes(["ABM", "HUMSS"]);
}

function editAdminSubject(subId) {
  const sub = (data.subjects || []).find(s => s.id === subId);
  if (!sub) return;

  if ($("subEditId")) $("subEditId").value = sub.id;
  if ($("subFormTitle")) $("subFormTitle").textContent = `Edit Subject Assignment — ${sub.name}`;
  if ($("subNameInput")) $("subNameInput").value = sub.name;
  if ($("subSaveBtn")) $("subSaveBtn").innerHTML = `<i class="fa-solid fa-floppy-disk fa-fw"></i> Update Subject`;
  $("subCancelEditBtn")?.classList.remove("hidden");

  renderSubjectGradeCheckboxes(sub.gradeLevels || []);
  const activeStrands = Array.isArray(sub.strands) && sub.strands.length ? sub.strands : ["ABM", "HUMSS"];
  renderSubjectStrandCheckboxes(activeStrands);
  $("adminSubjects")?.scrollIntoView({ behavior: "smooth" });
}

function saveAdminSubject() {
  const editId = val("subEditId");
  const name = val("subNameInput");
  if (!name) return toast("Subject name is required.");

  const assignedGrades = Array.from(
    document.querySelectorAll("input[name='subGradeLevel']:checked")
  ).map(cb => cb.value);

  if (!assignedGrades.length) {
    return toast("Select at least one grade level for this subject.");
  }

  const hasSHS = assignedGrades.includes("Grade 11") || assignedGrades.includes("Grade 12");
  const checkedStrands = Array.from(
    document.querySelectorAll("input[name='subStrandLevel']:checked")
  ).map(cb => cb.value);

  if (hasSHS && !checkedStrands.length) {
    return toast("Select at least one strand (ABM or HUMSS) for Grade 11 / 12.");
  }

  const assignedStrands = hasSHS ? checkedStrands : [];

  if (!Array.isArray(data.subjects)) data.subjects = [];

  if (editId) {
    const idx = data.subjects.findIndex(s => s.id === editId);
    if (idx !== -1) {
      const oldName = data.subjects[idx].name;
      data.subjects[idx] = {
        ...data.subjects[idx],
        name,
        gradeLevels: assignedGrades,
        strands: assignedStrands
      };
      if (oldName !== name) {
        (data.facultyList || []).forEach(f => {
          f.subjects = (f.subjects || []).map(s => s === oldName ? name : s);
        });
        (data.schedules || []).forEach(sch => {
          if (sch.subject === oldName) sch.subject = name;
        });
      }
    }
    toast(`Updated subject: ${name}`);
  } else {
    const existing = data.subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.gradeLevels = Array.from(new Set([...(existing.gradeLevels || []), ...assignedGrades]))
        .sort((a, b) => gradeLevels.indexOf(a) - gradeLevels.indexOf(b));
      existing.strands = Array.from(new Set([...(existing.strands || []), ...assignedStrands]));
      toast(`Updated assignments for ${existing.name}`);
    } else {
      data.subjects.push({
        id: `SUB-${Date.now().toString().slice(-4)}`,
        name,
        gradeLevels: assignedGrades,
        strands: assignedStrands
      });
      toast(`Added subject: ${name}`);
    }
  }

  persist();
  resetAdminSubjectForm();
  renderAll();
}

function promptRemoveAdminSubject(subId) {
  const sub = (data.subjects || []).find(s => s.id === subId);
  if (!sub) return;

  openAdminDeleteModal({
    type: "subject",
    id: sub.id,
    title: "Remove Subject",
    subtitle: `ID: ${sub.id}`,
    messageHTML: `Are you sure you want to remove <strong>${esc(sub.name)}</strong>? This will remove the subject from the curriculum and unassign it from all faculty members.`
  });
}

function executeRemoveAdminSubject(subId) {
  const sub = (data.subjects || []).find(s => s.id === subId);
  if (!sub) return;

  data.subjects = data.subjects.filter(s => s.id !== subId);
  (data.facultyList || []).forEach(f => {
    f.subjects = (f.subjects || []).filter(sName => sName !== sub.name);
  });

  persist();
  if ($("subEditId")?.value === subId) resetAdminSubjectForm();
  renderAll();
  toast(`Removed subject: ${sub.name}`);
}

const removeAdminSubject = promptRemoveAdminSubject;

function renderAdminSubjects() {
  const list = data.subjects || [];
  if ($("adminSubjectsCount")) $("adminSubjectsCount").textContent = `${list.length} Subjects`;

  if (!$("subEditId")?.value) {
    if ($("subGradeCheckboxes") && !$("subGradeCheckboxes").children.length) {
      renderSubjectGradeCheckboxes([]);
    }
    if ($("subStrandCheckboxes") && !$("subStrandCheckboxes").children.length) {
      renderSubjectStrandCheckboxes(["ABM", "HUMSS"]);
    }
  }

  const tbody = $("adminSubjectsTable");
  if (!tbody) return;

  tbody.innerHTML = list.map(sub => {
    const grades = sub.gradeLevels || [];
    const hasSHS = grades.includes("Grade 11") || grades.includes("Grade 12");
    const strands = Array.isArray(sub.strands) ? sub.strands : [];

    const gradeDisplay = grades.length === gradeLevels.length
      ? `<span class="badge enrolled">All Levels (Grade 1–12)</span>`
      : `<div class="modal-pills" style="margin-top:0;">${grades.map(g => `<span class="modal-pill" style="font-size:11px;padding:3px 8px;">${esc(g)}</span>`).join("")}</div>`;

    let strandDisplay = `<span style="color:var(--text-muted);font-size:12px;">N/A (Grades 1–10)</span>`;
    if (hasSHS) {
      if (strands.length >= 2) {
        strandDisplay = `<span class="badge enrolled">Both Strands (ABM &amp; HUMSS)</span>`;
      } else if (strands.length === 1) {
        strandDisplay = `<span class="badge gold">${esc(strands[0])}</span>`;
      }
    }

    return `
      <tr>
        <td><b>${esc(sub.name)}</b></td>
        <td>${gradeDisplay}</td>
        <td>${strandDisplay}</td>
        <td style="white-space:nowrap;">
          <button class="secondary table-btn" onclick="editAdminSubject('${esc(sub.id)}')"><i class="fa-solid fa-pen-to-square fa-fw"></i> Edit</button>
          <button class="secondary table-btn" style="color:var(--primary);margin-left:4px;" onclick="promptRemoveAdminSubject('${esc(sub.id)}')"><i class="fa-solid fa-trash fa-fw"></i> Remove</button>
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="4">No subjects configured.</td></tr>`;
}

// --------------------------------------------------
// 3. CLASS SCHEDULE MANAGEMENT (STUDENTS & FACULTY)
// --------------------------------------------------
function populateScheduleFormControls() {
  const facSel = $("schFaculty");
  if (facSel) {
    const oldFac = facSel.value;
    facSel.innerHTML = (data.facultyList || []).map(f =>
      `<option value="${esc(f.id)}">${esc(f.name)} (${esc(f.id)})</option>`
    ).join("");
    if (oldFac && (data.facultyList || []).some(f => f.id === oldFac)) {
      facSel.value = oldFac;
    }
  }

  const gradeSel = $("schGrade");
  if (gradeSel && !gradeSel.options.length) {
    gradeSel.innerHTML = gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
    gradeSel.value = "Grade 12";
  }

  const stuSel = $("schStudent");
  if (stuSel) {
    const oldStu = stuSel.value;
    stuSel.innerHTML = (data.students || []).map(s =>
      `<option value="${esc(s.id)}">${esc(formatNameId(s))} — ${esc(s.grade)} (${esc(s.section)})</option>`
    ).join("");
    if (oldStu && (data.students || []).some(s => s.id === oldStu)) {
      stuSel.value = oldStu;
    }
  }

  const filterFac = $("schFilterFaculty");
  if (filterFac) {
    const oldFF = filterFac.value;
    filterFac.innerHTML = `<option value="">All Faculty Members</option>` +
      (data.facultyList || []).map(f => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join("");
    filterFac.value = oldFF;
  }

  const filterGr = $("schFilterGrade");
  if (filterGr) {
    const oldFG = filterGr.value;
    filterGr.innerHTML = `<option value="">All Grade Levels</option>` +
      gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
    filterGr.value = oldFG;
  }

  updateScheduleSectionFields($("schSubject")?.value || "");
}

function onScheduleFacultyChange() {
  const facId = $("schFaculty")?.value;
  const fac = (data.facultyList || []).find(f => f.id === facId);
  const gradeSel = $("schGrade");
  const strandSel = $("schStrand");

  if (fac && Array.isArray(fac.subjects) && fac.subjects.length && gradeSel) {
    const currentGrade = gradeSel.value || "Grade 12";
    const isSHS = currentGrade === "Grade 11" || currentGrade === "Grade 12";
    const currentStrand = isSHS ? (strandSel?.value || "ABM") : "";
    const currentGradeSubs = getSubjectsForGrade(currentGrade, currentStrand);

    const matchesCurrent = fac.subjects.filter(sub => currentGradeSubs.includes(sub));

    // If this faculty member teaches a different grade level, auto-sync Grade Level & Strand to match
    if (!matchesCurrent.length) {
      const firstSubObj = (data.subjects || []).find(s => fac.subjects.includes(s.name) && Array.isArray(s.gradeLevels) && s.gradeLevels.length);
      if (firstSubObj) {
        gradeSel.value = firstSubObj.gradeLevels[0];
        if ((firstSubObj.gradeLevels[0] === "Grade 11" || firstSubObj.gradeLevels[0] === "Grade 12") && strandSel && Array.isArray(firstSubObj.strands) && firstSubObj.strands.length) {
          strandSel.value = firstSubObj.strands[0];
        }
      }
    }
  }

  updateScheduleSectionFields($("schSubject")?.value || "");
}

function onScheduleTargetTypeChange() {
  const targetType = $("schTargetType")?.value || "section";
  const stuField = $("schStudentField");
  if (stuField) {
    stuField.classList.toggle("hidden", targetType !== "student");
  }
  if (targetType === "student") {
    onScheduleStudentChange();
  }
}

function onScheduleStudentChange() {
  const stuId = $("schStudent")?.value;
  const s = (data.students || []).find(x => x.id === stuId);
  if (!s) return;

  if ($("schGrade")) $("schGrade").value = s.grade;
  const enr = (data.enrollments || []).find(e => e.student === s.id);
  if ($("schStrand") && enr?.strand && enr.strand !== "N/A") {
    $("schStrand").value = enr.strand;
  } else if ($("schStrand") && s.section) {
    const prefix = s.section.split("-")[0];
    if (shsStrands.includes(prefix)) $("schStrand").value = prefix;
  }
  updateScheduleSectionFields();
  if ($("schSection") && s.section && !s.section.startsWith("Pending")) {
    $("schSection").value = s.section;
  }
}

function updateScheduleSectionFields(preferredSubject = "") {
  const grade = $("schGrade")?.value || "Grade 1";
  const isSHS = grade === "Grade 11" || grade === "Grade 12";
  const strandField = $("schStrandField");
  if (strandField) strandField.style.display = isSHS ? "" : "none";

  const strand = isSHS ? ($("schStrand")?.value || "ABM") : "";
  const secSel = $("schSection");
  if (secSel) {
    const oldSec = secSel.value;
    if (isSHS) {
      secSel.innerHTML = ["A", "B", "C"].map(letter =>
        `<option value="${strand}-${letter}">${strand}-${letter}</option>`
      ).join("");
    } else {
      secSel.innerHTML = ["Section A", "Section B", "Section C"].map(sec =>
        `<option value="${sec}">${sec}</option>`
      ).join("");
    }
    if (oldSec && Array.from(secSel.options).some(opt => opt.value === oldSec)) {
      secSel.value = oldSec;
    }
  }

  // Sync Subject options (and matching Faculty Member) to the selected Grade Level & Strand
  const subSel = $("schSubject");
  const facSel = $("schFaculty");
  if (!subSel) return;

  const prevSub = preferredSubject || subSel.value;
  const gradeSubjects = getSubjectsForGrade(grade, strand);
  let fac = (data.facultyList || []).find(f => f.id === facSel?.value);

  let validSubjects = fac && Array.isArray(fac.subjects)
    ? fac.subjects.filter(sub => gradeSubjects.includes(sub))
    : [];

  // If the selected faculty has no subjects assigned to this grade/strand, switch to a matching faculty
  if (!validSubjects.length && gradeSubjects.length) {
    const matchingFac = (data.facultyList || []).find(f =>
      Array.isArray(f.subjects) && f.subjects.some(sub => gradeSubjects.includes(sub))
    );
    if (matchingFac && facSel) {
      facSel.value = matchingFac.id;
      fac = matchingFac;
      validSubjects = matchingFac.subjects.filter(sub => gradeSubjects.includes(sub));
    } else {
      // Fallback: show all curriculum subjects for this grade/strand
      validSubjects = gradeSubjects;
    }
  }

  if (validSubjects.length) {
    subSel.innerHTML = validSubjects.map(sub =>
      `<option value="${esc(sub)}">${esc(sub)}</option>`
    ).join("");
    if (prevSub && validSubjects.includes(prevSub)) {
      subSel.value = prevSub;
    }
  } else {
    subSel.innerHTML = `<option value="">No subjects assigned to ${esc(grade)}</option>`;
  }
}

function formatTime12Hour(time24) {
  const [hStr, mStr] = String(time24 || "").split(":");
  const h = Number(hStr);
  if (isNaN(h) || !mStr) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${ampm}`;
}

function saveAdminSchedule() {
  const facultyId = val("schFaculty");
  const fac = (data.facultyList || []).find(f => f.id === facultyId);
  if (!fac) return toast("Please select a faculty member.");

  const subject = val("schSubject");
  if (!subject) return toast("Please select a valid subject for this grade level.");

  const targetType = val("schTargetType") || "section";
  const studentId = targetType === "student" ? val("schStudent") : "";
  if (targetType === "student" && !studentId) {
    return toast("Please select a student.");
  }

  const grade = val("schGrade") || "Grade 1";
  const isSHS = grade === "Grade 11" || grade === "Grade 12";
  const strand = isSHS ? (val("schStrand") || "ABM") : "N/A";
  const section = val("schSection") || (isSHS ? `${strand}-A` : "Section A");
  const day = val("schDay") || "Monday";
  const startTime = val("schStartTime");
  const endTime = val("schEndTime");
  const room = val("schRoom") || "Room 101";

  if (!startTime || !endTime) {
    return toast("Please select both class start and end times.");
  }
  if (endTime <= startTime) {
    return toast("Class end time must be later than the start time.");
  }

  const time = `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`;

  if (!Array.isArray(data.schedules)) data.schedules = [];

  data.schedules.push({
    id: `SCH-${Date.now().toString().slice(-4)}`,
    facultyId: fac.id,
    facultyName: fac.name,
    targetType,
    studentId,
    grade,
    strand,
    section,
    subject,
    day,
    time,
    room
  });

  persist();
  if ($("schStartTime")) $("schStartTime").value = "";
  if ($("schEndTime")) $("schEndTime").value = "";
  if ($("schRoom")) $("schRoom").value = "";
  renderAll();
  toast(`Schedule added for ${fac.name} (${subject})`);
}

function promptRemoveAdminSchedule(schId) {
  const sch = (data.schedules || []).find(s => s.id === schId);
  if (!sch) return;

  openAdminDeleteModal({
    type: "schedule",
    id: sch.id,
    title: "Remove Class Schedule",
    subtitle: `${sch.grade} - ${sch.section} • ${sch.day}`,
    messageHTML: `Are you sure you want to remove the schedule for <strong>${esc(sch.subject)}</strong> (${esc(sch.time)}, ${esc(sch.room)}) assigned to <strong>${esc(sch.facultyName)}</strong>?`
  });
}

function executeRemoveAdminSchedule(schId) {
  data.schedules = (data.schedules || []).filter(s => s.id !== schId);
  persist();
  renderAll();
  toast("Class schedule removed.");
}

const removeAdminSchedule = promptRemoveAdminSchedule;

function renderAdminSchedules() {
  populateScheduleFormControls();

  const fFac = $("schFilterFaculty")?.value || "";
  const fGrade = $("schFilterGrade")?.value || "";
  const tbody = $("adminScheduleTable");
  if (!tbody) return;

  const filtered = (data.schedules || []).filter(sch => {
    if (fFac && sch.facultyId !== fFac) return false;
    if (fGrade && sch.grade !== fGrade) return false;
    return true;
  });

  tbody.innerHTML = filtered.map(sch => {
    let targetLabel = `${esc(sch.grade)} - ${esc(sch.section)} (All Students)`;
    if (sch.targetType === "student" && sch.studentId) {
      const stu = (data.students || []).find(x => x.id === sch.studentId);
      targetLabel = `<span class="badge gold">Student</span> ${esc(stu ? formatNameId(stu) : sch.studentId)}`;
    }

    return `
      <tr>
        <td><b>${esc(sch.facultyName)}</b><br><small style="color:var(--text-muted);">${esc(sch.facultyId)}</small></td>
        <td><b>${esc(sch.subject)}</b></td>
        <td>${targetLabel}</td>
        <td>${esc(sch.day)}</td>
        <td>${esc(sch.time)}</td>
        <td>${esc(sch.room)}</td>
        <td>
          <button class="secondary table-btn" style="color:var(--primary);" onclick="promptRemoveAdminSchedule('${esc(sch.id)}')"><i class="fa-solid fa-trash fa-fw"></i> Remove</button>
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="7">No class schedules found.</td></tr>`;
}

// --------------------------------------------------
// 4. USER MANAGEMENT TABLE SYNC
// --------------------------------------------------
function renderUsersTable() {
  const tbody = $("usersTableBody");
  if (!tbody) return;

  const adminRow = `
    <tr>
      <td>admin</td>
      <td>Administrator</td>
      <td>Administrator</td>
      <td><span class="badge regular">Active</span></td>
    </tr>
  `;

  const facultyRows = (data.facultyList || []).map(f => {
    const status = f.status || "Active";
    const statusBadge = status === "Inactive"
      ? `<span class="badge dropped">Inactive</span>`
      : `<span class="badge regular">Active</span>`;
    return `
      <tr>
        <td>${esc(f.username)}</td>
        <td>${esc(f.name)}</td>
        <td>Faculty</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = adminRow + facultyRows;
}