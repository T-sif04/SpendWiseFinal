/* THEME TOGGLE */
const toggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  toggle.textContent = "☀️";
}

toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  toggle.textContent = isDark ? "☀️" : "🌙";
});

/* HELP MODAL */
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");

if (helpBtn && helpModal) {
  helpBtn.addEventListener("click", () => {
    helpModal.classList.remove("hidden");
  });
}

if (closeHelp && helpModal) {
  closeHelp.addEventListener("click", () => {
    helpModal.classList.add("hidden");
  });
}