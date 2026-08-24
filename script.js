/**
 * Classic Business Centre Goa (V2)
 * Core JavaScript - Vanilla implementation with switch-based WhatsApp branch routing
 */

document.addEventListener('DOMContentLoaded', () => {
  
  /* =========================================================================
     1. Theme Management (Dark/Light Mode)
     ========================================================================= */
  const themeToggleBtn = document.querySelector('.theme-toggle');
  const htmlElement = document.documentElement;
  
  const savedTheme = localStorage.getItem('cbc-theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  }

  themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('cbc-theme', newTheme);
  });


  /* =========================================================================
     2. Mobile Navigation
     ========================================================================= */
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.main-nav a');

  menuToggle?.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    header.classList.toggle('nav-open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle?.setAttribute('aria-expanded', 'false');
      header.classList.remove('nav-open');
    });
  });


  /* =========================================================================
     3. Scroll Reveal Animations (Intersection Observer)
     ========================================================================= */
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });


  /* =========================================================================
     4. Services Filtering & Search
     ========================================================================= */
  const serviceFilterBtns = document.querySelectorAll('.filter-btn');
  const serviceSearchInput = document.getElementById('serviceSearch');
  const serviceCards = document.querySelectorAll('.service-card');

  let currentServiceCategory = 'all';
  let currentSearchQuery = '';

  const applyServiceFilters = () => {
    serviceCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const title = card.getAttribute('data-title') || '';
      const textContent = card.innerText.toLowerCase();

      const matchesCategory = currentServiceCategory === 'all' || category === currentServiceCategory;
      const matchesSearch = !currentSearchQuery || 
                            title.toLowerCase().includes(currentSearchQuery) || 
                            textContent.includes(currentSearchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      } else {
        card.style.display = 'none';
      }
    });
  };

  serviceFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      serviceFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentServiceCategory = btn.getAttribute('data-filter');
      applyServiceFilters();
    });
  });

  serviceSearchInput?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase().trim();
    applyServiceFilters();
  });


  /* =========================================================================
     5. Pricing/Catalogue Table Filtering
     ========================================================================= */
  const rateTabBtns = document.querySelectorAll('.tab-btn');
  const rateRows = document.querySelectorAll('#rateTable tbody tr');

  rateTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rateTabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      
      const selectedRate = btn.getAttribute('data-rate');
      
      rateRows.forEach(row => {
        if (selectedRate === 'all' || row.getAttribute('data-group') === selectedRate) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });


  /* =========================================================================
     6. WhatsApp Request Form Logic with Branch Switch Routing
     ========================================================================= */
  const printForm = document.getElementById('printForm');
  const formProgressFill = document.getElementById('formProgress');
  
  if (printForm) {
    const formInputs = printForm.querySelectorAll('input, select, textarea');

    const updateProgress = () => {
      if (!formProgressFill || formInputs.length === 0) return;
      
      let filledCount = 0;
      formInputs.forEach(input => {
        if (input.value.trim() !== '' && input.value !== 'Standard / Not Sure' && input.value !== 'Not sure') {
          filledCount++;
        }
      });
      
      const percentage = Math.max(10, (filledCount / formInputs.length) * 100);
      formProgressFill.style.width = `${percentage}%`;
    };

    formInputs.forEach(input => {
      input.addEventListener('input', updateProgress);
      input.addEventListener('change', updateProgress);
    });

    updateProgress();

    printForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(printForm);
      const data = Object.fromEntries(formData.entries());
      
      let message = `Hello Classic Business Centre, I would like to start a print job.%0A%0A`;
      
      message += `*Service:* ${data.service || 'Not specified'}%0A`;
      message += `*Material/Paper:* ${data.material || 'Standard / Let CBC Recommend'}%0A`;
      message += `*Print Side:* ${data.side || 'Not sure'}%0A`;
      message += `*Size:* ${data.size ? data.size.trim() : 'Not specified'}%0A`;
      message += `*Quantity:* ${data.quantity || '1'}%0A`;
      message += `*Pickup Branch:* ${data.branch || 'Panaji'}%0A`;
      
      if (data.deadline && data.deadline.trim() !== '') {
        message += `*Needed By:* ${data.deadline.trim()}%0A`;
      }
      
      if (data.notes && data.notes.trim() !== '') {
        message += `%0A*Special Instructions:*%0A${encodeURIComponent(data.notes.trim())}%0A`;
      }
      
      message += `%0AI will share my files here.`;
      
      // Switch logic for branch-specific WhatsApp numbers with fallback placeholder
      const selectedBranch = data.branch;
      let targetWhatsAppNumber = ''; // Default placeholder fallback if not mentioned

      switch (selectedBranch) {
        case 'Panaji · Patto Plaza':
          targetWhatsAppNumber = '919422062887'; // Primary CBC contact
          break;
        case 'Panaji · M.G. Road':
          targetWhatsAppNumber = '919422062887'; // Placeholder / update when branch-specific number is provided
          break;
        case 'Porvorim':
          targetWhatsAppNumber = '919422062887'; // Placeholder / update when branch-specific number is provided
          break;
        case 'Mapusa':
          targetWhatsAppNumber = '919422062887'; // Placeholder / update when branch-specific number is provided
          break;
        default:
          targetWhatsAppNumber = '919422062887'; // General fallback placeholder
          break;
      }

      const waUrl = `https://wa.me/${targetWhatsAppNumber}?text=${message}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

});
