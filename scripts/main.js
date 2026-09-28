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
    { src: "/images/KoKi/koki-fahrzeug.webp", title: "Vehicle Record",
      description: "Main view of a vehicle: master data, calculated appointments, data-protection status and recent activity.",
      alt: "KoKi vehicle record" },
    { src: "/images/KoKi/koki-kundenfahrzeuge.webp", title: "All Vehicles of a Customer",
      description: "Hover card listing every vehicle of the same customer with its status.",
      alt: "KoKi hover card with all vehicles of a customer" },
    { src: "/images/KoKi/koki-terminlogik.webp", title: "How Was the Date Calculated?",
      description: "Decision graph explaining step by step how an inspection date came about.",
      alt: "KoKi decision graph for an inspection date" },
    { src: "/images/KoKi/koki-historie.webp", title: "Vehicle History",
      description: "Complete history of all changes to a vehicle, by user and date.",
      alt: "KoKi vehicle history" },
    { src: "/images/KoKi/koki-vorlagen.webp", title: "SMS, Email & PDF",
      description: "Messages and documents from templates, with placeholders filled from the customer data.",
      alt: "KoKi SMS, email and PDF templates" },
    { src: "/images/KoKi/koki-kalender.webp", title: "Calendar & Notes",
      description: "Notes calendar with reminders, searchable by user and date.",
      alt: "KoKi calendar and notes" },
    { src: "/images/KoKi/koki-chat.webp", title: "Internal Chat",
      description: "Built-in chat for staff, e.g. to hand over customers or coordinate tasks.",
      alt: "KoKi internal chat" },
    { src: "/images/KoKi/koki-arbeitsuebersicht.webp", title: "Work Overview",
      description: "Open, in-progress and completed tasks, filterable by month, year, type, branch and status.",
      alt: "KoKi work overview" },
    { src: "/images/KoKi/koki-statistik.webp", title: "Statistics",
      description: "Monthly trends with median, mean, standard deviation and a linear trend line.",
      alt: "KoKi statistics" },
    { src: "/images/KoKi/koki-serverupdates.webp", title: "Weekly Sync Log",
      description: "Log of the weekly DMS reconciliation with duration, key figures and errors.",
      alt: "KoKi weekly sync log" },
    { src: "/images/KoKi/KoKi.svg", title: "Logo",
      description: "The KoKi logo.",
      alt: "KoKi logo" }
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
