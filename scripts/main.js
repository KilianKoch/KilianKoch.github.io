import { initializeNavigation } from './navigation.js';
import { loadAndGenerateProjects } from './projects.js';
import { loadAndGeneratePublications } from './publications.js';
import { toggleLanguage, toggleLanguageImpressum } from './languageToggle.js';

/**
 * Überprüft den aktuellen Seitennamen im gesamten Pfad.
 * @param {string} name - Der erwartete Name der Seite (z.B. "projects/koki" oder "").
 * @returns {boolean} - Ob der gesamte Pfad dem Namen exakt entspricht.
 */
function isPageName(name) {
  const pathname = window.location.pathname;
  const cleanPath = pathname.replace(/\/$/, ""); // Entfernt den letzten Slash, falls vorhanden

  if (cleanPath === '') {
    // Root path
    return name === '' || name.toLowerCase() === 'index';
  }

  // Exakter Vergleich des gesamten Pfads mit dem übergebenen Namen
  return cleanPath === `/${name}` || cleanPath === `/${name}.html`;
}




/**
 * Initialisiert die Seite basierend auf dem Seitennamen.
 */
async function initializePage() {
  switch (true) {
    case isPageName("index") || isPageName(""):
      const projectCards = document.querySelector(".project-cards");
      if (projectCards) {
        loadAndGenerateProjects(projectCards);
      }

      const publicationListIndex = document.querySelector(".publication-list");
      if (publicationListIndex) {
        loadAndGeneratePublications(publicationListIndex);
      }
      break;

    case isPageName("projects"):
      const projectsGrid = document.querySelector(".projects-grid");
      if (projectsGrid) {
        loadAndGenerateProjects(projectsGrid);
      }
      break;

    case isPageName("projects/koki"):
      const galleryData = [
        {
          src: "/images/KoKi/KoKi.svg",
          title: "KoKi Logo",
          description: "The official logo of the KoKi program.",
          alt: "KoKi Logo"
        },
        {
          src: "/images/KoKi/workFlowKoKi.webp",
          title: "Workflow Example",
          description: "Illustrates an example of the workflow where a customer is currently being called.",
          alt: "Workflow Example"
        },
        {
          src: "/images/KoKi/logInKoKi.webp",
          title: "Login Page",
          description: "Displays the login page of the application.",
          alt: "Login Page"
        },
        {
          src: "/images/KoKi/pdfKoKi.webp",
          title: "PDF Generation",
          description: "Demonstrates how a PDF can be generated using the provided customer data.",
          alt: "PDF Generation"
        },
        {
          src: "/images/KoKi/overviewKoKi.webp",
          title: "Overview Page",
          description: "Shows the status of the work already completed and the remaining tasks, with color-coded indicators.",
          alt: "Overview Page"
        },
        {
          src: "/images/KoKi/chatKoKi.webp",
          title: "Chat Interface",
          description: "Displays the internal chat interface for colleagues to communicate, such as sending customers or cars to each other or coordinating tasks.",
          alt: "Chat Interface"
        }
      ];
      
      const galleryContainer = document.querySelector(".gallery-container");
      const projectImages = document.querySelector("#project-images");
      import('./gallery.js').then(({ initializeGallery, createGallery }) => {
        if (galleryContainer) {
        initializeGallery(galleryData)
        }
        if(projectImages) {
          createGallery(galleryData,"#project-images");
        }
      });
      break;

    case isPageName("publications"):
      const publicationList = document.querySelector(".publication-list");
      if (publicationList) {
        loadAndGeneratePublications(publicationList);
      }
      break;

    default:
      // Optionale Behandlung für andere Seiten
      break;
  }
}

/**
 * Fügt Event Listener für Sprachumschaltung hinzu.
 */
function initializeLanguageToggle() {
  const btnDe = document.getElementById('btn-de');
  const btnEn = document.getElementById('btn-en');

  if (btnDe) {
    btnDe.addEventListener('click', () => {
      toggleLanguage('de');
      toggleLanguageImpressum('de');
    });
  }

  if (btnEn) {
    btnEn.addEventListener('click', () => {
      toggleLanguage('en');
      toggleLanguageImpressum('en');
    });
  }
}

/**
 * Event Listener für DOMContentLoaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializePage();
  initializeLanguageToggle();
});
