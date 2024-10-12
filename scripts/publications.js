// scripts/publications.js

import { fetchData, ArxiveGrabber } from "./datafetcher.js";


/**
 * Generiert Publikationslisten und fügt sie dem Ziel-Element hinzu.
 * @param {Array} dataArray - Array von Publikationsobjekten.
 * @param {HTMLElement} targetElement - Das Container-Element, in das die Publikationen eingefügt werden.
 */
export function generatePublicationList(dataArray, targetElement) {
  targetElement.innerHTML = ""; // Vorhandenen Inhalt löschen

  if (dataArray.length === 0) {
    const noPublicationsBox = document.createElement("div");
    noPublicationsBox.textContent = "Currently, I don't have any publications.";
    noPublicationsBox.style.padding = "20px";
    noPublicationsBox.style.textAlign = "center";
    noPublicationsBox.style.backgroundColor = "#f5f5f5";
    noPublicationsBox.style.border = "1px solid #ddd";
    noPublicationsBox.style.borderRadius = "8px";
    targetElement.appendChild(noPublicationsBox);
    return;
  }

  const ul = document.createElement("ul");
  ul.style.listStyleType = "none"; // Entferne Standard-Aufzählungszeichen
  ul.style.padding = "0"; // Entferne Standard-Polsterung

  dataArray.forEach((pub) => {
    const li = document.createElement("li");
    li.style.marginBottom = "20px"; // Abstand zwischen den Einträgen

    // Titel und Journal-Info
    const strong = document.createElement("strong");
    strong.textContent = pub.title;

    const journalInfo = document.createTextNode(
      ` - ${pub.journal}, ${pub.year}.`
    );

    li.appendChild(strong);
    li.appendChild(journalInfo);

    // Inhaltsabsatz
    const pContent = document.createElement("p");
    if (pub.equation) {
      // Wenn es eine Gleichung gibt, füge sie hinzu
      pContent.innerHTML = `$$${pub.equation}$$`;
    } else if (pub.abstract) {
      // Wenn es ein Abstract gibt, füge es hinzu
      pContent.textContent = pub.abstract;
    } else if (pub.content) {
      // Andernfalls füge anderen Inhalt hinzu
      pContent.textContent = pub.content;
    }

    if (pContent.textContent || pContent.innerHTML) {
      li.appendChild(pContent);
    }

    // "Mehr Lesen"-Link
    const a = document.createElement("a");
    a.href = pub.link;
    a.className = "btn";
    a.textContent = "Learn More";
    a.target = "_blank"; // Öffnet den Link in einem neuen Tab

    li.appendChild(a);
    ul.appendChild(li);
  });

  targetElement.appendChild(ul);

  // MathJax erneut rendern, falls verwendet
  if (typeof MathJax !== "undefined") {
    MathJax.typesetPromise();
  }
}

/**
 * Lädt und generiert die Publikationsliste.
 * @param {HTMLElement} targetElement - Das Container-Element, in das die Publikationen eingefügt werden.
 */
export async function loadAndGeneratePublications(targetElement) {
  // Create and show a loading spinner before fetching data
  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";

  // Append the spinner to the targetElement
  targetElement.appendChild(spinner);

  console.log("Lade Publikationen..."); // Debugging

  // Fetch the publications from arXiv, later if i have publications, lel
  // const arxivGrabber = new ArxiveGrabber("Kilian Koch");
  // const publications = await arxivGrabber.getPublications();

  const publications = await fetchData("publication.json");

  // Remove the spinner once the publications are loaded
  targetElement.removeChild(spinner);

  console.log("Geladene Publikationen:", publications); // Debugging

  // Generate the publication list
  generatePublicationList(publications, targetElement);
}
