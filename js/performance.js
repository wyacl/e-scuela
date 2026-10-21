// Academic Performance: List format (#1 Name Average With Honor) + Summary & Chart
const bars = list => list.map(g => {
  const score = typeof calc(g) === "number" ? calc(g) : 0;
  return `<div class="bar" style="height:${Math.max(10, (score - 65) * 3)}px" title="${esc(g[0])}: ${score}"><span>${esc(g[0].slice(0, 5))}</span></div>`;
}).join("");

function renderPerformance() {
  // 1. Calculate Rankings
  const ranked = data.students.map(s => {
    const gr = data.grades[s.id] || [];
    const avg = Number(avgOf(gr));
    let honors = "Regular Standing";
    if (avg >= 98) honors = "With Highest Honors";
    else if (avg >= 95) honors = "With High Honors";
    else if (avg >= 90) honors = "With Honors";

    return {
      student: s,
      gpa: avg,
      honors
    };
  }).sort((a, b) => b.gpa - a.gpa);

  // 2. Render Top 1–3 as a Clean List: #1 Name Average With Honor
  const topList = ranked.slice(0, 3);
  const rankClasses = ["gold", "silver", "bronze"];

const listEl = $("topPerformersList") || $("topPerformersPodium");
  if (listEl) {
    listEl.innerHTML = topList.map((item, idx) => `
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
    `).join("") || `<p style="color:var(--text-muted);margin:0;">No honors recorded yet.</p>`;
  }

  // 3. Academic Summary
  const all = Object.values(data.grades).flat();
  const count = st => all.filter(g => statusOf(calc(g)) === st).length;
  const summaryEl = $("performanceSummary");
  if (summaryEl) {
    summaryEl.innerHTML = `
      <p><b>General Average:</b> ${avgOf(all)}</p>
      <p><b>Passed Subject Records:</b> ${count("Passed")}</p>
      <p><b>Failed Subject Records:</b> ${count("Failed")}</p>
      <p><b>Dropped Subjects:</b> 0</p>`;
  }

  // 4. Performance by Subject Chart
  const subjectTotals = {};
  all.forEach(g => {
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
    chartEl.innerHTML = bars(subjectAverages);
  }
}