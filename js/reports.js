// ==========================================================
// REPORTS ENGINE: VIEW MODAL, DIRECT PRINT & AUTO PDF DOWNLOAD
// ==========================================================

function renderReportList() {
  const list = $("reportList");
  if (!list) return;

  const adminReports = [
    "Enrollment Report",
    "Subject Status Report",
    "Student Masterlist",
    "Academic Performance Summary"
  ];

  list.innerHTML = adminReports.map(r => `
    <div class="report">
      <span>${esc(r)}</span>
      <div class="report-actions">
        <button class="secondary table-btn" onclick="viewReport('${r}')"><i class="fa-solid fa-eye fa-fw"></i> View</button>
        <button class="secondary table-btn" onclick="printReport('${r}')"><i class="fa-solid fa-print fa-fw"></i> Print</button>
        <button class="primary table-btn" onclick="downloadReportPDF('${r}')"><i class="fa-solid fa-file-pdf fa-fw"></i> Download (PDF)</button>
      </div>
    </div>
  `).join("");
}

function generateReportHTML(name, isStudent = false) {
  const s = currentStudent;
  let html = `
    <div class="report-paper" style="box-sizing: border-box; width: 100%; padding: 24px; background: #ffffff; color: #1f2937; font-family: 'Montserrat', Arial, sans-serif;">
      <div style="text-align:center;border-bottom:2px solid #7d090f;padding-bottom:12px;margin-bottom:16px;">
        <h2 style="color:#7d090f;margin:0 0 4px 0;font-size:20px;font-family:'Montserrat', Arial, sans-serif;">Escuela de Nuestra Señora de la Salette</h2>
        <div style="font-size:12px;color:#555;font-family:'Montserrat', Arial, sans-serif;">Official Academic Document • School Year 2026-2027</div>
        <h3 style="margin:12px 0 0 0;text-transform:uppercase;color:#1f2937;letter-spacing:0.5px;font-family:'Montserrat', Arial, sans-serif;">${esc(name)}</h3>
      </div>
  `;
  // ... rest of generateReportHTML stays the same

  if (isStudent && s) {
    const grades = (data.grades && data.grades[s.id]) ? data.grades[s.id] : [];
    const enr = (data.enrollments && data.enrollments.find(e => e.student === s.id)) || {};
    html += `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;font-size:13px;font-family:'Montserrat', Arial, sans-serif;">
        <div><b>Student:</b> ${esc(formatNameId(s))}</div>
        <div><b>Grade &amp; Section:</b> ${esc(s.grade)} - ${esc(s.section)}</div>
        <div><b>Academic Status:</b> ${esc(s.status)}</div>
        <div><b>Enrollment Date:</b> ${esc(enr.date || "2026-06-15")}</div>
      </div>
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:13px;font-family:'Montserrat', Arial, sans-serif;">
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
                <td style="padding:8px;text-align:center;">${g[1] ?? '—'}</td>
                <td style="padding:8px;text-align:center;">${g[2] ?? '—'}</td>
                <td style="padding:8px;text-align:center;">${g[3] ?? '—'}</td>
                <td style="padding:8px;text-align:center;">${g[4] ?? '—'}</td>
                <td style="padding:8px;text-align:center;font-weight:700;">${calc(g)}</td>
                <td style="padding:8px;text-align:center;">${statusOf(calc(g))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div style="margin-top:16px;text-align:right;font-size:14px;font-family:'Montserrat', Arial, sans-serif;">
        <b>General Average:</b> <span style="font-size:18px;color:#7d090f;font-weight:800;">${avgOf(grades)}</span>
      </div>
    `;
  } else if (name === "Enrollment Report") {
    html += `
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:'Montserrat', Arial, sans-serif;">
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
              return `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;"><b>${esc(st ? formatNameId(st) : e.student)}</b></td>
                <td style="padding:8px;text-align:center;">${esc(e.schoolYear)}</td>
                <td style="padding:8px;text-align:center;">${esc(e.grade)}</td>
                <td style="padding:8px;text-align:center;">${esc(e.strand)}</td>
                <td style="padding:8px;text-align:center;">${esc(e.section)}</td>
                <td style="padding:8px;text-align:center;">${esc(e.date || "2026-06-15")}</td>
                <td style="padding:8px;text-align:center;">${esc(e.enrollmentStatus)}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  } else if (name === "Subject Status Report") {
    html += `
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:'Montserrat', Arial, sans-serif;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
              <th style="padding:8px;text-align:left;color:#374151;">Student</th>
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
                  <td style="padding:8px;">${esc(g[0])}</td>
                  <td style="padding:8px;text-align:center;font-weight:700;">${calc(g)}</td>
                  <td style="padding:8px;text-align:center;">${statusOf(calc(g))}</td>
                </tr>
              `);
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  } else if (name === "Student Masterlist") {
    html += `
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:'Montserrat', Arial, sans-serif;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
              <th style="padding:8px;text-align:left;color:#374151;">Student</th>
              <th style="padding:8px;text-align:center;color:#374151;">Grade</th>
              <th style="padding:8px;text-align:center;color:#374151;">Section</th>
              <th style="padding:8px;text-align:center;color:#374151;">Contact Number</th>
              <th style="padding:8px;text-align:center;color:#374151;">Academic Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.students.map(s => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;"><b>${esc(formatNameId(s))}</b></td>
                <td style="padding:8px;text-align:center;">${esc(s.grade)}</td>
                <td style="padding:8px;text-align:center;">${esc(s.section)}</td>
                <td style="padding:8px;text-align:center;">${esc(s.contact || "N/A")}</td>
                <td style="padding:8px;text-align:center;">${esc(s.status)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } else {
    html += `
      <div class="report-scroll-hint" style="display:none;">Swipe horizontally to view full table &rarr;</div>
      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:'Montserrat', Arial, sans-serif;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #ddd;">
              <th style="padding:8px;text-align:left;color:#374151;">Student</th>
              <th style="padding:8px;text-align:center;color:#374151;">Grade</th>
              <th style="padding:8px;text-align:center;color:#374151;">Section</th>
              <th style="padding:8px;text-align:center;color:#374151;">General Average</th>
              <th style="padding:8px;text-align:center;color:#374151;">Academic Standing</th>
            </tr>
          </thead>
          <tbody>
            ${data.students.map(s => {
              const gr = data.grades[s.id] || [];
              const gpa = avgOf(gr);
              return `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;"><b>${esc(formatNameId(s))}</b></td>
                <td style="padding:8px;text-align:center;">${esc(s.grade)}</td>
                <td style="padding:8px;text-align:center;">${esc(s.section)}</td>
                <td style="padding:8px;text-align:center;font-weight:700;">${gpa}</td>
                <td style="padding:8px;text-align:center;">${Number(gpa) >= 75 ? "Passed" : "Conditional"}</td>
              </tr>`;
            }).join("")}
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
  $("modalReportTitle").textContent = name;
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
  executePrintWindow(name, generateReportHTML(name, true));
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
  const filename = `${name.replace(/\s+/g, '_')}_${studentId}.pdf`;
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

// Allow the overlay to scroll horizontally if needed so the fixed 750px paper fits
  overlay.style.overflowX = "auto";
  overlay.style.overflowY = "auto";

  // Lock width to 750px so mobile screens don't crush the document layout
  const reportElement = document.createElement("div");
  reportElement.style.width = "750px";
  reportElement.style.minWidth = "750px"; // Prevents phone viewport from shrinking it
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