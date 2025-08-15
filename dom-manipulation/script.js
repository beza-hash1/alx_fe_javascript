document.addEventListener("DOMContentLoaded", () => {
  const heroContent = document.querySelector(".hero-content");

  // Create IntersectionObserver to watch hero section
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          heroContent.classList.add("visible");
        } else {
          heroContent.classList.remove("visible");
        }
      });
    },
    {
      threshold: 0.5, // 50% visible before triggering
    }
  );

  observer.observe(heroContent);
});
