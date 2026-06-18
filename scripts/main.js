import { initializeNavigation } from './navigation.js';

/**
 * Initialisiert seitenspezifisches Verhalten. Die KoKi-Galerie wird überall
 * dort aufgebaut, wo ein #project-images-Element vorhanden ist (Software-
 * Seite in allen Sprachen) – sprachunabhängig, ohne Pfad-Prüfung.
 */
async function initializePage() {
  const projectImages = document.querySelector("#project-images");
  if (!projectImages) return;

  const galleryData = [
    {
      src: "/images/KoKi/overviewKoKi.webp",
      title: "Overview",
      description: "Status of completed and remaining tasks, with colour-coded indicators.",
      alt: "KoKi overview page"
    },
    {
      src: "/images/KoKi/workFlowKoKi.webp",
      title: "Workflow",
      description: "An example workflow while a customer is being called.",
      alt: "KoKi workflow example"
    },
    {
      src: "/images/KoKi/pdfKoKi.webp",
      title: "PDF Generation",
      description: "Automatic generation of a PDF from the stored customer data.",
      alt: "KoKi PDF generation"
    },
    {
      src: "/images/KoKi/chatKoKi.webp",
      title: "Internal Chat",
      description: "Built-in chat for staff, e.g. to hand over customers or cars and coordinate tasks.",
      alt: "KoKi chat interface"
    },
    {
      src: "/images/KoKi/logInKoKi.webp",
      title: "Login",
      description: "The login screen of the application.",
      alt: "KoKi login page"
    },
    {
      src: "/images/KoKi/KoKi.svg",
      title: "Logo",
      description: "The KoKi logo.",
      alt: "KoKi logo"
    }
  ];

  import('./gallery.js').then(({ createGallery }) => {
    createGallery(galleryData, "#project-images");
  });
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
  initializeLangSwitcher();
  initializePrintDetails();
});
