// scripts/projects.js

import { fetchData } from './datafetcher.js';

/**
 * Generiert Projektkarten und fügt sie dem Ziel-Element hinzu.
 * @param {Array} dataArray - Array von Projektobjekten.
 * @param {HTMLElement} targetElement - Das Container-Element, in das die Karten eingefügt werden.
 */
export function generateProjectCards(dataArray, targetElement) {
  targetElement.innerHTML = ""; // Vorhandenen Inhalt löschen

  if (dataArray.length === 0) {
    const noProjectsBox = document.createElement("div");
    noProjectsBox.textContent = "Currently, I don't have any projects.";
    noProjectsBox.style.padding = "20px";
    noProjectsBox.style.textAlign = "center";
    noProjectsBox.style.backgroundColor = "#f5f5f5";
    noProjectsBox.style.border = "1px solid #ddd";
    noProjectsBox.style.borderRadius = "8px";
    targetElement.appendChild(noProjectsBox);
    return;
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
    a.href = project.link ? `/projects/${project.link}` : '/projects/404';
    a.className = "btn";
    a.textContent = "Learn More";

    // Create a div for the tags
    const tagsDiv = document.createElement("div");
    tagsDiv.className = "tags";

    // Add each tag to the tagsDiv
    project.tags.forEach((tag) => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "tag";
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });

    cardContent.appendChild(h3);
    cardContent.appendChild(p);
    cardContent.appendChild(tagsDiv); // Append the tags div
    cardContent.appendChild(a);

    card.appendChild(img);
    card.appendChild(cardContent);

    targetElement.appendChild(card);
  });
}


/**
 * Lädt und generiert die Projektkarten.
 * @param {HTMLElement} targetElement - Das Container-Element, in das die Karten eingefügt werden.
 */
export async function loadAndGenerateProjects(targetElement) {
  // Create and show a loading spinner before fetching data
  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";

  // Append the spinner to the targetElement
  targetElement.appendChild(spinner);
  const projects = await fetchData('/data/projects.json');
  targetElement.removeChild(spinner); // Remove the spinner after fetching data
  console.log('Geladene Projekte:', projects); // Debugging
  generateProjectCards(projects, targetElement);
}
