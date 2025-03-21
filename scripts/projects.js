// scripts/projects.js

import { fetchData } from './datafetcher.js';
import { withTimedCallback } from './utils.js';

/**
 * Generiert Projektkarten und fügt sie dem Ziel-Element hinzu.
 * @param {Array} dataArray - Array von Projektobjekten.
 * @param {HTMLElement} targetElement - Das Container-Element, in das die Karten eingefügt werden.
 */
export function generateProjectCards(dataArray, targetElement) {
  targetElement.innerHTML = ""; // Vorhandenen Inhalt löschen

  const softwareContainer = document.createElement("div");
  softwareContainer.className = "project-container software";

  const researchContainer = document.createElement("div");
  researchContainer.className = "project-container research";

  const softwareHeader = document.createElement("h2");
  softwareHeader.textContent = "Software Projects";
  softwareContainer.appendChild(softwareHeader);

  const researchHeader = document.createElement("h2");
  researchHeader.textContent = "Research Projects";
  researchContainer.appendChild(researchHeader);

  const hasSoftware = dataArray.some((project) => project.type === "software");
  const hasResearch = dataArray.some((project) => project.type === "research");

  if (!hasSoftware) {
    const noSoftwareBox = document.createElement("div");
    noSoftwareBox.textContent = "Currently, I don't have any software projects.";
    noSoftwareBox.className = "no-projects-box";
    softwareContainer.appendChild(noSoftwareBox);
  }

  if (!hasResearch) {
    const noResearchBox = document.createElement("div");
    noResearchBox.textContent = "Currently, I don't have any research projects.";
    noResearchBox.className = "no-projects-box";
    researchContainer.appendChild(noResearchBox);
  }

  dataArray.forEach((project) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = project.image;
    img.alt = project.title;

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    const h3 = document.createElement("h3");
    h3.textContent = project.title;

    const p = document.createElement("p");
    p.textContent = project.description;

    const a = document.createElement("a");
    a.href = project.link.url;
    a.className = "btn";
    a.textContent = "Learn More";
    a.target = project.link.type === "external" ? "_blank" : "_self";

    const tagsDiv = document.createElement("div");
    tagsDiv.className = "tags";

    project.tags.forEach((tag) => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "tag";
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });

    cardContent.appendChild(h3);
    cardContent.appendChild(p);
    cardContent.appendChild(tagsDiv);
    cardContent.appendChild(a);

    card.appendChild(img);
    card.appendChild(cardContent);

    if (project.type === "software") {
      softwareContainer.appendChild(card);
    } else if (project.type === "research") {
      researchContainer.appendChild(card);
    }
  });

  targetElement.appendChild(softwareContainer);
  targetElement.appendChild(researchContainer);
}



/**
 * Lädt und generiert die Projektkarten.
 * @param {HTMLElement} targetElement - Das Container-Element, in das die Karten eingefügt werden.
 */
export async function loadAndGenerateProjects(targetElement) {
  await withTimedCallback(
      async () => {
          const projects = await fetchData("/data/projects.json");
          console.log("Geladene Projekte:", projects); // Debugging
          generateProjectCards(projects, targetElement);
      },
      50, // Delay in milliseconds before showing the loader
      () => {
          // Create and show a loading spinner
          const spinner = document.createElement("div");
          spinner.className = "loading-spinner";
          targetElement.appendChild(spinner);
          return spinner;
      },
      (loader) => {
          // Remove the spinner only if it still exists inside targetElement
          if (loader && targetElement.contains(loader)) {
              targetElement.removeChild(loader);
          }
      }
  );
}
