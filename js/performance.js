// Academic Performance: Filtered by Grade Level, SHS Strand (ABM / HUMSS) & Semester (1st Sem / 2nd Sem)
const bars = list => list.map(g => {
  const score = typeof calc(g) === "number" ? calc(g) : 0;
  return `<div class="bar" style="height:${Math.max(10, (score - 65) * 3)}px" title="${esc(g[0])}: ${score}"><span>${esc(g[0].slice(0, 5))}</span></div>`;
}).join("");

function getHonorStanding(avg) {
  if (avg >= 98) return "With Highest Honors";
  if (avg >= 95) return "With High Honors";
  if (avg >= 90) return "With Honors";
  return "Regular Standing";
}

function getStudentStrand(s) {
  const enr = (data.enrollments || []).find(e => e.student === s.id);
  if (enr && enr.strand && enr.strand !== "N/A") return enr.strand;
  if (s.section) {
    const prefix = s.section.split("-")[0];
    if (shsStrands.includes(prefix)) return prefix;
  }
  return "N/A";
}

function renderHonorsItemsHTML(rankedList) {
  const rankClasses = ["gold", "silver", "bronze"];
  const top3 = rankedList.slice(0, 3);

  if (!top3.length) {
    return `<p style="color:var(--text-muted);font-size:12.5px;margin:6px 0;">No ranked students in this category yet.</p>`;
  }

  return `<div class="honors-list">` + top3.map((item, idx) => `
    <div class="honors-list-item">
      <div class="honors-left">
        <span class="rank-tag ${rankClasses[idx]}">#${idx + 1}</span>
        <strong class="honors-name">${esc(formatNameId(item.student))}</strong>
      </div>
      <div class="honors-right">
        <span class="honors-average">${item.gpa.toFixed(2)}</span>
        <span class="badge ${rankClasses[idx]}">${esc(item.honors)}</span>
      </div>
    </div>
  `).join("") + `</div>`;
}

function handlePerfGradeChange() {
  const grade = $("perfGradeFilter")?.value || "";
  const isSHS = grade === "Grade 11" || grade === "Grade 12";
  const strandEl = $("perfStrandFilter");
  const semEl = $("perfSemesterFilter");

  if (strandEl) {
    strandEl.style.display = isSHS ? "" : "none";
    if (!isSHS) strandEl.value = "";
  }

  if (semEl) {
    semEl.style.display = isSHS ? "" : "none";
    if (!isSHS) semEl.value = "";
  }

  renderPerformance();
}

function renderPerformance() {
  // Populate Grade Filter Dropdown
  const gradeFilterEl = $("perfGradeFilter");
  if (gradeFilterEl) {
    const oldVal = gradeFilterEl.value;
    gradeFilterEl.innerHTML = `<option value="">All Grade Levels</option>` +
      gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
    gradeFilterEl.value = oldVal;
  }

  const selectedGrade = gradeFilterEl?.value || "";
  const isSHS = selectedGrade === "Grade 11" || selectedGrade === "Grade 12";
  const strandFilterEl = $("perfStrandFilter");
  const semFilterEl = $("perfSemesterFilter");

  if (strandFilterEl) {
    strandFilterEl.style.display = isSHS ? "" : "none";
    if (!isSHS) strandFilterEl.value = "";
  }

  if (semFilterEl) {
    semFilterEl.style.display = isSHS ? "" : "none";
    if (!isSHS) semFilterEl.value = "";
  }

  const selectedStrand = isSHS ? (strandFilterEl?.value || "") : "";
  const selectedSemester = isSHS ? (semFilterEl?.value || "") : "";

  const getStudentGradesForScope = s => {
    const gr = data.grades[s.id] || [];
    if (!selectedSemester) return gr;
    return gr.filter(g => {
      const sem = typeof getSubjectSemester === "function"
        ? getSubjectSemester(g[0], s.grade)
        : "N/A";
      return sem === selectedSemester;
    });
  };

  // 1. Score all students within selected semester scope
  const scoredStudents = data.students
    .map(s => {
      const gr = getStudentGradesForScope(s);
      const avg = Number(avgOf(gr));
      return {
        student: s,
        strand: getStudentStrand(s),
        subjectCount: gr.length,
        gpa: avg,
        honors: getHonorStanding(avg)
      };
    })
    .filter(item => !selectedSemester || item.subjectCount > 0);

  // 2. Top 1–3 Performers Card(s)
  const byGradeEl = $("topPerformersByGrade");
  if (byGradeEl) {
    if (selectedGrade) {
      const groupRanked = scoredStudents
        .filter(item => item.student.grade === selectedGrade && (!selectedStrand || item.strand === selectedStrand))
        .sort((a, b) => b.gpa - a.gpa);

      const subtitleParts = [
        selectedStrand ? `${selectedStrand} Strand` : "",
        selectedSemester
      ].filter(Boolean);

      const cardTitle = subtitleParts.length
        ? `${selectedGrade} — ${subtitleParts.join(" • ")}`
        : selectedGrade;

      byGradeEl.innerHTML = `
        <div class="perf-group-card">
          <div class="perf-group-header">
            <h4><i class="fa-solid fa-graduation-cap" style="color:var(--primary);margin-right:6px;"></i>${esc(cardTitle)}</h4>
            <span class="badge enrolled">Top 1–3</span>
          </div>
          ${renderHonorsItemsHTML(groupRanked)}
        </div>
      `;
    } else {
      const activeGrades = gradeLevels.filter(g => scoredStudents.some(item => item.student.grade === g));
      const targetGrades = activeGrades.length ? activeGrades : gradeLevels;

      byGradeEl.innerHTML = targetGrades.map(g => {
        const groupRanked = scoredStudents
          .filter(item => item.student.grade === g)
          .sort((a, b) => b.gpa - a.gpa);

        return `
          <div class="perf-group-card">
            <div class="perf-group-header">
              <h4><i class="fa-solid fa-graduation-cap" style="color:var(--primary);margin-right:6px;"></i>${esc(g)}</h4>
              <span class="badge enrolled">Top 1–3</span>
            </div>
            ${renderHonorsItemsHTML(groupRanked)}
          </div>
        `;
      }).join("");
    }
  }

  // 3. Top 1–3 by Strand Panel (Only visible when All Grade Levels or Grade 11/12 with All Strands is selected)
  const strandPanelEl = $("perfStrandPanel");
  const byStrandEl = $("topPerformersByStrand");
  const showStrandBreakdown = !selectedGrade || (isSHS && !selectedStrand);

  if (strandPanelEl) {
    strandPanelEl.style.display = showStrandBreakdown ? "" : "none";
  }
  if ($("perfStrandBadge")) {
    $("perfStrandBadge").textContent = selectedGrade
      ? `${selectedGrade} Strands${selectedSemester ? ` • ${selectedSemester}` : ""}`
      : "Grade 11 & 12 Strands";
  }

  if (byStrandEl && showStrandBreakdown) {
    byStrandEl.innerHTML = shsStrands.map(st => {
      const strandRanked = scoredStudents
        .filter(item => {
          const matchesGrade = selectedGrade
            ? item.student.grade === selectedGrade
            : (item.student.grade === "Grade 11" || item.student.grade === "Grade 12");
          return matchesGrade && item.strand === st;
        })
        .sort((a, b) => b.gpa - a.gpa);

      return `
        <div class="perf-group-card">
          <div class="perf-group-header">
            <h4><i class="fa-solid fa-award" style="color:var(--primary);margin-right:6px;"></i>${esc(st)} Strand</h4>
            <span class="badge gold">Top 1–3</span>
          </div>
          ${renderHonorsItemsHTML(strandRanked)}
        </div>
      `;
    }).join("");
  }

  // 4. Filter Students & Grades for Academic Summary & Performance by Subject Chart
  const matchingStudents = data.students.filter(s => {
    if (selectedGrade && s.grade !== selectedGrade) return false;
    if (selectedStrand && getStudentStrand(s) !== selectedStrand) return false;
    return true;
  });

  const scopeParts = [selectedGrade, selectedStrand, selectedSemester].filter(Boolean);
  const scopeLabel = scopeParts.length ? ` (${scopeParts.join(" - ")})` : "";

  if ($("perfSummaryTitle")) $("perfSummaryTitle").textContent = `Academic Summary${scopeLabel}`;
  if ($("perfChartTitle")) $("perfChartTitle").textContent = `Performance by Subject${scopeLabel}`;

  const filteredGrades = matchingStudents.flatMap(s => getStudentGradesForScope(s));
  const count = st => filteredGrades.filter(g => statusOf(calc(g)) === st).length;

  const summaryEl = $("performanceSummary");
  if (summaryEl) {
    summaryEl.innerHTML = `
      <p><b>General Average:</b> ${avgOf(filteredGrades)}</p>
      <p><b>Passed Subject Records:</b> ${count("Passed")}</p>
      <p><b>Failed Subject Records:</b> ${count("Failed")}</p>
      <p><b>Pending Subject Records:</b> ${count("Pending")}</p>`;
  }

  // 5. Performance by Subject Chart (Filtered)
  const subjectTotals = {};
  filteredGrades.forEach(g => {
    const sub = g[0];
    const score = calc(g);
    if (typeof score === "number") {
      if (!subjectTotals[sub]) subjectTotals[sub] = [];
      subjectTotals[sub].push(score);
    }
  });

  const subjectAverages = Object.entries(subjectTotals).map(([sub, sc]) => [
    sub, Math.round(sc.reduce((a, b) => a + b, 0) / sc.length)
  ]);

  const chartEl = $("performanceChart");
  if (chartEl) {
    chartEl.innerHTML = subjectAverages.length
      ? bars(subjectAverages)
      : `<p style="color:var(--text-muted);font-size:13px;margin:auto;text-align:center;width:100%;">No subject performance data for this selection.</p>`;
  }
}