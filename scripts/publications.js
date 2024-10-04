// scripts/publications.js

import { fetchData } from './datafetcher.js';

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

  dataArray.forEach((pub) => {
    const li = document.createElement("li");

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
    a.textContent = "Mehr Lesen";

    li.appendChild(a);
    targetElement.appendChild(li);
  });

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
  const publications = await fetchData('/data/publications.json');
  console.log('Geladene Publikationen:', publications); // Debugging
  generatePublicationList(publications, targetElement);
}
