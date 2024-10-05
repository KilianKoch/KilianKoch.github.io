// gallery.js

export function initializeGallery() {
    const galleryData = [
      {
        src: "/images/Dashboard.webp",
        alt: "KoKi Dashboard",
        title: "KoKi Dashboard",
      },
      {
        src: "/images/Settings.webp",
        alt: "KoKi Settings",
        title: "KoKi Settings",
      },
      {
        src: "/images/Chat.webp",
        alt: "KoKi Chat",
        title: "KoKi Chat",
      },
      // Weitere Bilder hinzufügen
    ];
  
    // Galerie dynamisch erstellen
    const galleryContainer = document.querySelector(".gallery-container");
    galleryData.forEach((imageData, index) => {
      const galleryItem = document.createElement("div");
      galleryItem.classList.add("gallery-item");
  
      const img = document.createElement("img");
      img.src = imageData.src;
      img.alt = imageData.alt;
      img.dataset.index = index; // Speichert den Index für die Lightbox
  
      const titleOverlay = document.createElement("div");
      titleOverlay.classList.add("title-overlay");
      titleOverlay.textContent = imageData.title;
  
      galleryItem.appendChild(img);
      galleryItem.appendChild(titleOverlay);
      galleryContainer.appendChild(galleryItem);
    });
  
    const images = galleryData;
  
    // Lightbox-Elemente erstellen
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.innerHTML = `
      <span class="close">&times;</span>
      <img class="lightbox-image" src="" alt="" />
      <div class="lightbox-navigation">
        <span class="prev">&#10094;</span>
        <span class="next">&#10095;</span>
      </div>
      <div class="lightbox-indicator">
        <span class="current-index">1</span> / <span class="total-count">${images.length}</span>
      </div>
      <div class="lightbox-title"></div>
    `;
    document.body.appendChild(lightbox);
  
    const lightboxImage = lightbox.querySelector(".lightbox-image");
    const closeBtn = lightbox.querySelector(".close");
    const prevBtn = lightbox.querySelector(".prev");
    const nextBtn = lightbox.querySelector(".next");
    const currentIndexSpan = lightbox.querySelector(".current-index");
    const lightboxTitle = lightbox.querySelector(".lightbox-title");
  
    let currentIndex = 0;
  
    function openLightbox(index) {
      currentIndex = index;
      updateLightbox();
      lightbox.style.display = "flex";
    }
  
    function closeLightbox() {
      lightbox.style.display = "none";
    }
  
    function showPrevImage() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateLightbox();
    }
  
    function showNextImage() {
      currentIndex = (currentIndex + 1) % images.length;
      updateLightbox();
    }
  
    function updateLightbox() {
      const image = images[currentIndex];
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      currentIndexSpan.textContent = currentIndex + 1;
      lightboxTitle.textContent = image.title;
    }
  
    galleryContainer.addEventListener("click", (e) => {
      if (e.target.tagName === "IMG") {
        const index = parseInt(e.target.dataset.index, 10);
        openLightbox(index);
      }
    });
  
    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", showPrevImage);
    nextBtn.addEventListener("click", showNextImage);
  
    // Schließen der Lightbox beim Klicken außerhalb des Bildes
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  
    // Tastaturnavigation
    document.addEventListener("keydown", (e) => {
      if (lightbox.style.display === "flex") {
        if (e.key === "ArrowLeft") {
          showPrevImage();
        } else if (e.key === "ArrowRight") {
          showNextImage();
        } else if (e.key === "Escape") {
          closeLightbox();
        }
      }
    });
  }
  