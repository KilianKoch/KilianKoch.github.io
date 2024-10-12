// scripts/dataFetcher.js

/**
 * Holt Daten von der angegebenen URL.
 * @param {string} url - Die URL der JSON-Datei.
 * @returns {Promise<Array>} - Ein Promise, das ein Array von Datenobjekten zurückgibt.
 */
export async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fehler beim Abrufen der Daten von ${url}:`, error);
    return [];
  }
}

/**
 * ArxiveGrabber Klasse zum Abrufen und Verarbeiten von Publikationen eines Autors von arXiv.
 */
export class ArxiveGrabber {
  /**
   * Konstruktor für ArxiveGrabber.
   * @param {string} authorName - Der vollständige Name des Autors, z.B. "Christof Melcher".
   */
  constructor(authorName) {
    this.authorName = authorName;
    this.apiUrl = `https://export.arxiv.org/api/query?search_query=au:"${encodeURIComponent(
      authorName
    )}"&start=0&max_results=100`;
  }

  /**
   * Holt die Publikationen von arXiv.
   * @returns {Promise<string>} - Die XML-Antwort von arXiv.
   */
  async fetchPublications() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`Netzwerkantwort war nicht ok: ${response.statusText}`);
      }
      const xmlText = await response.text();
      return xmlText;
    } catch (error) {
      console.error("Fehler beim Abrufen der Publikationen:", error);
      return null;
    }
  }

  /**
   * Parst die XML-Antwort und filtert nach dem angegebenen Autorennamen.
   * @param {string} xml - Die XML-Antwort von arXiv.
   * @returns {Array} - Gefiltertes Array von Publikationsobjekten.
   */
  parsePublications(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");
    const entries = xmlDoc.getElementsByTagName("entry");
    const publications = [];

    for (let entry of entries) {
      const authors = entry.getElementsByTagName("author");
      let authorMatch = false;

      // Überprüfe, ob einer der Autoren genau "Christof Melcher" ist
      for (let author of authors) {
        const name = author.getElementsByTagName("name")[0].textContent.trim();
        if (name.toLowerCase() === this.authorName.toLowerCase()) {
          authorMatch = true;
          break;
        }
      }

      if (!authorMatch) {
        continue; // Überspringe diese Publikation, wenn der Autor nicht übereinstimmt
      }

      const title = entry.getElementsByTagName("title")[0].textContent.trim();
      const published = entry.getElementsByTagName("published")[0].textContent;
      const year = new Date(published).getFullYear();
      const id = entry.getElementsByTagName("id")[0].textContent;
      const link = id.replace("abs", "pdf"); // Link zum PDF
      const summary = entry
        .getElementsByTagName("summary")[0]
        .textContent.trim();
      const categories = entry.getElementsByTagName("category");
      const primaryCategory =
        categories.length > 0
          ? categories[0].getAttribute("term")
          : "arXiv preprint";

      publications.push({
        title: title,
        journal: primaryCategory,
        year: year,
        link: link,
        abstract: summary,
        // Optional: Weitere Felder wie 'equation' oder 'content' können hier hinzugefügt werden
      });
    }

    return publications;
  }

  /**
   * Holt und parst die Publikationen.
   * @returns {Promise<Array>} - Das formatierte Array von Publikationsobjekten.
   */
  async getPublications() {
    const xml = await this.fetchPublications();
    if (xml) {
      return this.parsePublications(xml);
    }
    return [];
  }
}
