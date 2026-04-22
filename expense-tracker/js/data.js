const EXPENSE_KEY = "student_expenses";
const BUDGET_KEY = "student_budget";
const CATEGORY_KEY = "student_categories";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Rent",
  "Other",
];

function getExpenses() {
  return JSON.parse(localStorage.getItem(EXPENSE_KEY)) || [];
}

function saveExpenses(expenses) {
  localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
}

function getBudget() {
  return Number(localStorage.getItem(BUDGET_KEY)) || 0;
}

function saveBudget(amount) {
  localStorage.setItem(BUDGET_KEY, amount);
}

/* ✅ CATEGORY HANDLING */

function getCategories() {
  const stored = JSON.parse(localStorage.getItem(CATEGORY_KEY));
  if (stored && stored.length) return stored;

  localStorage.setItem(
    CATEGORY_KEY,
    JSON.stringify(DEFAULT_CATEGORIES)
  );
  return DEFAULT_CATEGORIES;
}

function saveCategory(category) {
  const categories = getCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    localStorage.setItem(
      CATEGORY_KEY,
      JSON.stringify(categories)
    );
  }
}