const form = document.getElementById("goalForm");
const goalsList = document.getElementById("goalsList");

const GOALS_KEY = "student_savings_goals";

// ── GET & SAVE GOALS
function getGoals() {
  return JSON.parse(localStorage.getItem(GOALS_KEY)) || [];
}

function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

// ── CALCULATE SAVINGS PER PERIOD
function calcPerPeriod(amount, duration, unit) {
  let periods = duration;
  if (unit === "years") periods = duration * 12;
  if (unit === "weeks") periods = duration / 4.33;
  return amount / periods;
}

function unitLabel(unit, duration) {
  if (unit === "weeks") return "week";
  if (unit === "years") return "month";
  return "month";
}

// ── RENDER ALL GOALS
function renderGoals() {
  const goals = getGoals();
  goalsList.innerHTML = "";

  if (goals.length === 0) {
    goalsList.innerHTML = `
      <div class="empty-state">
        <h3>No goals yet</h3>
        <p>Add your first savings goal above to get started!</p>
      </div>
    `;
    return;
  }

  goals.forEach((goal, index) => {
    const percent = Math.min((goal.saved / goal.amount) * 100, 100);
    const remaining = Math.max(goal.amount - goal.saved, 0);
    const perPeriod = calcPerPeriod(goal.amount, goal.duration, goal.unit);
    const label = unitLabel(goal.unit);
    const isComplete = goal.saved >= goal.amount;

    const card = document.createElement("div");
    card.className = `goal-card ${isComplete ? "goal-complete" : ""}`;
    card.innerHTML = `
      <div class="goal-card-header">
        <div class="goal-title-row">
          ${isComplete ? '<span class="goal-badge">✅ Complete</span>' : ""}
          <h3 class="goal-name">${goal.title}</h3>
        </div>
        <div class="goal-actions">
          <button class="delete-btn" data-index="${index}">✖</button>
        </div>
      </div>

      <div class="goal-stats">
        <div class="goal-stat">
          <span class="goal-stat-label">Target</span>
          <span class="goal-stat-value">£${goal.amount.toFixed(2)}</span>
        </div>
        <div class="goal-stat">
          <span class="goal-stat-label">Saved</span>
          <span class="goal-stat-value saved-value">£${goal.saved.toFixed(2)}</span>
        </div>
        <div class="goal-stat">
          <span class="goal-stat-label">Remaining</span>
          <span class="goal-stat-value">£${remaining.toFixed(2)}</span>
        </div>
        <div class="goal-stat">
          <span class="goal-stat-label">Save per ${label}</span>
          <span class="goal-stat-value">£${perPeriod.toFixed(2)}</span>
        </div>
      </div>

      <div class="goal-progress-header">
        <span>Progress</span>
        <span>${percent.toFixed(0)}%</span>
      </div>
      <div class="progress-bar">
        <div class="goal-fill" style="width: ${percent}%; background: ${isComplete ? "#22c55e" : "linear-gradient(90deg, #6366f1, #22c55e)"}"></div>
      </div>

      ${!isComplete ? `
      <div class="goal-update-row">
        <input type="number" class="update-input" placeholder="Add to savings (£)" min="0" data-index="${index}" />
        <button class="small-btn update-btn" data-index="${index}">+ Add</button>
      </div>
      ` : ""}

      <p class="goal-timeline">
        🗓 ${goal.duration} ${goal.unit} plan · £${perPeriod.toFixed(2)} per ${label}
      </p>
    `;

    goalsList.appendChild(card);
  });

  // ── DELETE GOAL
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const goals = getGoals();
      goals.splice(index, 1);
      saveGoals(goals);
      renderGoals();
    });
  });

  // ── UPDATE SAVED AMOUNT
  document.querySelectorAll(".update-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const input = document.querySelector(`.update-input[data-index="${index}"]`);
      const addAmount = Number(input.value);

      if (!addAmount || addAmount <= 0) {
        input.style.borderColor = "#ef4444";
        return;
      }

      const goals = getGoals();
      goals[index].saved = Math.min(goals[index].saved + addAmount, goals[index].amount);
      saveGoals(goals);
      renderGoals();
    });
  });
}

// ── ADD NEW GOAL
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("goalTitle").value.trim();
  const amount = Number(document.getElementById("goalAmount").value);
  const saved = Number(document.getElementById("savedAmount").value) || 0;
  const duration = Number(document.getElementById("duration").value);
  const unit = document.getElementById("timeUnit").value;

  if (!title || amount <= 0 || duration <= 0) {
    alert("Please fill in all fields correctly.");
    return;
  }

  if (saved > amount) {
    alert("Amount saved cannot exceed the target amount.");
    return;
  }

  const goals = getGoals();
  goals.push({ title, amount, saved, duration, unit });
  saveGoals(goals);

  form.reset();
  document.getElementById("savedAmount").value = "0";
  renderGoals();
});

// ── INIT
renderGoals();