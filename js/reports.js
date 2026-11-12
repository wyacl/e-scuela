// ==========================================================
// REPORTS ENGINE: VIEW MODAL, DIRECT PRINT & AUTO PDF DOWNLOAD
// ==========================================================

const ADMIN_REPORT_LIST = [
  "Student Academic Report",
  "Enrollment Report",
  "Grade Report",
  "Subject Status Report",
  "Student Masterlist"
];

function renderReportList() {
  const list = $("reportList");
  if (!list) return;

  list.innerHTML = ADMIN_REPORT_LIST.map(r => `
    <div class="report">
      <span><b>${esc(r)}</b></span>
      <div class="report-actions">
        <button class="secondary table-btn" onclick="viewReport('${esc(r)}')"><i class="fa-solid fa-eye fa-fw"></i> View</button>
        <button class="secondary table-btn" onclick="printReport('${esc(r)}')"><i class="fa-solid fa-print fa-fw"></i> Print</button>
        <button class="primary table-btn" onclick="downloadReportPDF('${esc(r)}')"><i class="fa-solid fa-file-pdf fa-fw"></i> Download (PDF)</button>
      </div>
    </div>
  `).join("");
}

function getStudentReportDisplayTitle(name) {
  if (name === "My Academic Report") return "My Academic Performance Report";
  if (name === "My Enrollment Report") return "Certificate of Enrollment";
  if (name === "My Grade Report") return "Official Student Report Card";
  return name;
}

function getReportHonorStanding(avg) {
  if (typeof getHonorStanding === "function") return getHonorStanding(avg);
  if (avg >= 98) return "With Highest Honors";
  if (avg >= 95) return "With High Honors";
  if (avg >= 90) return "With Honors";
  return avg >= 75 ? "Regular Standing" : "Needs Remediation";
}

function generateReportHTML(name, isStudent = false) {
  const s = currentStudent;
  const displayTitle = isStudent ? getStudentReportDisplayTitle(name) : name;

  let html = `
    <div class="report-paper" style="box-sizing: border-box; width: 100%; padding: 24px; background: #ffffff; color: #1f2937; font-family: 'Montserrat', Arial, sans-serif;">
      <div style="text-align:center;border-bottom:2px solid #7d090f;padding-bottom:12px;margin-bottom:16px;">
        <h2 style="color:#7d090f;margin:0 0 4px 0;font-size:20px;font-family:'Montserrat', Arial, sans-serif;">Escuela de Nuestra Señora de la Salette</h2>
        <div style="font-size:12px;color:#555;font-family:'Montserrat', Arial, sans-serif;">Official Academic Document • School Year 2026-2027</div>
        <h3 style="margin:12px 0 0 0;text-transform:uppercase;color:#1f2937;letter-spacing:0.5px;font-family:'Montserrat', Arial, sans-serif;">${esc(displayTitle)}</h3>
      </div>
  `;

  if (isStudent && s) {
    const grades = (data.grades && data.grades[s.id]) ? data.grades[s.id] : [];
    const enr = (data.enrollments && data.enrollments.find(e => e.student === s.id)) || {
      schoolYear: "2026-2027",
      grade: s.grade,
      strand: "N/A",
      section: s.section,
      date: "2026-06-15",
      enrollmentStatus: "Enrolled"
    };
    const studentStatus = s.status === "Regular" ? "Enrolled" : (s.status || "Enrolled");
    const gpa = avgOf(grades);
    const numGpa = Number(gpa);
    const hasCompleted = grades.some(g => typeof calc(g) === "number");
    const standing = !hasCompleted ? "Pending" : getReportHonorStanding(numGpa);

    if (name === "My Enrollment Report" || name === "Certificate of Enrollment") {
      // 1. STUDENT CERTIFICATE OF ENROLLMENT
      const studentSchedules = (data.schedules || []).filter(sch =>
        (sch.targetType === "student" && sch.studentId === s.id) ||
        (sch.targetType !== "student" && sch.grade === s.grade && sch.section === s.section)
      );

      html += `
        <p style="font-size:13px;line-height:1.7;color:#1f2937;margin:0 0 16px 0;text-align:justify;">
          This is to officially certify that <b>${esc(s.name)}</b> (Student ID: <b>${esc(s.id)}</b>) is duly registered and <b>${esc(enr.enrollmentStatus || studentStatus)}</b> at <b>Escuela de Nuestra Señora de la Salette</b> for School Year <b>${esc(enr.schoolYear || "2026-2027")}</b>.
        </p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:16px;font-size:12.5px;">
          <div><b>Student Name:</b> ${esc(s.name)}</div>
          <div><b>Student ID Number:</b> ${esc(s.id)}</div>
          <div><b>Grade Level:</b> ${esc(enr.grade || s.grade)}</div>
          <div><b>Strand:</b> ${esc(enr.strand || "N/A")}</div>
          <div><b>Section:</b> ${esc(enr.section || s.section)}</div>
          <div><b>School Year:</b> ${esc(enr.schoolYear || "2026-2027")}</div>
          <div><b>Date Enrolled:</b> ${esc(enr.date || "2026-06-15")}</div>
          <div><b>Enrollment Status:</b> ${esc(enr.enrollmentStatus || studentStatus)}</div>
          <div><b>Guardian:</b> ${esc(s.guardian || "N/A")}</div>
          <div><b>Contact Number:</b> ${esc(s.contact || "N/A")}</div>
        </div>

        <div style="font-size:12.5px;font-weight:700;color:#7d090f;margin-bottom:6px;text-transform:uppercase;">Officially Enrolled Subjects (${grades.length})</div>
        <div class="report-table-wrap">
          <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
                <th style="padding:8px;text-align:left;color:#374151;">#</th>
                <th style="padding:8px;text-align:left;color:#374151;">Subject</th>
                <th style="padding:8px;text-align:left;color:#374151;">Schedule</th>
                <th style="padding:8px;text-align:left;color:#374151;">Room</th>
                <th style="padding:8px;text-align:left;color:#374151;">Instructor</th>
              </tr>
            </thead>
            <tbody>
              ${grades.map((g, idx) => {
                const sched = studentSchedules.find(sc => sc.subject.toLowerCase() === g[0].toLowerCase());
                return `
                  <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:8px;color:#6b7280;">${idx + 1}</td>
                    <td style="padding:8px;"><b>${esc(g[0])}</b></td>
                    <td style="padding:8px;">${sched ? esc(`${sched.day} (${sched.time})`) : "TBA"}</td>
                    <td style="padding:8px;">${sched ? esc(sched.room) : "TBA"}</td>
                    <td style="padding:8px;">${sched ? esc(sched.facultyName) : "TBA"}</td>
                  </tr>
                `;
              }).join("") || `<tr><td colspan="5" style="padding:10px;text-align:center;">No subjects enlisted.</td></tr>`}
            </tbody>
          </table>
        </div>
      `;
    } else if (name === "My Academic Report" || name === "My Academic Performance Report") {
      // 2. STUDENT ACADEMIC PERFORMANCE REPORT
      const passedCount = grades.filter(g => statusOf(calc(g)) === "Passed").length;
      const failedCount = grades.filter(g => statusOf(calc(g)) === "Failed").length;
      const pendingCount = grades.filter(g => statusOf(calc(g)) === "Pending").length;

      html += `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;font-size:13px;">
          <div><b>Student:</b> ${esc(formatNameId(s))}</div>
          <div><b>Grade &amp; Section:</b> ${esc(s.grade)} - ${esc(s.section)}</div>
          <div><b>Strand:</b> ${esc(enr.strand || "N/A")}</div>
          <div><b>Academic Standing:</b> <span style="color:#7d090f;font-weight:700;">${esc(standing)}</span></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;margin-bottom:16px;text-align:center;font-size:12px;">
          <div style="padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">
            <div style="color:#6b7280;font-size:11px;">GENERAL AVERAGE</div>
            <div style="font-size:17px;font-weight:800;color:#7d090f;">${gpa}</div>
          </div>
          <div style="padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">
            <div style="color:#6b7280;font-size:11px;">PASSED</div>
            <div style="font-size:17px;font-weight:800;color:#2e7d32;">${passedCount}</div>
          </div>
          <div style="padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">
            <div style="color:#6b7280;font-size:11px;">FAILED</div>
            <div style="font-size:17px;font-weight:800;color:#b91c1c;">${failedCount}</div>
          </div>
          <div style="padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">
            <div style="color:#6b7280;font-size:11px;">PENDING</div>
            <div style="font-size:17px;font-weight:800;color:#b26a00;">${pendingCount}</div>
          </div>
        </div>

        <div class="report-table-wrap">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
                <th style="padding:8px;text-align:left;color:#374151;">Subject</th>
                <th style="padding:8px;text-align:center;color:#374151;">Final Rating</th>
                <th style="padding:8px;text-align:center;color:#374151;">Performance Remark</th>
              </tr>
            </thead>
            <tbody>
              ${grades.map(g => {
                const finalVal = calc(g);
                const st = statusOf(finalVal);
                return `
                  <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:8px;"><b>${esc(g[0])}</b></td>
                    <td style="padding:8px;text-align:center;font-weight:700;">${finalVal}</td>
                    <td style="padding:8px;text-align:center;">${esc(st)}</td>
                  </tr>
                `;
              }).join("") || `<tr><td colspan="3" style="padding:10px;text-align:center;">No subject performance records available.</td></tr>`}
            </tbody>
          </table>
        </div>
      `;
    } else {
      // 3. STUDENT OFFICIAL REPORT CARD (My Grade Report)
      html += `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;font-size:13px;">
          <div><b>Student:</b> ${esc(formatNameId(s))}</div>
          <div><b>Grade &amp; Section:</b> ${esc(s.grade)} - ${esc(s.section)}</div>
          <div><b>Status:</b> ${esc(studentStatus)}</div>
          <div><b>Enrollment Date:</b> ${esc(enr.date || "2026-06-15")}</div>
        </div>
        <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
        <div class="report-table-wrap">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
                <th style="padding:8px;text-align:left;color:#374151;">Subject</th>
                <th style="padding:8px;text-align:center;color:#374151;">1st</th>
                <th style="padding:8px;text-align:center;color:#374151;">2nd</th>
                <th style="padding:8px;text-align:center;color:#374151;">3rd</th>
                <th style="padding:8px;text-align:center;color:#374151;">4th</th>
                <th style="padding:8px;text-align:center;color:#374151;">Final</th>
                <th style="padding:8px;text-align:center;color:#374151;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${grades.map(g => `
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">${esc(g[0])}</td>
                  <td style="padding:8px;text-align:center;">${formatQuarter(g[1])}</td>
                  <td style="padding:8px;text-align:center;">${formatQuarter(g[2])}</td>
                  <td style="padding:8px;text-align:center;">${formatQuarter(g[3])}</td>
                  <td style="padding:8px;text-align:center;">${formatQuarter(g[4])}</td>
                  <td style="padding:8px;text-align:center;font-weight:700;">${calc(g)}</td>
                  <td style="padding:8px;text-align:center;">${statusOf(calc(g))}</td>
                </tr>
              `).join("") || `<tr><td colspan="7" style="padding:10px;text-align:center;">No grades recorded.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;font-size:14px;">
          <div><b>Academic Standing:</b> <span style="color:#374151;font-weight:700;">${esc(standing)}</span></div>
          <div><b>General Average:</b> <span style="font-size:18px;color:#7d090f;font-weight:800;">${gpa}</span></div>
        </div>
      `;
    }
  } else if (name === "Enrollment Report") {
    // ADMIN: ENROLLMENT REPORT
    html += `
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
              <th style="padding:8px;text-align:left;color:#374151;">Student</th>
              <th style="padding:8px;text-align:center;color:#374151;">SY</th>
              <th style="padding:8px;text-align:center;color:#374151;">Grade</th>
              <th style="padding:8px;text-align:center;color:#374151;">Strand</th>
              <th style="padding:8px;text-align:center;color:#374151;">Section</th>
              <th style="padding:8px;text-align:center;color:#374151;">Enrollment Date</th>
              <th style="padding:8px;text-align:center;color:#374151;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.enrollments.map(e => {
              const st = data.students.find(x => x.id === e.student);
              const enrollStatus = e.enrollmentStatus === "Regular" ? "Enrolled" : (e.enrollmentStatus || "Enrolled");
              return `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;"><b>${esc(st ? formatNameId(st) : e.student)}</b></td>
                <td style="padding:8px;text-align:center;">${esc(e.schoolYear)}</td>
                <td style="padding:8px;text-align:center;">${esc(e.grade)}</td>
                <td style="padding:8px;text-align:center;">${esc(e.strand)}</td>
                <td style="padding:8px;text-align:center;">${esc(e.section)}</td>
                <td style="padding:8px;text-align:center;">${esc(e.date || "2026-06-15")}</td>
                <td style="padding:8px;text-align:center;">${esc(enrollStatus)}</td>
              </tr>`;
            }).join("") || `<tr><td colspan="7" style="padding:10px;text-align:center;">No enrollment records found.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  } else if (name === "Grade Report") {
    // ADMIN: GRADE REPORT (Quarterly & Final Grades across Students & Subjects)
    html += `
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
              <th style="padding:8px;text-align:left;color:#374151;">Student</th>
              <th style="padding:8px;text-align:center;color:#374151;">Grade &amp; Section</th>
              <th style="padding:8px;text-align:left;color:#374151;">Subject</th>
              <th style="padding:8px;text-align:center;color:#374151;">1st</th>
              <th style="padding:8px;text-align:center;color:#374151;">2nd</th>
              <th style="padding:8px;text-align:center;color:#374151;">3rd</th>
              <th style="padding:8px;text-align:center;color:#374151;">4th</th>
              <th style="padding:8px;text-align:center;color:#374151;">Final</th>
              <th style="padding:8px;text-align:center;color:#374151;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${data.students.flatMap(st => {
              const subs = data.grades[st.id] || [];
              return subs.map(g => {
                const finalScore = calc(g);
                return `
                  <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:8px;"><b>${esc(formatNameId(st))}</b></td>
                    <td style="padding:8px;text-align:center;">${esc(st.grade)} - ${esc(st.section)}</td>
                    <td style="padding:8px;">${esc(g[0])}</td>
                    <td style="padding:8px;text-align:center;">${formatQuarter(g[1])}</td>
                    <td style="padding:8px;text-align:center;">${formatQuarter(g[2])}</td>
                    <td style="padding:8px;text-align:center;">${formatQuarter(g[3])}</td>
                    <td style="padding:8px;text-align:center;">${formatQuarter(g[4])}</td>
                    <td style="padding:8px;text-align:center;font-weight:700;">${finalScore}</td>
                    <td style="padding:8px;text-align:center;">${statusOf(finalScore)}</td>
                  </tr>
                `;
              });
            }).join("") || `<tr><td colspan="9" style="padding:10px;text-align:center;">No grade records available.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  } else if (name === "Subject Status Report") {
    // ADMIN: SUBJECT STATUS REPORT
    html += `
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
              <th style="padding:8px;text-align:left;color:#374151;">Student</th>
              <th style="padding:8px;text-align:center;color:#374151;">Year Level</th>
              <th style="padding:8px;text-align:left;color:#374151;">Subject</th>
              <th style="padding:8px;text-align:center;color:#374151;">Final Grade</th>
              <th style="padding:8px;text-align:center;color:#374151;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(data.grades).flatMap(([id, subs]) => {
              const st = data.students.find(x => x.id === id);
              return subs.map(g => `
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;"><b>${esc(st ? formatNameId(st) : id)}</b></td>
                  <td style="padding:8px;text-align:center;">${esc(st?.grade || "N/A")}</td>
                  <td style="padding:8px;">${esc(g[0])}</td>
                  <td style="padding:8px;text-align:center;font-weight:700;">${calc(g)}</td>
                  <td style="padding:8px;text-align:center;">${statusOf(calc(g))}</td>
                </tr>
              `);
            }).join("") || `<tr><td colspan="5" style="padding:10px;text-align:center;">No subject status records available.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  } else if (name === "Student Masterlist") {
    // ADMIN: STUDENT MASTERLIST
    html += `
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
              <th style="padding:8px;text-align:left;color:#374151;">#</th>
              <th style="padding:8px;text-align:left;color:#374151;">Student</th>
              <th style="padding:8px;text-align:center;color:#374151;">Grade</th>
              <th style="padding:8px;text-align:center;color:#374151;">Section</th>
              <th style="padding:8px;text-align:center;color:#374151;">Contact Number</th>
              <th style="padding:8px;text-align:left;color:#374151;">Guardian</th>
              <th style="padding:8px;text-align:center;color:#374151;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.students.map((st, idx) => {
              const studentStatus = st.status === "Regular" ? "Enrolled" : (st.status || "Enrolled");
              return `
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;color:#6b7280;">${idx + 1}</td>
                  <td style="padding:8px;"><b>${esc(formatNameId(st))}</b></td>
                  <td style="padding:8px;text-align:center;">${esc(st.grade)}</td>
                  <td style="padding:8px;text-align:center;">${esc(st.section)}</td>
                  <td style="padding:8px;text-align:center;">${esc(st.contact || "N/A")}</td>
                  <td style="padding:8px;">${esc(st.guardian || "N/A")}</td>
                  <td style="padding:8px;text-align:center;">${esc(studentStatus)}</td>
                </tr>
              `;
            }).join("") || `<tr><td colspan="7" style="padding:10px;text-align:center;">No students registered.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // ADMIN: STUDENT ACADEMIC REPORT (General Average, Subjects Taken & Honors Standing)
    html += `
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
              <th style="padding:8px;text-align:left;color:#374151;">Student</th>
              <th style="padding:8px;text-align:center;color:#374151;">Grade</th>
              <th style="padding:8px;text-align:center;color:#374151;">Section</th>
              <th style="padding:8px;text-align:center;color:#374151;">Subjects</th>
              <th style="padding:8px;text-align:center;color:#374151;">General Average</th>
              <th style="padding:8px;text-align:center;color:#374151;">Academic Standing</th>
            </tr>
          </thead>
          <tbody>
            ${data.students.map(st => {
              const gr = data.grades[st.id] || [];
              const gpa = avgOf(gr);
              const hasCompleted = gr.some(g => typeof calc(g) === "number");
              const standing = !hasCompleted ? "Pending" : getReportHonorStanding(Number(gpa));
              return `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;"><b>${esc(formatNameId(st))}</b></td>
                <td style="padding:8px;text-align:center;">${esc(st.grade)}</td>
                <td style="padding:8px;text-align:center;">${esc(st.section)}</td>
                <td style="padding:8px;text-align:center;">${gr.length}</td>
                <td style="padding:8px;text-align:center;font-weight:700;">${gpa}</td>
                <td style="padding:8px;text-align:center;">${esc(standing)}</td>
              </tr>`;
            }).join("") || `<tr><td colspan="6" style="padding:10px;text-align:center;">No student academic records available.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  html += `
      <div style="margin-top:24px;display:flex;justify-content:space-between;font-size:12px;color:#555;font-family:'Montserrat', Arial, sans-serif;">
        <div>Date Generated: ${new Date().toLocaleDateString()}</div>
        <div style="border-top:1px solid #333;width:180px;text-align:center;padding-top:4px;">Registrar / Dean</div>
      </div>
    </div>
  `;
  return html;
}

// 1. View Report Modal
function viewReport(name) {
  $("modalReportTitle").textContent = name;
  $("modalReportContent").innerHTML = generateReportHTML(name, false);

  if ($("modalPrintBtn")) $("modalPrintBtn").onclick = () => printReport(name);
  if ($("modalDownloadPdfBtn")) $("modalDownloadPdfBtn").onclick = () => downloadReportPDF(name);

  $("reportViewModal").classList.remove("hidden");
}

function viewStudentReport(name) {
  $("modalReportTitle").textContent = getStudentReportDisplayTitle(name);
  $("modalReportContent").innerHTML = generateReportHTML(name, true);

  if ($("modalPrintBtn")) $("modalPrintBtn").onclick = () => printStudentReport(name);
  if ($("modalDownloadPdfBtn")) $("modalDownloadPdfBtn").onclick = () => downloadStudentReportPDF(name);

  $("reportViewModal").classList.remove("hidden");
}

function closeReportModal(e) {
  if (!e || e.target === $("reportViewModal") || e.type === "click") {
    $("reportViewModal").classList.add("hidden");
  }
}

// 2. Direct Print Window
function printReport(name) {
  executePrintWindow(name, generateReportHTML(name, false));
}

function printStudentReport(name) {
  executePrintWindow(getStudentReportDisplayTitle(name), generateReportHTML(name, true));
}

function executePrintWindow(title, bodyHTML) {
  const printWin = window.open("", "_blank");
  if (!printWin) return toast("Please allow pop-ups to print reports.");

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${esc(title)}</title>
        <style>
          @page { size: auto; margin: 14mm; }
          body {
            font-family: 'Montserrat', Arial, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 10px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .report-paper { width: 100%; border: none; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border-bottom: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background-color: #f8fafc !important; color: #374151; font-weight: 700; }
        </style>
      </head>
      <body>
        ${bodyHTML}
      </body>
    </html>
  `);

  printWin.document.close();
  printWin.focus();
  setTimeout(() => {
    printWin.print();
  }, 350);
}

// 3. Automatic PDF Download using html2pdf
function downloadReportPDF(name) {
  const filename = `${name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  executeAutomaticPDFDownload(filename, generateReportHTML(name, false));
}

function downloadStudentReportPDF(name) {
  const studentId = currentStudent?.id || "Student";
  const cleanTitle = getStudentReportDisplayTitle(name).replace(/\s+/g, '_');
  const filename = `${cleanTitle}_${studentId}.pdf`;
  executeAutomaticPDFDownload(filename, generateReportHTML(name, true));
}

function executeAutomaticPDFDownload(filename, htmlContent) {
  toast("Generating PDF, please wait...");

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.backgroundColor = "rgba(255, 255, 255, 0.96)";
  overlay.style.zIndex = "999999";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "flex-start";
  overlay.style.overflowX = "auto";
  overlay.style.overflowY = "auto";
  overlay.style.padding = "24px 10px";
  overlay.style.boxSizing = "border-box";

  const statusLabel = document.createElement("div");
  statusLabel.style.fontFamily = "'Montserrat', Arial, sans-serif";
  statusLabel.style.fontSize = "13px";
  statusLabel.style.fontWeight = "700";
  statusLabel.style.color = "#7d090f";
  statusLabel.style.marginBottom = "14px";
  statusLabel.textContent = "Rendering official PDF document...";
  overlay.appendChild(statusLabel);

  const reportElement = document.createElement("div");
  reportElement.style.width = "750px";
  reportElement.style.minWidth = "750px";
  reportElement.style.background = "#ffffff";
  reportElement.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.12)";
  reportElement.style.borderRadius = "8px";
  reportElement.style.boxSizing = "border-box";
  reportElement.innerHTML = htmlContent;
  overlay.appendChild(reportElement);

  document.body.appendChild(overlay);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] }
  };

  setTimeout(() => {
    if (window.html2pdf) {
      html2pdf()
        .set(opt)
        .from(reportElement)
        .save()
        .then(() => {
          overlay.remove();
          toast("PDF downloaded successfully!");
        })
        .catch(err => {
          console.error("PDF generation failed:", err);
          overlay.remove();
          executePrintWindow(filename, htmlContent);
        });
    } else {
      overlay.remove();
      executePrintWindow(filename, htmlContent);
    }
  }, 350);
}

document.addEventListener("DOMContentLoaded", () => {
  renderReportList();
});