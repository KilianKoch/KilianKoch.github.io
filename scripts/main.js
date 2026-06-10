import { initializeNavigation } from './navigation.js';
import { toggleLanguage, toggleLanguageImpressum } from './languageToggle.js';

/**
 * Überprüft den aktuellen Seitennamen im gesamten Pfad.
 * @param {string} name - Der erwartete Name der Seite (z.B. "projects/koki" oder "").
 * @returns {boolean} - Ob der gesamte Pfad dem Namen exakt entspricht.
 */
function isPageName(name) {
  const pathname = window.location.pathname;
  const cleanPath = pathname.replace(/\/$/, "");

  if (cleanPath === '') {
    return name === '' || name.toLowerCase() === 'index';
  }

  return cleanPath === `/${name}` || cleanPath === `/${name}.html`;
}

/**
 * Initialisiert seitenspezifisches Verhalten (nur noch die KoKi-Galerie –
 * Publikationen, Talks und Projekte werden beim Build statisch gerendert).
 */
async function initializePage() {
  if (isPageName("projects/koki")) {
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
        initializeGallery(galleryData);
      }
      if (projectImages) {
        createGallery(galleryData, "#project-images");
      }
    });
  }
}

/**
 * Fügt Event Listener für die Sprachumschaltung (Impressum/Datenschutz) hinzu.
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
 * Öffnet alle <details>-Blöcke fürs Drucken/PDF (und schließt sie danach
 * wieder). Mit ?pdf in der URL sind sie von Anfang an offen — das nutzt
 * die automatische PDF-Generierung im Build.
 */
function initializePrintDetails() {
  const allDetails = () => document.querySelectorAll("details:not(.lang-switcher)");

  if (new URLSearchParams(window.location.search).has("pdf")) {
    allDetails().forEach((d) => (d.open = true));
    return;
  }

  let openedForPrint = [];
  window.addEventListener("beforeprint", () => {
    openedForPrint = [...allDetails()].filter((d) => !d.open);
    openedForPrint.forEach((d) => (d.open = true));
  });
  window.addEventListener("afterprint", () => {
    openedForPrint.forEach((d) => (d.open = false));
    openedForPrint = [];
  });
}

/**
 * Schließt das Sprach-Dropdown, wenn außerhalb geklickt wird.
 */
function initializeLangSwitcher() {
  const switcher = document.querySelector("details.lang-switcher");
  if (!switcher) return;
  document.addEventListener("click", (event) => {
    if (switcher.open && !switcher.contains(event.target)) {
      switcher.open = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializePage();
  initializeLanguageToggle();
  initializeLangSwitcher();
  initializePrintDetails();
});
