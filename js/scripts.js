// Navigation Toggle for Mobile
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

/*burger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    burger.classList.toggle('toggle');
});*/

// Smooth Scroll (Optional)
const navLinksItems = document.querySelectorAll('.nav-links li a');

navLinksItems.forEach(link => {
    link.addEventListener('click', event => {
        if (link.getAttribute('href').startsWith('#')) {
            event.preventDefault();
            document.querySelector(link.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// scripts.js

/**
 * Generates project cards and inserts them into the target element.
 * @param {Array} dataArray - Array of project objects.
 * @param {HTMLElement} targetElement - The container element where cards will be inserted.
 */
function generateProjectCards(dataArray, targetElement) {
    targetElement.innerHTML = ''; // Clear existing content

    dataArray.forEach(project => {
        // Create card elements
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.title;

        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';

        const h3 = document.createElement('h3');
        h3.textContent = project.title;

        const p = document.createElement('p');
        p.textContent = project.description;

        const a = document.createElement('a');
        a.href = project.link;
        a.className = 'btn';
        a.textContent = 'Learn More';

        // Append elements
        cardContent.appendChild(h3);
        cardContent.appendChild(p);
        cardContent.appendChild(a);

        card.appendChild(img);
        card.appendChild(cardContent);

        targetElement.appendChild(card);
    });
}

/**
 * Generates publication items and inserts them into the target element.
 * @param {Array} dataArray - Array of publication objects.
 * @param {HTMLElement} targetElement - The container <ul> element where publications will be inserted.
 */
function generatePublicationList(dataArray, targetElement) {
    targetElement.innerHTML = ''; // Clear existing content

    dataArray.forEach(pub => {
        // Create list item
        const li = document.createElement('li');

        // Create the title and journal info
        const strong = document.createElement('strong');
        strong.textContent = pub.title;

        const journalInfo = document.createTextNode(` - ${pub.journal}, ${pub.year}.`);

        // Append title and journal info to li
        li.appendChild(strong);
        li.appendChild(journalInfo);

        // Create content paragraph
        const pContent = document.createElement('p');
        if (pub.equation) {
            // If there's an equation, include it in the paragraph
            pContent.innerHTML = `$$${pub.equation}$$`;
        } else if (pub.abstract) {
            // Else if there's an abstract, include it
            pContent.textContent = pub.abstract;
        } else if (pub.content) {
            // Else if there's other content
            pContent.textContent = pub.content;
        }
        // Append content paragraph if it exists
        if (pContent.textContent || pContent.innerHTML) {
            li.appendChild(pContent);
        }

        // Create the 'Read More' link
        const a = document.createElement('a');
        a.href = pub.link;
        a.className = 'btn';
        a.textContent = 'Read More';

        // Append the link to li
        li.appendChild(a);

        // Append the list item to the target element
        targetElement.appendChild(li);
    });

    // Re-render MathJax equations
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise();
    }
}


function isPageName(name) {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean); // Split and filter out empty segments
    const lastSegment = segments[segments.length - 1] || ''; // Get the last segment, or an empty string if none exists

    // Check if the last segment matches the name or the name with .html
    return lastSegment === name || lastSegment === `${name}.html`;
}



// Ensure the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    if (isPageName("index") || isPageName("")) {
        const projectCards = document.querySelector(".project-cards")

        if (projectCards) {
            generateProjectCards(projects, projectCards)
        }

        const publicationCards = document.querySelector(".publication-list")

        if (publicationCards) {
            generatePublicationList(publications, publicationCards)
        }
    }else if (isPageName("projects")) {
        const projectCards = document.querySelector(".projects-grid")

        if (projectCards) {
            generateProjectCards(projects, projectCards)
        }
    } else if (isPageName("publications")) {
        const publicationCards = document.querySelector(".publication-list")

        if (publicationCards) {
            generatePublicationList(publications, publicationCards)
        }
    }

});


const publications = [
    {
        "title": "Master Thesis",
        "journal": "Mathematics Journal",
        "year": 2022,
        "abstract": "An in-depth study of partial differential equations.",
        "equation": "\\partial_t u = \\Delta u",
        "link": "publication1",
        "tags": ["PDE", "mathematics"]
    },
    {
        "title": "Bachelor Thesis",
        "journal": "Science Journal",
        "year": 2020,
        "abstract": "Exploring the applications of algebraic topology.",
        "link": "publication2",
        "tags": ["topology", "algebra"]
    }
]

const projects = [
    {
        "title": "KoKi",
        "description": "A comprehensive project management tool.",
        "image": "images/KoKi.svg",
        "link": "project1",
        "tags": ["management", "productivity"]
    },
    {
        "title": "Dispo",
        "description": "An advanced scheduling application.",
        "image": "images/Dispo.svg",
        "link": "project2",
        "tags": ["scheduling", "automation"]
    },
    // {
    //     "title": "Theorem Database",
    //     "description": "A database of mathematical theorems.",
    //     "image": "images/Theorems.webp",
    //     "link": "project3",
    //     "tags": ["mathematics", "research"]
    // }
]
