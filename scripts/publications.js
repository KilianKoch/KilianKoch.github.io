// scripts/publications.js

import { fetchData, ArxiveGrabber } from "./datafetcher.js";
import { fetchAndNormalizeOrcidWorks } from "./orcid.js";
import { withTimedCallback } from "./utils.js";


/**
 * Generiert Publikationslisten und fügt sie dem Ziel-Element hinzu.
 * @param {Array} dataArray - Array von Publikationsobjekten.
 * @param {HTMLElement} targetElement - Das Container-Element, in das die Publikationen eingefügt werden.
 */
export function generatePublicationList(dataArray, targetElement) {
  targetElement.innerHTML = "";

  if (dataArray.length === 0) {
    const msg = document.createElement("div");
    msg.textContent = "Currently, I don't have any publications.";
    Object.assign(msg.style, {
      padding: "20px",
      textAlign: "center",
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      fontStyle: "italic"
    });
    targetElement.appendChild(msg);
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "publication-list";

  dataArray.forEach(pub => {
    const li = document.createElement("li");
    li.className = "publication-item";

    const title = document.createElement("div");
    title.className = "publication-title";
    title.textContent = pub.title;
    li.appendChild(title);

    const info = document.createElement("div");
    info.className = "publication-info";
    info.innerHTML = `${pub.journal} (${pub.date}) 
      <span class="publication-badge">${pub.type}</span>`;
    li.appendChild(info);

    if (pub.authors.length > 0) {
      const authors = document.createElement("div");
      authors.className = "publication-authors";
      authors.innerHTML = "By " + pub.authors.map(name => {
        return name === pub.highlightName
          ? `<strong>${name}</strong>`
          : name;
      }).join(", ");
      li.appendChild(authors);
    }

    // Read Online Button (oben)
    const link = document.createElement("a");
    link.href = pub.link;
    link.target = "_blank";
    link.className = "publication-link";
    link.textContent = "Read Online";
    li.appendChild(link);

    // Abstract & Show/Hide Toggle (unten)
    if (pub.abstract) {
      const actionRow = document.createElement("div");
      actionRow.className = "publication-actions";
    
      const toggle = document.createElement("button");
      toggle.className = "abstract-toggle";
      toggle.textContent = "Show Abstract";
    
      const abstract = document.createElement("div");
      abstract.className = "publication-abstract";
      abstract.textContent = pub.abstract;
      abstract.style.display = "none";
    
      toggle.onclick = () => {
        const isVisible = abstract.style.display === "block";
        abstract.style.display = isVisible ? "none" : "block";
        toggle.textContent = isVisible ? "Show Abstract" : "Hide Abstract";
      };
    
      actionRow.appendChild(toggle);
      li.appendChild(actionRow);
      li.appendChild(abstract);
    }
    

    ul.appendChild(li);
  });

  targetElement.appendChild(ul);
}




/**
 * Lädt und generiert die Publikationsliste.
 * @param {HTMLElement} targetElement - Das Container-Element, in das die Publikationen eingefügt werden.
 */
export async function loadAndGeneratePublications(targetElement) {
  await withTimedCallback(
    async () => {
      // Fetch the publications from arXiv, later if i have publications, lel
      // const arxivGrabber = new ArxiveGrabber("Kilian Koch");
      // const publications = await arxivGrabber.getPublications();

      const publications = await fetchAndNormalizeOrcidWorks("0009-0008-4358-9245");

      console.log("Geladene Publikationen:", publications); // Debugging

      // Generate the publication list
      generatePublicationList(publications, targetElement);
    },
    50, // Delay in milliseconds before the loader appears
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
