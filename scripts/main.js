import { initializeNavigation } from './navigation.js';
import { loadAndGenerateProjects } from './projects.js';
import { loadAndGeneratePublications } from './publications.js';
import { toggleLanguage, toggleLanguageImpressum } from './languageToggle.js';

/**
 * Überprüft den aktuellen Seitennamen.
 * @param {string} name - Der erwartete Name der Seite.
 * @returns {boolean} - Ob die aktuelle Seite dem Namen entspricht.
 */
function isPageName(name) {
  const pathname = window.location.pathname;
  const segments = pathname.split("/").filter(Boolean); // Split und leere Segmente filtern
  const lastSegment = segments[segments.length - 1] || ""; // Letztes Segment oder leere Zeichenkette

  // Überprüfen, ob das letzte Segment dem Namen entspricht oder dem Namen mit .html
  return lastSegment === name || lastSegment === `${name}.html`;
}

/**
 * Initialisiert die Seite basierend auf dem Seitennamen.
 */
async function initializePage() {
  if (isPageName("index") || isPageName("")) {
    const projectCards = document.querySelector(".project-cards");
    if (projectCards) {
      await loadAndGenerateProjects(projectCards);
    }

    const publicationList = document.querySelector(".publication-list");
    if (publicationList) {
      await loadAndGeneratePublications(publicationList);
    }
  } else if (isPageName("projects")) {
    const projectsGrid = document.querySelector(".projects-grid");
    if (projectsGrid) {
      await loadAndGenerateProjects(projectsGrid);
    }
  } else if (isPageName("publications")) {
    const publicationList = document.querySelector(".publication-list");
    if (publicationList) {
      await loadAndGeneratePublications(publicationList);
    }
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
