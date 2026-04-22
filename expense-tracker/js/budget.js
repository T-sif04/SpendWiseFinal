const input = document.getElementById("budgetInput");
const spentEl = document.getElementById("spentAmount");
const remainingEl = document.getElementById("remainingAmount");
const fill = document.getElementById("progressFill");
const message = document.getElementById("budgetMessage");
const budgetAlert = document.getElementById("budgetAlert");
const budgetPercentEl = document.getElementById("budgetPercent");

const expenses = getExpenses();
const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
const budget = getBudget();

input.value = budget || "";

// ── PROGRESS BAR
function updateProgress(budget, spent) {
  if (!budget) {
    budgetPercentEl.textContent = "No budget set";
    return;
  }

  const percent = Math.min((spent / budget) * 100, 100);
  fill.style.width = percent + "%";
  budgetPercentEl.textContent = percent.toFixed(0) + "%";
  spentEl.textContent = `£${spent.toFixed(2)}`;
  remainingEl.textContent = `£${(budget - spent).toFixed(2)}`;

  if (spent > budget) {
    fill.style.background = "#ef4444";
    message.textContent = "⚠️ You have exceeded your budget!";
    message.style.color = "#ef4444";
    showAlert("danger", `You are £${(spent - budget).toFixed(2)} over your budget! Try to cut back on non-essential spending.`);
  } else if (percent >= 80) {
    fill.style.background = "#f59e0b";
    message.textContent = "🔔 You are close to your budget limit!";
    message.style.color = "#f59e0b";
    showAlert("warning", `You've used ${percent.toFixed(0)}% of your budget. Only £${(budget - spent).toFixed(2)} remaining.`);
  } else {
    fill.style.background = "linear-gradient(90deg, #22c55e, #4f46e5)";
    message.textContent = "✅ You are within your budget.";
    message.style.color = "#22c55e";
  }
}

function showAlert(type, msg) {
  budgetAlert.textContent = msg;
  budgetAlert.className = `budget-alert budget-alert-${type}`;
}

updateProgress(budget, totalSpent);

// ── SAVE BUDGET
document.getElementById("saveBudget").addEventListener("click", () => {
  const value = Number(input.value);
  if (value <= 0) {
    showAlert("danger", "Please enter a valid budget amount.");
    return;
  }
  saveBudget(value);
  location.reload();
});

// ── CATEGORY BREAKDOWN
const categoryTotals = {};
expenses.forEach((e) => {
  categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
});

const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
const breakdownList = document.getElementById("categoryBreakdown");
const colors = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899"];

if (sorted.length === 0) {
  breakdownList.innerHTML = `<p style="color:var(--muted); font-size:0.88rem;">No expenses yet. Add some to see your breakdown.</p>`;
} else {
  sorted.forEach(([category, amount], i) => {
    const percent = budget > 0 ? Math.min((amount / budget) * 100, 100) : 0;
    const color = colors[i % colors.length];

    const item = document.createElement("div");
    item.className = "breakdown-item";
    item.innerHTML = `
      <div class="breakdown-header">
        <div class="breakdown-left">
          <span class="breakdown-dot" style="background:${color}"></span>
          <span class="breakdown-name">${category}</span>
        </div>
        <div class="breakdown-right">
          <span class="breakdown-amount">£${amount.toFixed(2)}</span>
          <span class="breakdown-percent">${budget > 0 ? percent.toFixed(0) + "% of budget" : ""}</span>
        </div>
      </div>
      <div class="progress-bar" style="margin-top:0.4rem; height:8px;">
        <div style="width:${percent}%; background:${color}; height:100%; border-radius:999px; transition: width 1s ease;"></div>
      </div>
    `;
    breakdownList.appendChild(item);
  });
}

// ── SMART TIP
function generateTip() {
  if (sorted.length === 0) return "Start adding expenses to get personalised tips!";

  const topCategory = sorted[0][0];
  const topAmount = sorted[0][1];
  const percent = budget > 0 ? (totalSpent / budget) * 100 : 0;

  if (totalSpent > budget && budget > 0) {
    return `You've exceeded your budget this month. Your biggest expense is ${topCategory} at £${topAmount.toFixed(2)}. Consider setting a category limit next month.`;
  } else if (percent >= 80 && budget > 0) {
    return `You're close to your limit! ${topCategory} is your top spend at £${topAmount.toFixed(2)}. Try to hold off on non-essential purchases.`;
  } else if (sorted.length >= 2) {
    const second = sorted[1][0];
    return `Your top two spending categories are ${topCategory} (£${sorted[0][1].toFixed(2)}) and ${second} (£${sorted[1][1].toFixed(2)}). Focus on reducing one to stay on track.`;
  } else {
    return `Your main expense is ${topCategory} at £${topAmount.toFixed(2)}. Keep tracking to build a clearer picture of your spending habits.`;
  }
}

document.getElementById("smartTip").textContent = generateTip();