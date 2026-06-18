// gallery.js — KoKi-Galerie (Hauptbild + Thumbnails) auf der Software-Seite

export function createGallery(data, targetSelector) {
    const container = document.querySelector(targetSelector);
    if (!container) {
      console.error(`Target container "${targetSelector}" not found.`);
      return;
    }

    // Create main image wrapper
    const mainImageWrapper = document.createElement('div');
    mainImageWrapper.classList.add('main-image-wrapper');

    // Main image
    const mainImage = document.createElement('img');
    mainImage.src = data[0].src;
    mainImage.alt = data[0].title;
    mainImage.classList.add('main-image');

    // Banner (title + description)
    const banner = document.createElement('div');
    banner.classList.add('banner');
    const title = document.createElement('h3');
    title.textContent = data[0].title;
    const description = document.createElement('p');
    description.textContent = data[0].description;

    banner.appendChild(title);
    banner.appendChild(description);

    // Put main image + banner inside wrapper
    mainImageWrapper.appendChild(mainImage);
    mainImageWrapper.appendChild(banner);

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
      thumbnail.addEventListener('click', () => {
        mainImage.src = item.src;
        mainImage.alt = item.title;
        title.textContent = item.title;
        description.textContent = item.description;
      });
    });

    // Clear any existing content and append
    container.innerHTML = '';
    container.appendChild(mainImageWrapper);
    container.appendChild(thumbnailContainer);
  }