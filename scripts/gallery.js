// gallery.js — KoKi-Galerie (Hauptbild + Thumbnails) auf der Software-Seite
// Klick/Tipp auf das Hauptbild (oder den Vergrößern-Button) öffnet eine Vollbildansicht
// mit Titel, Beschreibung und Blättern (Pfeile, Tastatur ←/→, Wischen); schließen per ×, Klick daneben oder Esc.

export function createGallery(data, targetSelector) {
    const container = document.querySelector(targetSelector);
    if (!container) {
      console.error(`Target container "${targetSelector}" not found.`);
      return;
    }

    let current = 0;

    // Create main image wrapper
    const mainImageWrapper = document.createElement('div');
    mainImageWrapper.classList.add('main-image-wrapper');

    // Main image
    const mainImage = document.createElement('img');
    mainImage.classList.add('main-image');

    // Banner (title + description)
    const banner = document.createElement('div');
    banner.classList.add('banner');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    banner.appendChild(title);
    banner.appendChild(description);

    // Vergrößern-Button (auch auf dem Handy sichtbar, wo es kein Hover gibt)
    const expandButton = document.createElement('button');
    expandButton.type = 'button';
    expandButton.classList.add('gallery-expand');
    expandButton.setAttribute('aria-label', 'Enlarge image');
    expandButton.innerHTML = '<i class="fas fa-expand"></i>';

    // Put main image + banner inside wrapper
    mainImageWrapper.appendChild(mainImage);
    mainImageWrapper.appendChild(banner);
    mainImageWrapper.appendChild(expandButton);

    // Create thumbnail container
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.classList.add('thumbnail-container');

    // Populate thumbnails
    data.forEach((item, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.classList.add('thumbnail');
      thumbnail.dataset.index = index;

      const thumbnailImage = document.createElement('img');
      thumbnailImage.src = item.src;
      thumbnailImage.alt = item.title;

      const thumbnailTitle = document.createElement('p');
      thumbnailTitle.textContent = item.title;

      thumbnail.appendChild(thumbnailImage);
      thumbnail.appendChild(thumbnailTitle);
      thumbnailContainer.appendChild(thumbnail);

      // On thumbnail click, update the main image & banner
      thumbnail.addEventListener('click', () => show(index));
    });

    // --- Vollbildansicht ---------------------------------------------------
    const lightbox = document.createElement('div');
    lightbox.classList.add('gallery-lightbox');
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.classList.add('lb-close');
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.innerHTML = '&times;';

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.classList.add('lb-nav', 'lb-prev');
    prevButton.setAttribute('aria-label', 'Previous image');
    prevButton.innerHTML = '&#8249;';

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.classList.add('lb-nav', 'lb-next');
    nextButton.setAttribute('aria-label', 'Next image');
    nextButton.innerHTML = '&#8250;';

    const figure = document.createElement('figure');
    figure.classList.add('lb-figure');
    const lbImage = document.createElement('img');
    lbImage.classList.add('lb-image');
    const caption = document.createElement('figcaption');
    const lbTitle = document.createElement('strong');
    lbTitle.classList.add('lb-title');
    const lbDesc = document.createElement('span');
    lbDesc.classList.add('lb-desc');
    caption.appendChild(lbTitle);
    caption.appendChild(lbDesc);
    figure.appendChild(lbImage);
    figure.appendChild(caption);

    lightbox.appendChild(closeButton);
    lightbox.appendChild(prevButton);
    lightbox.appendChild(figure);
    lightbox.appendChild(nextButton);
    document.body.appendChild(lightbox);

    function show(index) {
      current = (index + data.length) % data.length;
      const item = data[current];
      mainImage.src = item.src;
      mainImage.alt = item.alt || item.title;
      title.textContent = item.title;
      description.textContent = item.description;
      lbImage.src = item.src;
      lbImage.alt = item.alt || item.title;
      lbTitle.textContent = item.title;
      lbDesc.textContent = item.description;
    }

    function open() {
      show(current);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      expandButton.focus();
    }

    mainImage.addEventListener('click', open);
    expandButton.addEventListener('click', open);
    closeButton.addEventListener('click', close);
    prevButton.addEventListener('click', () => show(current - 1));
    nextButton.addEventListener('click', () => show(current + 1));
    // Klick auf den dunklen Hintergrund schließt
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === figure) close();
    });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
    });
    // Wischen auf dem Handy
    let touchX = null;
    lightbox.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    });

    show(0);

    // Clear any existing content and append
    container.innerHTML = '';
    container.appendChild(mainImageWrapper);
    container.appendChild(thumbnailContainer);
  }
