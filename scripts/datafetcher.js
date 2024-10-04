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
  