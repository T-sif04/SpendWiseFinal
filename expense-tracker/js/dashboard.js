const totalEl = document.getElementById("totalSpent");
const budgetEl = document.getElementById("monthlyBudget");
const remainingEl = document.getElementById("remainingBudget");
const toggleBtn = document.getElementById("toggleChart");
const alertBanner = document.getElementById("alertBanner");

const dashProgressFill = document.getElementById("dashProgressFill");
const budgetPercentEl = document.getElementById("budgetPercent");
const dashSpentEl = document.getElementById("dashSpent");
const dashRemainingEl = document.getElementById("dashRemaining");

const expenses = getExpenses();
const budget = getBudget();
const total = expenses.reduce((sum, e) => sum + e.amount, 0);

// ── SUMMARY CARDS
totalEl.textContent = `£${total.toFixed(2)}`;
budgetEl.textContent = `£${budget.toFixed(2)}`;
remainingEl.textContent = `£${(budget - total).toFixed(2)}`;

// ── BUDGET PROGRESS BAR
if (budget > 0) {
  const percent = Math.min((total / budget) * 100, 100);
  dashProgressFill.style.width = percent + "%";
  budgetPercentEl.textContent = percent.toFixed(0) + "%";
  dashSpentEl.textContent = `£${total.toFixed(2)}`;
  dashRemainingEl.textContent = `£${(budget - total).toFixed(2)}`;

  if (total > budget) {
    dashProgressFill.style.background = "#ef4444";
  } else if (percent >= 80) {
    dashProgressFill.style.background = "#f59e0b";
  } else {
    dashProgressFill.style.background = "linear-gradient(90deg, #22c55e, #4f46e5)";
  }
} else {
  budgetPercentEl.textContent = "No budget set";
}

// ── OVERSPENDING ALERT BANNER
if (budget > 0) {
  const percent = (total / budget) * 100;
  if (total > budget) {
    alertBanner.textContent = `⚠️ You have exceeded your monthly budget by £${(total - budget).toFixed(2)}! Consider reviewing your expenses.`;
    alertBanner.classList.remove("hidden", "alert-warning");
    alertBanner.classList.add("alert-danger");
  } else if (percent >= 80) {
    alertBanner.textContent = `🔔 Heads up! You've used ${percent.toFixed(0)}% of your budget. Only £${(budget - total).toFixed(2)} remaining.`;
    alertBanner.classList.remove("hidden", "alert-danger");
    alertBanner.classList.add("alert-warning");
  }
}

// ── RECENT EXPENSES
const recentList = document.getElementById("recentList");
const recent = expenses.slice().reverse().slice(0, 5);

if (recent.length === 0) {
  recentList.innerHTML = `<p class="no-recent">No expenses yet. <a href="add-expense.html">Add one!</a></p>`;
} else {
  recent.forEach((e) => {
    const item = document.createElement("div");
    item.className = "recent-item";
    item.innerHTML = `
      <div class="recent-left">
        <span class="badge ${e.category.toLowerCase()}">${e.category}</span>
        <span class="recent-title">${e.title}</span>
      </div>
      <div class="recent-right">
        <strong>£${e.amount.toFixed(2)}</strong>
        <small>${e.date}</small>
      </div>
    `;
    recentList.appendChild(item);
  });
}

// ── CATEGORY CHART
const categoryTotals = {};
expenses.forEach((e) => {
  categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
});

const labels = Object.keys(categoryTotals);
const values = Object.values(categoryTotals);

let chartType = "doughnut";
let chart;

function renderChart() {
  if (chart) chart.destroy();
  const ctx = document.getElementById("categoryChart");
  const initialData = chartType === "bar" ? values.map(() => 0) : values;

  chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels,
      datasets: [{
        data: initialData,
        backgroundColor: ["#6366F1","#22C55E","#F59E0B","#EF4444","#3B82F6","#8B5CF6","#EC4899"],
        borderRadius: chartType === "bar" ? 10 : 0,
      }],
    },
    options: {
      responsive: true,
      animation: { duration: 1200, easing: "easeOutQuart" },
      cutout: chartType === "doughnut" ? "65%" : 0,
      plugins: { legend: { position: "bottom" } },
      scales: chartType === "bar" ? {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 50, callback: (v) => `£${v}` }
        }
      } : {},
    },
  });

  if (chartType === "bar") {
    setTimeout(() => {
      chart.data.datasets[0].data = values;
      chart.update();
    }, 50);
  }
}

toggleBtn.addEventListener("click", () => {
  chartType = chartType === "doughnut" ? "bar" : "doughnut";
  renderChart();
});

renderChart();

// ── MONTHLY TREND CHART WITH MONTH SELECTOR

function getAvailableMonths() {
  const seen = new Set();
  const months = [];
  expenses.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!seen.has(key)) {
      seen.add(key);
      months.push({
        key,
        label: d.toLocaleString("default", { month: "long", year: "numeric" })
      });
    }
  });
  return months.sort((a, b) => b.key.localeCompare(a.key));
}

function buildWeekData(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const totals = [0, 0, 0, 0];

  expenses.forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      const weekIndex = Math.min(Math.floor((d.getDate() - 1) / 7), 3);
      totals[weekIndex] += e.amount;
    }
  });

  return totals;
}

const monthSelect = document.getElementById("trendMonthSelect");
const availableMonths = getAvailableMonths();

if (availableMonths.length === 0) {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = now.toLocaleString("default", { month: "long", year: "numeric" });
  monthSelect.appendChild(opt);
} else {
  availableMonths.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.key;
    opt.textContent = m.label;
    monthSelect.appendChild(opt);
  });
}

let trendChart;

function renderTrend(monthKey) {
  if (trendChart) trendChart.destroy();
  const weekTotals = buildWeekData(monthKey);

  trendChart = new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{
        label: "Spending (£)",
        data: weekTotals,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        borderWidth: 2,
        pointBackgroundColor: "#6366f1",
        pointRadius: 5,
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      animation: { duration: 1000, easing: "easeOutQuart" },
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 50, callback: (v) => `£${v}` }
        }
      },
    },
  });
}

renderTrend(monthSelect.value);

monthSelect.addEventListener("change", () => {
  renderTrend(monthSelect.value);
});