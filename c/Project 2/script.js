const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const sections = Array.from(document.querySelectorAll('main section[id]'));
const menuToggle = document.getElementById('menuToggle');
const navLinksContainer = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const backToTop = document.getElementById('backToTop');
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const counters = Array.from(document.querySelectorAll('.counter'));
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const courseCards = Array.from(document.querySelectorAll('.course-card'));
const feeTable = document.getElementById('feeTable');
const applyModal = document.getElementById('applyModal');
const applyOpenButton = document.querySelector('.apply-open');
const modalClose = document.getElementById('modalClose');
const applyForm = document.getElementById('applyForm');
const contactForm = document.getElementById('contactForm');
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxClose = document.getElementById('lightboxClose');
const testimonialTrack = document.getElementById('testimonialTrack');
const typingText = document.getElementById('typingText');

let currentGalleryIndex = 0;
let testimonialIndex = 0;
let activeCounter = false;

function setActiveNav(linkId) {
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === linkId));
}

function initScrollSpy() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          setActiveNav(id);
        }
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function animateCounters() {
  if (activeCounter) return;
  activeCounter = true;

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = Number(el.dataset.target);
          const duration = 1400;
          const startTime = performance.now();

          const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.floor(progress * target);
            el.textContent = `${value}${target === 96 ? '%' : target === 75 ? '+' : target === 450 ? '+' : '+'}`;
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

function initFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector('.filter-btn.active').classList.remove('active');
      button.classList.add('active');
      const filter = button.dataset.filter;

      courseCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !matches);
      });
    });
  });
}

function sortTable(columnKey) {
  const rows = Array.from(feeTable.querySelectorAll('tbody tr'));
  const direction = feeTable.dataset.sortDir === 'asc' ? 'desc' : 'asc';
  feeTable.dataset.sortDir = direction;

  rows.sort((a, b) => {
    const first = a.children[Array.from(feeTable.querySelectorAll('th')).findIndex((th) => th.dataset.sort === columnKey)].textContent.trim();
    const second = b.children[Array.from(feeTable.querySelectorAll('th')).findIndex((th) => th.dataset.sort === columnKey)].textContent.trim();

    if (columnKey === 'fee' || columnKey === 'seats' || columnKey === 'duration') {
      const firstNum = Number(first.replace(/[^0-9]/g, ''));
      const secondNum = Number(second.replace(/[^0-9]/g, ''));
      return direction === 'asc' ? firstNum - secondNum : secondNum - firstNum;
    }

    return direction === 'asc' ? first.localeCompare(second) : second.localeCompare(first);
  });

  const tbody = feeTable.querySelector('tbody');
  tbody.innerHTML = '';
  rows.forEach((row) => tbody.appendChild(row));
}

function initTableSorting() {
  const headers = Array.from(feeTable.querySelectorAll('th'));
  headers.forEach((header) => {
    header.addEventListener('click', () => sortTable(header.dataset.sort));
  });
}

function openModal() {
  applyModal.classList.add('open');
  applyModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  applyModal.classList.remove('open');
  applyModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  applyForm.reset();
  applyForm.querySelectorAll('.form-error').forEach((error) => {
    error.textContent = '';
  });
}

function validateField(field, errorElement, rules) {
  const value = field.value.trim();
  let message = '';

  rules.forEach((rule) => {
    if (rule.type === 'required' && !value) {
      message = rule.message;
    } else if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = rule.message;
    } else if (rule.type === 'phone' && value && !/^\+?[0-9\s-]{7,15}$/.test(value)) {
      message = rule.message;
    }
  });

  errorElement.textContent = message;
  return !message;
}

function validateApplyForm() {
  const fields = [
    { name: 'name', rules: [{ type: 'required', message: 'Name is required.' }] },
    { name: 'email', rules: [{ type: 'required', message: 'Email is required.' }, { type: 'email', message: 'Enter a valid email.' }] },
    { name: 'course', rules: [{ type: 'required', message: 'Course is required.' }] },
    { name: 'phone', rules: [{ type: 'required', message: 'Phone is required.' }, { type: 'phone', message: 'Enter a valid phone number.' }] }
  ];

  let valid = true;
  fields.forEach(({ name, rules }) => {
    const field = applyForm.elements[name];
    const errorElement = field.parentElement.querySelector('.form-error');
    valid = validateField(field, errorElement, rules) && valid;
  });

  return valid;
}

function validateContactForm() {
  const fields = [
    { name: 'contactName', rules: [{ type: 'required', message: 'Name is required.' }] },
    { name: 'contactEmail', rules: [{ type: 'required', message: 'Email is required.' }, { type: 'email', message: 'Enter a valid email.' }] },
    { name: 'subject', rules: [{ type: 'required', message: 'Subject is required.' }] },
    { name: 'message', rules: [{ type: 'required', message: 'Message is required.' }] }
  ];

  let valid = true;
  fields.forEach(({ name, rules }) => {
    const field = contactForm.elements[name];
    const errorElement = field.parentElement.querySelector('.form-error');
    valid = validateField(field, errorElement, rules) && valid;
  });

  return valid;
}

function initModalAndForms() {
  applyOpenButton?.addEventListener('click', openModal);
  modalClose?.addEventListener('click', closeModal);
  applyModal?.addEventListener('click', (event) => {
    if (event.target === applyModal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
      closeLightbox();
    }
  });

  applyForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateApplyForm()) {
      const success = document.createElement('p');
      success.className = 'form-success';
      success.textContent = 'Application submitted successfully!';
      applyForm.replaceWith(success);
    }
  });

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const successMessage = document.getElementById('formSuccess');
    if (validateContactForm()) {
      successMessage.textContent = 'Thanks! Your message has been sent.';
      contactForm.reset();
    } else {
      successMessage.textContent = '';
    }
  });
}

function openLightbox(index) {
  currentGalleryIndex = index;
  const item = galleryItems[index];
  lightboxImage.src = item.dataset.full;
  lightboxCaption.textContent = item.dataset.title;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showNextGallery() {
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
  const item = galleryItems[currentGalleryIndex];
  lightboxImage.src = item.dataset.full;
  lightboxCaption.textContent = item.dataset.title;
}

function showPrevGallery() {
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
  const item = galleryItems[currentGalleryIndex];
  lightboxImage.src = item.dataset.full;
  lightboxCaption.textContent = item.dataset.title;
}

function initGallery() {
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      openLightbox(index);
    });
  });

  lightboxPrev?.addEventListener('click', showPrevGallery);
  lightboxNext?.addEventListener('click', showNextGallery);
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}

function initTestimonials() {
  const testimonials = Array.from(testimonialTrack.children);
  setInterval(() => {
    testimonials.forEach((card) => card.classList.remove('active'));
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    testimonials[testimonialIndex].classList.add('active');
  }, 4000);
}

function initTypingAnimation() {
  const phrases = ['Empowering Innovation Through Education', 'Shaping the Future of Learning', 'Where Talent Meets Opportunity'];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const current = phrases[phraseIndex];
    typingText.textContent = deleting
      ? current.slice(0, charIndex--)
      : current.slice(0, charIndex++);

    if (!deleting && charIndex > current.length) {
      deleting = true;
      setTimeout(type, 1000);
      return;
    }

    if (deleting && charIndex < 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }

    setTimeout(type, deleting ? 55 : 90);
  };

  type();
}

function initTheme() {
  const savedTheme = localStorage.getItem('git-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }

  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('git-theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  });
}

function initBackToTop() {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initMobileMenu() {
  menuToggle?.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => navLinksContainer.classList.remove('open'));
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initScrollSpy();
  initReveal();
  animateCounters();
  initFilters();
  initTableSorting();
  initModalAndForms();
  initGallery();
  initTestimonials();
  initTypingAnimation();
  initTheme();
  initBackToTop();
  initMobileMenu();
});
