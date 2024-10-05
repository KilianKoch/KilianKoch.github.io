import { initializeNavigation } from './navigation.js';
import { loadAndGenerateProjects } from './projects.js';
import { loadAndGeneratePublications } from './publications.js';
import { toggleLanguage, toggleLanguageImpressum } from './languageToggle.js';

/**
 * Überprüft den aktuellen Seitennamen im gesamten Pfad.
 * @param {string} name - Der erwartete Name der Seite.
 * @returns {boolean} - Ob der gesamte Pfad dem Namen exakt entspricht.
 */
function isPageName(name) {
  const pathname = window.location.pathname;
  const cleanPath = pathname.replace(/\/$/, ""); // Entfernt den letzten Slash, falls vorhanden

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
        await loadAndGenerateProjects(projectCards);
      }

      const publicationListIndex = document.querySelector(".publication-list");
      if (publicationListIndex) {
        await loadAndGeneratePublications(publicationListIndex);
      }
      break;

    case isPageName("projects"):
      const projectsGrid = document.querySelector(".projects-grid");
      if (projectsGrid) {
        await loadAndGenerateProjects(projectsGrid);
      }
      break;

    case isPageName("projects/koki"):
      const galleryContainer = document.querySelector(".gallery-container");
      if (galleryContainer) {
        import('./gallery.js').then(({ initializeGallery }) => {
          initializeGallery();
        });
      }
      break;

    case isPageName("publications"):
      const publicationList = document.querySelector(".publication-list");
      if (publicationList) {
        await loadAndGeneratePublications(publicationList);
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
