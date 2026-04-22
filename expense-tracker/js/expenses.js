const list = document.getElementById("expensesList");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const filterMonth = document.getElementById("filterMonth");
const clearBtn = document.getElementById("clearFilters");
const resultsCount = document.getElementById("resultsCount");
const resultsTotal = document.getElementById("resultsTotal");
const exportBtn = document.getElementById("export");

// ── POPULATE FILTER DROPDOWNS
function populateFilters() {
  const expenses = getExpenses();

  // Categories
  const categories = [...new Set(expenses.map((e) => e.category))];
  filterCategory.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterCategory.appendChild(opt);
  });

  // Months
  const monthKeys = [...new Set(expenses.map((e) => {
    const d = new Date(e.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }))].sort((a, b) => b.localeCompare(a));

  filterMonth.innerHTML = `<option value="all">All Months</option>`;
  monthKeys.forEach((key) => {
    const [year, month] = key.split("-");
    const label = new Date(year, month - 1).toLocaleString("default", {
      month: "long", year: "numeric"
    });
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = label;
    filterMonth.appendChild(opt);
  });
}

// ── FILTER LOGIC
function getFiltered() {
  const expenses = getExpenses();
  const search = searchInput.value.trim().toLowerCase();
  const category = filterCategory.value;
  const month = filterMonth.value;

  return expenses.filter((e) => {
    const matchSearch = !search || e.title.toLowerCase().includes(search);
    const matchCategory = category === "all" || e.category === category;
    const matchMonth = month === "all" || (() => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === month;
    })();
    return matchSearch && matchCategory && matchMonth;
  });
}

// ── RENDER EXPENSES
function renderExpenses() {
  const filtered = getFiltered();
  list.innerHTML = "";

  // Update results summary
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  resultsCount.textContent = `${filtered.length} expense${filtered.length !== 1 ? "s" : ""}`;
  resultsTotal.textContent = `Total: £${total.toFixed(2)}`;

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>No expenses found</h3>
        <p>Try adjusting your filters or add a new expense.</p>
        <a href="add-expense.html" class="primary-btn">Add Expense</a>
      </div>
    `;
    return;
  }

  filtered.slice().reverse().forEach((e) => {
    const card = document.createElement("div");
    card.className = "expense-card";
    card.innerHTML = `
      <div class="expense-info">
        <h4>${e.title}</h4>
        <span class="badge ${e.category.toLowerCase()}">${e.category}</span>
        <small>${e.date}</small>
      </div>
      <div class="expense-actions">
        <strong>£${e.amount.toFixed(2)}</strong>
        <button class="delete-btn">✖</button>
      </div>
    `;

    card.querySelector(".delete-btn").addEventListener("click", () => {
      card.style.opacity = "0";
      card.style.transform = "translateX(20px)";
      card.style.transition = "all 0.3s ease";
      setTimeout(() => {
        deleteExpense(e.id);
      }, 300);
    });

    list.appendChild(card);
  });
}

function deleteExpense(id) {
  let expenses = getExpenses();
  expenses = expenses.filter((e) => e.id !== id);
  saveExpenses(expenses);
  populateFilters();
  renderExpenses();
}

// ── EXCEL EXPORT
exportBtn.addEventListener("click", () => {
  const filtered = getFiltered();

  if (filtered.length === 0) {
    alert("No expenses to export.");
    return;
  }

  const data = filtered.map((e) => ({
    Title: e.title,
    Amount: `£${e.amount.toFixed(2)}`,
    Category: e.category,
    Date: e.date,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

  // Style column widths
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
  ];

  XLSX.writeFile(workbook, "SpendWise_Expenses.xlsx");
});

// ── CLEAR FILTERS
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterCategory.value = "all";
  filterMonth.value = "all";
  renderExpenses();
});

// ── LIVE FILTER ON INPUT
searchInput.addEventListener("input", renderExpenses);
filterCategory.addEventListener("change", renderExpenses);
filterMonth.addEventListener("change", renderExpenses);

// ── INIT
populateFilters();
renderExpenses();