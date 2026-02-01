(function() {
  'use strict';

  if (window.__appInitialized) {
    return;
  }
  window.__appInitialized = true;

  const STATE = {
    burgerOpen: false,
    formSubmitting: false,
    countUpTriggered: new Set()
  };

  function debounce(fn, delay) {
    let timer;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(context, args), delay);
    };
  }

  function throttle(fn, delay) {
    let last = 0;
    return function() {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  function initBurgerMenu() {
    const toggle = document.querySelector('.navbar-toggler');
    const collapse = document.querySelector('.navbar-collapse');
    const nav = document.querySelector('.c-nav');
    const body = document.body;

    if (!toggle || !collapse) return;

    function open() {
      STATE.burgerOpen = true;
      collapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      if (nav) nav.classList.add('is-open');
    }

    function close() {
      STATE.burgerOpen = false;
      collapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      if (nav) nav.classList.remove('is-open');
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      STATE.burgerOpen ? close() : open();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && STATE.burgerOpen) {
        close();
        toggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (STATE.burgerOpen && !collapse.contains(e.target) && !toggle.contains(e.target)) {
        close();
      }
    });

    const navLinks = collapse.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (STATE.burgerOpen) close();
      });
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 768 && STATE.burgerOpen) {
        close();
      }
    }, 200));
  }

  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.startsWith('#')) {
        e.preventDefault();
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const header = document.querySelector('.l-header');
          const offset = header ? header.offsetHeight : 80;
          const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"], .nav-link[href^="/#"]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkId = href.includes('#') ? href.split('#')[1] : '';
            if (linkId === id) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            } else {
              link.classList.remove('active');
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  }

  function initFormValidation() {
    const forms = document.querySelectorAll('.c-form, form.needs-validation');

    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (STATE.formSubmitting) return;

        clearFormErrors(form);

        const isValid = validateForm(form);

        if (!isValid) {
          form.classList.add('was-validated');
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        STATE.formSubmitting = true;

        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.textContent;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
          
          setTimeout(() => {
            STATE.formSubmitting = false;
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
            window.location.href = 'thank_you.html';
          }, 1500);
        } else {
          setTimeout(() => {
            STATE.formSubmitting = false;
            window.location.href = 'thank_you.html';
          }, 1000);
        }
      });
    });
  }

  function validateForm(form) {
    let isValid = true;

    const firstName = form.querySelector('#firstName');
    if (firstName && !validateName(firstName.value)) {
      showError(firstName, 'Bitte geben Sie einen gültigen Vornamen ein (2-50 Zeichen).');
      isValid = false;
    }

    const lastName = form.querySelector('#lastName');
    if (lastName && !validateName(lastName.value)) {
      showError(lastName, 'Bitte geben Sie einen gültigen Nachnamen ein (2-50 Zeichen).');
      isValid = false;
    }

    const email = form.querySelector('#email, #newsletterEmail');
    if (email && !validateEmail(email.value)) {
      showError(email, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      isValid = false;
    }

    const phone = form.querySelector('#phone');
    if (phone && phone.value.trim() && !validatePhone(phone.value)) {
      showError(phone, 'Bitte geben Sie eine gültige Telefonnummer ein.');
      isValid = false;
    }

    const message = form.querySelector('#message');
    if (message && message.value.trim().length < 10) {
      showError(message, 'Die Nachricht muss mindestens 10 Zeichen lang sein.');
      isValid = false;
    }

    const consent = form.querySelector('#privacyConsent, #newsletterConsent');
    if (consent && !consent.checked) {
      showError(consent, 'Bitte stimmen Sie den Datenschutzbestimmungen zu.');
      isValid = false;
    }

    const searchInput = form.querySelector('#searchInput');
    if (searchInput && searchInput.value.trim().length === 0) {
      showError(searchInput, 'Bitte geben Sie einen Suchbegriff ein.');
      isValid = false;
    }

    return isValid;
  }

  function validateName(value) {
    if (!value || value.trim().length < 2) return false;
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
    return nameRegex.test(value.trim());
  }

  function validateEmail(value) {
    if (!value || value.trim().length === 0) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  }

  function validatePhone(value) {
    if (!value || value.trim().length === 0) return true;
    const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
    return phoneRegex.test(value.trim());
  }

  function showError(field, message) {
    field.classList.add('is-invalid');
    
    let feedback = field.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      field.parentNode.insertBefore(feedback, field.nextSibling);
    }
    feedback.textContent = message;
    feedback.style.display = 'block';
  }

  function clearFormErrors(form) {
    const invalidFields = form.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => field.classList.remove('is-invalid'));

    const feedbacks = form.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(fb => fb.style.display = 'none');
  }

  function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:48px;height:48px;border-radius:50%;border:none;background:var(--color-primary);color:white;font-size:24px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity 0.3s,transform 0.3s;z-index:999;box-shadow:var(--shadow-lg);';
    
    document.body.appendChild(scrollBtn);

    function toggleButton() {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.pointerEvents = 'auto';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.pointerEvents = 'none';
      }
    }

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', throttle(toggleButton, 200));
    toggleButton();
  }

  function initHeaderScroll() {
    const header = document.querySelector('.l-header');
    if (!header) return;

    function handleScroll() {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', throttle(handleScroll, 100));
    handleScroll();
  }

  function initLazyLoading() {
    const images = document.querySelectorAll('img:not([loading])');
    const videos = document.querySelectorAll('video:not([loading])');

    images.forEach(img => {
      if (!img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }
    });

    videos.forEach(video => {
      video.setAttribute('loading', 'lazy');
    });
  }

  function initCountUp() {
    const statElements = document.querySelectorAll('[data-count]');
    
    if (!statElements.length) return;

    function animateCount(element) {
      const target = parseInt(element.getAttribute('data-count'), 10);
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      function update() {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(update);
        } else {
          element.textContent = target;
        }
      }

      update();
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !STATE.countUpTriggered.has(entry.target)) {
          STATE.countUpTriggered.add(entry.target);
          animateCount(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statElements.forEach(el => observer.observe(el));
  }

  function initModalOverlay() {
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal-trigger');
        const modal = document.getElementById(modalId);
        
        if (modal) {
          modal.classList.add('show');
          document.body.classList.add('u-no-scroll');
          
          const overlay = document.createElement('div');
          overlay.className = 'modal-overlay';
          overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1999;';
          document.body.appendChild(overlay);
          
          overlay.addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.classList.remove('u-no-scroll');
            overlay.remove();
          });
        }
      });
    });
  }

  function initImageFallback() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      img.addEventListener('error', function() {
        if (this.hasAttribute('data-fallback-set')) return;
        this.setAttribute('data-fallback-set', 'true');
        
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect fill="#f0f0f0" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="16" font-family="sans-serif">Bild nicht verfügbar</text></svg>';
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        this.src = url;
      });
    });
  }

  function initBootstrapCarousel() {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
      const items = carousel.querySelectorAll('.carousel-item');
      const prevBtn = carousel.querySelector('.carousel-control-prev');
      const nextBtn = carousel.querySelector('.carousel-control-next');
      const indicators = carousel.querySelectorAll('.carousel-indicators button');
      
      let currentIndex = 0;
      
      function showSlide(index) {
        items.forEach((item, i) => {
          item.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
          indicator.classList.toggle('active', i === index);
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % items.length;
          showSlide(currentIndex);
        });
      }
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          currentIndex = (currentIndex - 1 + items.length) % items.length;
          showSlide(currentIndex);
        });
      }
      
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          currentIndex = index;
          showSlide(currentIndex);
        });
      });
    });
  }

  function init() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initFormValidation();
    initScrollToTop();
    initHeaderScroll();
    initLazyLoading();
    initCountUp();
    initModalOverlay();
    initImageFallback();
    initBootstrapCarousel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();