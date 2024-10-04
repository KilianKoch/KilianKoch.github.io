// scripts/navigation.js

/**
 * Handhabt das mobile Navigationsmenü und Smooth Scrolling.
 */
export function initializeNavigation() {
    // Navigation Toggle für Mobile
    const burger = document.querySelector(".burger");
    const navLinks = document.querySelector(".nav-links");
  
    burger.addEventListener("click", () => {
      navLinks.classList.toggle("nav-active");
      burger.classList.toggle("toggle");
    });
  
    // Smooth Scroll (Optional)
    const navLinksItems = document.querySelectorAll(".nav-links li a");
  
    navLinksItems.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (link.getAttribute("href").startsWith("#")) {
          event.preventDefault();
          const target = document.querySelector(link.getAttribute("href"));
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
            });
          }
        }
      });
    });
  }
  