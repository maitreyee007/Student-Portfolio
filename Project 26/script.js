const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const html = document.documentElement;
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section');
const heroType = document.getElementById('hero-type');
const skillBars = document.querySelectorAll('.progress-fill');
const certSearch = document.getElementById('cert-search');
const filterButtons = document.querySelectorAll('.filter-button');
const certificateGallery = document.getElementById('certificate-gallery');
const modal = document.getElementById('cert-modal');
const modalImage = document.getElementById('modal-image');
const modalPlaceholder = document.getElementById('modal-placeholder');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');
const contactForm = document.getElementById('contact-form');
const contactName = document.getElementById('contact-name');
const contactEmail = document.getElementById('contact-email');
const contactMessage = document.getElementById('contact-message');
const errorName = document.getElementById('error-name');
const errorEmail = document.getElementById('error-email');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('form-success');

let activeCertificates = [];
let currentModalIndex = 0;

const certificates = Array.from({ length: 26 }, (_, index) => {
  const number = index + 1;
  const category = number <= 10 ? 'Certificates' : number <= 18 ? 'Achievements' : 'Participation';
  return {
    number,
    category,
    title: `Certificate ${number}`,
    subtitle: category,
  };
});

function updateThemeButton() {
  const isDark = body.classList.contains('dark-theme');
  themeToggle.textContent = isDark ? 'Light' : 'Dark';
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('portfolioTheme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    body.classList.add('dark-theme');
  }
  updateThemeButton();
}

function toggleTheme() {
  body.classList.toggle('dark-theme');
  const mode = body.classList.contains('dark-theme') ? 'dark' : 'light';
  localStorage.setItem('portfolioTheme', mode);
  updateThemeButton();
}

function initializeNavigation() {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navList.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function typeHeroText() {
  const text = 'Aspiring Web Developer';
  let currentIndex = 0;
  let direction = 1;

  function updateText() {
    heroType.textContent = text.slice(0, currentIndex);
    if (currentIndex === text.length) {
      direction = -1;
      setTimeout(updateText, 1800);
      return;
    }
    if (currentIndex === 0 && direction === -1) {
      direction = 1;
    }
    currentIndex += direction;
    setTimeout(updateText, 120);
  }

  updateText();
}

function activateSectionsOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (entry.isIntersecting) {
          link?.classList.add('active');
          entry.target.classList.add('visible');
          entry.target.querySelectorAll('.fade-in').forEach((fadeEl) => {
            fadeEl.classList.add('visible');
          });
        } else {
          link?.classList.remove('active');
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((section) => observer.observe(section));
}

function animateSkills() {
  const skillsSection = document.getElementById('skills');
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        skillBars.forEach((bar) => {
          bar.style.width = bar.dataset.value;
        });
        observer.unobserve(skillsSection);
      }
    },
    { threshold: 0.4 }
  );
  if (skillsSection) observer.observe(skillsSection);
}

function createCertificateCard(cert, index) {
  const card = document.createElement('article');
  card.className = 'certificate-card';
  card.innerHTML = `
    <div class="certificate-thumb">
      <img alt="${cert.title} image">
      <div class="image-fallback">Image not available</div>
    </div>
    <div class="certificate-info">
      <h3>${cert.title}</h3>
      <p>${cert.subtitle}</p>
    </div>
  `;

  const img = card.querySelector('img');
  const fallback = card.querySelector('.image-fallback');
  let extension = 'png';
  const loadSource = () => {
    img.src = `c/${cert.number}.${extension}`;
  };

  img.addEventListener('error', () => {
    if (extension === 'png') {
      extension = 'jpeg';
      loadSource();
    } else {
      img.style.display = 'none';
      fallback.classList.add('visible');
    }
  });

  loadSource();

  card.addEventListener('click', () => {
    openModal(index);
  });

  return card;
}

function renderCertificates(items) {
  certificateGallery.innerHTML = '';
  if (!items.length) {
    const noResults = document.createElement('p');
    noResults.className = 'no-results';
    noResults.textContent = 'No certificates match this search or filter.';
    certificateGallery.appendChild(noResults);
    return;
  }

  activeCertificates = items;
  items.forEach((cert, index) => {
    const card = createCertificateCard(cert, index);
    certificateGallery.appendChild(card);
  });
}

function findFilteredCertificates() {
  const searchTerm = certSearch.value.trim();
  const activeFilter = document.querySelector('.filter-button.active');
  const filterValue = activeFilter ? activeFilter.dataset.filter : 'all';

  return certificates.filter((cert) => {
    const matchesFilter = filterValue === 'all' || cert.category === filterValue;
    const matchesSearch = searchTerm === '' || cert.number.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });
}

function initializeCertificateControls() {
  renderCertificates(certificates);

  certSearch.addEventListener('input', () => {
    renderCertificates(findFilteredCertificates());
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      renderCertificates(findFilteredCertificates());
    });
  });
}

function updateModalContent(index) {
  const item = activeCertificates[index];
  if (!item) return;

  currentModalIndex = index;
  modalTitle.textContent = `${item.title} · ${item.subtitle}`;
  modalPlaceholder.classList.remove('visible');
  modalImage.style.display = 'block';
  modalImage.alt = item.title;
  modalImage.dataset.extension = 'png';
  modalImage.src = `c/${item.number}.png`;
}

modalImage.addEventListener('error', () => {
  if (modalImage.dataset.extension === 'png') {
    modalImage.dataset.extension = 'jpeg';
    const item = activeCertificates[currentModalIndex];
    if (item) modalImage.src = `c/${item.number}.jpeg`;
  } else {
    modalImage.style.display = 'none';
    modalPlaceholder.classList.add('visible');
  }
});

function openModal(index) {
  updateModalContent(index);
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function showPreviousModal() {
  const nextIndex = currentModalIndex === 0 ? activeCertificates.length - 1 : currentModalIndex - 1;
  updateModalContent(nextIndex);
}

function showNextModal() {
  const nextIndex = currentModalIndex === activeCertificates.length - 1 ? 0 : currentModalIndex + 1;
  updateModalContent(nextIndex);
}

function initializeModal() {
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  modalPrev.addEventListener('click', showPreviousModal);
  modalNext.addEventListener('click', showNextModal);

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('show')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') showPreviousModal();
    if (event.key === 'ArrowRight') showNextModal();
  });
}

function showError(input, message, errorElement) {
  input.classList.add('input-error');
  errorElement.textContent = message;
}

function clearError(input, errorElement) {
  input.classList.remove('input-error');
  errorElement.textContent = '';
}

function validateForm() {
  let valid = true;

  if (!contactName.value.trim()) {
    showError(contactName, 'Name cannot be empty.', errorName);
    valid = false;
  } else {
    clearError(contactName, errorName);
  }

  if (!contactEmail.value.trim()) {
    showError(contactEmail, 'Email cannot be empty.', errorEmail);
    valid = false;
  } else if (!contactEmail.value.includes('@') || !contactEmail.value.includes('.')) {
    showError(contactEmail, 'Please enter a valid email address.', errorEmail);
    valid = false;
  } else {
    clearError(contactEmail, errorEmail);
  }

  if (!contactMessage.value.trim()) {
    showError(contactMessage, 'Message cannot be empty.', errorMessage);
    valid = false;
  } else {
    clearError(contactMessage, errorMessage);
  }

  return valid;
}

function initializeContactForm() {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateForm()) {
      successMessage.classList.add('visible');
      contactForm.reset();
      setTimeout(() => {
        successMessage.classList.remove('visible');
      }, 3000);
    }
  });
}

function initializeApp() {
  initializeTheme();
  initializeNavigation();
  typeHeroText();
  activateSectionsOnScroll();
  animateSkills();
  initializeCertificateControls();
  initializeModal();
  initializeContactForm();
  themeToggle.addEventListener('click', toggleTheme);
}

initializeApp();
