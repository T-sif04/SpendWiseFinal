const form = document.getElementById("expenseForm");
const categorySelect = document.getElementById("category");
const customBox = document.getElementById("customCategoryBox");
const newCategoryInput = document.getElementById("newCategory");
const dateInput = document.getElementById("date");
const successMsg = document.getElementById("successMsg");

// ── SET TODAY'S DATE
dateInput.value = new Date().toISOString().split("T")[0];

// ── LOAD CATEGORIES
function loadCategories() {
  const categories = getCategories();
  categorySelect.innerHTML = "";

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  const customOption = document.createElement("option");
  customOption.value = "custom";
  customOption.textContent = "+ Add New Category";
  categorySelect.appendChild(customOption);
}

loadCategories();

// ── SHOW CUSTOM CATEGORY BOX
categorySelect.addEventListener("change", () => {
  customBox.classList.toggle("hidden", categorySelect.value !== "custom");
});

// ── QUICK STATS
function loadQuickStats() {
  const expenses = getExpenses();
  const budget = getBudget();
  const now = new Date();

  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const total = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  document.getElementById("qTotal").textContent = `£${total.toFixed(2)}`;
  document.getElementById("qCount").textContent = thisMonth.length;
  document.getElementById("qRemaining").textContent = `£${Math.max(budget - total, 0).toFixed(2)}`;
}

loadQuickStats();

// ── FORM VALIDATION HELPERS
function setError(inputId, msg) {
  const input = document.getElementById(inputId);
  input.style.borderColor = "#ef4444";
  let hint = input.parentElement.querySelector(".error-hint");
  if (!hint) {
    hint = document.createElement("span");
    hint.className = "error-hint";
    input.parentElement.appendChild(hint);
  }
  hint.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll(".error-hint").forEach((el) => el.remove());
  document.querySelectorAll("input, select").forEach((el) => {
    el.style.borderColor = "";
  });
}

// ── TOAST NOTIFICATION
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast toast-${type}`;
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// ── SUBMIT FORM
form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearErrors();

  const title = document.getElementById("title").value.trim();
  const amount = Number(document.getElementById("amount").value);
  let category = categorySelect.value;
  const date = dateInput.value;

  let hasError = false;

  if (!title) {
    setError("title", "Please enter a title.");
    hasError = true;
  }

  if (!amount || amount <= 0) {
    setError("amount", "Please enter a valid amount.");
    hasError = true;
  }

  if (category === "custom") {
    category = newCategoryInput.value.trim();
    if (!category) {
      setError("newCategory", "Please enter a category name.");
      hasError = true;
    } else {
      saveCategory(category);
    }
  }

  if (hasError) return;

  const expenses = getExpenses();
  expenses.push({ id: Date.now(), title, amount, category, date });
  saveExpenses(expenses);

  // Show success
  successMsg.classList.remove("hidden");
  showToast("✅ Expense added successfully!");

  // Reset form
  form.reset();
  customBox.classList.add("hidden");
  dateInput.value = new Date().toISOString().split("T")[0];
  loadCategories();
  loadQuickStats();

  setTimeout(() => successMsg.classList.add("hidden"), 4000);
});