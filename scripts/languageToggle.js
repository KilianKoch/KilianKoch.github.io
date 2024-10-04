// scripts/languageToggle.js

/**
 * Schaltet die Sprache für den Datenschutz um.
 * @param {string} lang - Die gewünschte Sprache ('de' oder 'en').
 */
export function toggleLanguage(lang) {
    const deSection = document.getElementById("datenschutz-de");
    const enSection = document.getElementById("privacy-policy-en");
  
    if (deSection && enSection) {
      if (lang === "de") {
        deSection.style.display = "block";
        enSection.style.display = "none";
      } else {
        deSection.style.display = "none";
        enSection.style.display = "block";
      }
    }
  }
  
  /**
   * Schaltet die Sprache für das Impressum um.
   * @param {string} lang - Die gewünschte Sprache ('de' oder 'en').
   */
  export function toggleLanguageImpressum(lang) {
    const deSection = document.getElementById("impressum-de");
    const enSection = document.getElementById("impressum-en");
  
    if (deSection && enSection) {
      if (lang === "de") {
        deSection.style.display = "block";
        enSection.style.display = "none";
      } else {
        deSection.style.display = "none";
        enSection.style.display = "block";
      }
    }
  }
  