document.addEventListener("DOMContentLoaded", () => {
  // Highlight active sidebar link
  const currentPath = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".sidebar ul li a");
  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Card click navigation
  document.querySelectorAll(".cards .card").forEach(card => {
    card.addEventListener("click", () => {
      const page = card.dataset.page;
      if (page) window.location.href = page;
    });
  });
});
