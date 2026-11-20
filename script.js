const slides = Array.from(document.querySelectorAll('.slide'));
const totalSlides = slides.length;
let currentIndex = 0;
let laserEnabled = false;
let currentLang = 'vi';
let lastLightboxType = 'image';
let lastLightboxSrcVi = '';
let lastLightboxSrcEn = '';
let lastLightboxCaptionVi = '';
let lastLightboxCaptionEn = '';

const slideCounter = document.getElementById('slideCounter');
const progressFill = document.getElementById('progressFill');
const slideDotsContainer = document.getElementById('slideDots');
const overviewModal = document.getElementById('overviewModal');
const overviewGrid = document.getElementById('overviewGrid');
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxVideo = document.getElementById('lightboxVideo');
const lightboxCustom = document.getElementById('lightboxCustom');
const lightboxCaption = document.getElementById('lightboxCaption');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const sectionPills = Array.from(document.querySelectorAll('#sectionPills .sec-pill'));
const laserDot = document.getElementById('laserDot');
const btnLaser = document.getElementById('btnLaser');
const btnLangVi = document.getElementById('btnLangVi');
const btnLangEn = document.getElementById('btnLangEn');

function initPresentation() {
  slides.forEach((slide, idx) => {
    const dot = document.createElement('div');
    dot.className = 'slide-dot' + (idx === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(idx));
    slideDotsContainer.appendChild(dot);

    const item = document.createElement('div');
    item.className = 'overview-item' + (idx === 0 ? ' active' : '');
    item.addEventListener('click', () => {
      goToSlide(idx);
      toggleOverview(false);
    });
    overviewGrid.appendChild(item);
  });

  const hash = window.location.hash;
  if (hash && hash.startsWith('#slide-')) {
    const num = parseInt(hash.replace('#slide-', ''), 10);
    if (!isNaN(num) && num >= 1 && num <= totalSlides) {
      currentIndex = num - 1;
    }
  }

  renderOverviewTexts();
  updateUI();
}

function setLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'vi';
  document.body.classList.toggle('lang-en', currentLang === 'en');
  document.documentElement.lang = currentLang;

  if (btnLangVi) btnLangVi.classList.toggle('active', currentLang === 'vi');
  if (btnLangEn) btnLangEn.classList.toggle('active', currentLang === 'en');

  document.title = currentLang === 'en'
    ? 'GLOBAL SAFE — Comprehensive Fire Alarm Monitoring & Management Ecosystem'
    : 'GLOBAL SAFE — Hệ Sinh Thái Giám Sát & Quản Lý PCCC Toàn Diện';

  renderOverviewTexts();
  syncSlideVideos();

  if (lightboxModal.classList.contains('open')) {
    const activeSrc = currentLang === 'en'
      ? (lastLightboxSrcEn || lastLightboxSrcVi)
      : lastLightboxSrcVi;
    if (lastLightboxType === 'video' && lightboxVideo) {
      lightboxVideo.src = activeSrc;
      lightboxVideo.play().catch(() => {});
    } else if (lastLightboxType === 'image') {
      lightboxImg.src = activeSrc;
    }
    lightboxCaption.textContent = currentLang === 'en'
      ? (lastLightboxCaptionEn || lastLightboxCaptionVi)
      : lastLightboxCaptionVi;
  }
}

function renderOverviewTexts() {
  const dots = slideDotsContainer.querySelectorAll('.slide-dot');
  const ovItems = overviewGrid.querySelectorAll('.overview-item');

  slides.forEach((slide, idx) => {
    const title = currentLang === 'en'
      ? (slide.dataset.titleEn || slide.dataset.title || '')
      : (slide.dataset.title || '');
    const sub = currentLang === 'en'
      ? (slide.dataset.subEn || slide.dataset.sub || '')
      : (slide.dataset.sub || '');

    if (dots[idx]) {
      dots[idx].title = `Slide ${idx + 1}: ${title}`;
    }
    if (ovItems[idx]) {
      ovItems[idx].innerHTML = `
        <div class="overview-item-num">Slide ${String(idx + 1).padStart(2, '0')}</div>
        <div class="overview-item-title">${title}</div>
        <div class="overview-item-sub">${sub}</div>
      `;
    }
  });
}

function goToSlide(index) {
  if (index < 0 || index >= totalSlides) return;
  currentIndex = index;
  updateUI();
}

function nextSlide() {
  if (currentIndex < totalSlides - 1) {
    currentIndex++;
    updateUI();
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    currentIndex--;
    updateUI();
  }
}

function updateUI() {
  slides.forEach((s, idx) => {
    s.classList.toggle('active', idx === currentIndex);
  });

  const dots = slideDotsContainer.querySelectorAll('.slide-dot');
  dots.forEach((d, idx) => d.classList.toggle('active', idx === currentIndex));

  const ovItems = overviewGrid.querySelectorAll('.overview-item');
  ovItems.forEach((item, idx) => item.classList.toggle('active', idx === currentIndex));

  slideCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
  progressFill.style.width = `${((currentIndex + 1) / totalSlides) * 100}%`;

  btnPrev.disabled = currentIndex === 0;
  btnNext.disabled = currentIndex === totalSlides - 1;

  const activeSection = parseInt(slides[currentIndex].dataset.section || '0', 10);
  sectionPills.forEach((pill, idx) => {
    pill.classList.toggle('active', idx === activeSection);
  });

  history.replaceState(null, '', `#slide-${currentIndex + 1}`);
  syncSlideVideos();
}

function syncSlideVideos() {
  slides.forEach((slide, idx) => {
    const isActive = idx === currentIndex;
    slide.querySelectorAll('video').forEach(vid => {
      const hiddenByLang = (vid.classList.contains('vi') && currentLang === 'en') ||
                           (vid.classList.contains('en') && currentLang !== 'en');
      if (isActive && !hiddenByLang) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  });
}

// Tab switching inside slides
function switchTab(btnEl, targetPanelId) {
  const slide = btnEl.closest('.slide');
  if (!slide) return;

  const buttons = slide.querySelectorAll('.tab-btn');
  buttons.forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');

  const panels = slide.querySelectorAll('.tab-panel');
  panels.forEach(p => {
    p.classList.toggle('active', p.id === targetPanelId);
  });
}

// Lightbox Zoom (Image, Video & Annotated Dashboard)
function openLightbox(src, captionVi, captionEn, srcEn) {
  lastLightboxType = 'image';
  lastLightboxSrcVi = src;
  lastLightboxSrcEn = srcEn || src;
  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.style.display = 'none';
    lightboxVideo.removeAttribute('src');
  }
  if (lightboxCustom) {
    lightboxCustom.style.display = 'none';
    lightboxCustom.innerHTML = '';
  }
  lightboxImg.style.display = 'block';
  lightboxImg.src = currentLang === 'en' ? lastLightboxSrcEn : lastLightboxSrcVi;
  lastLightboxCaptionVi = captionVi || '';
  lastLightboxCaptionEn = captionEn || captionVi || '';
  lightboxCaption.textContent = currentLang === 'en' ? lastLightboxCaptionEn : lastLightboxCaptionVi;
  lightboxModal.classList.add('open');
}

function openDashboardLightbox() {
  lastLightboxType = 'custom';
  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.style.display = 'none';
    lightboxVideo.removeAttribute('src');
  }
  lightboxImg.style.display = 'none';
  lightboxImg.src = '';
  const srcNode = document.getElementById('dashboardAnnotatedSrc');
  if (lightboxCustom && srcNode) {
    lightboxCustom.innerHTML = '';
    const clone = srcNode.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.border = '3px solid var(--primary-blue)';
    clone.style.borderRadius = '12px';
    lightboxCustom.appendChild(clone);
    lightboxCustom.style.display = 'flex';
  }
  lastLightboxCaptionVi = 'Giao diện Dashboard (Bảng điều khiển trung tâm) trên Web CMS';
  lastLightboxCaptionEn = 'Central Control Dashboard Interface on Web CMS';
  lightboxCaption.textContent = currentLang === 'en' ? lastLightboxCaptionEn : lastLightboxCaptionVi;
  lightboxModal.classList.add('open');
}

function openVideoLightbox(src, captionVi, captionEn, srcEn) {
  lastLightboxType = 'video';
  lastLightboxSrcVi = src;
  lastLightboxSrcEn = srcEn || src;
  lightboxImg.style.display = 'none';
  lightboxImg.src = '';
  if (lightboxCustom) {
    lightboxCustom.style.display = 'none';
    lightboxCustom.innerHTML = '';
  }
  if (lightboxVideo) {
    lightboxVideo.style.display = 'block';
    lightboxVideo.src = currentLang === 'en' ? lastLightboxSrcEn : lastLightboxSrcVi;
    lightboxVideo.currentTime = 0;
    lightboxVideo.play().catch(() => {});
  }
  lastLightboxCaptionVi = captionVi || '';
  lastLightboxCaptionEn = captionEn || captionVi || '';
  lightboxCaption.textContent = currentLang === 'en' ? lastLightboxCaptionEn : lastLightboxCaptionVi;
  lightboxModal.classList.add('open');
}

function openDtCardLightbox(cardId) {
  const card = document.getElementById(cardId);
  if (!card || !lightboxCustom) return;
  lastLightboxType = 'custom';
  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.style.display = 'none';
    lightboxVideo.removeAttribute('src');
  }
  lightboxImg.style.display = 'none';
  lightboxImg.src = '';

  const titleEl = card.querySelector('.dt-col-title');
  const listItems = Array.from(card.querySelectorAll('.dt-list > li'));
  const isDeepBlue = card.classList.contains('card-deep-blue');
  const bodyHtml = listItems
    .map((li) => `<div class="dt-step-item">${li.innerHTML}</div>`)
    .join('');

  lightboxCustom.innerHTML = `
    <div class="dt-step-modal ${isDeepBlue ? 'is-deep-blue' : ''}" onclick="event.stopPropagation()">
      <div class="dt-step-header">
        <div class="dt-step-title">${titleEl ? titleEl.innerHTML : ''}</div>
      </div>
      <div class="dt-step-body">${bodyHtml}</div>
    </div>
  `;
  lightboxCustom.style.display = 'flex';

  lastLightboxCaptionVi = 'Nhấn ESC hoặc click ra ngoài để đóng';
  lastLightboxCaptionEn = 'Press ESC or click outside to close';
  lightboxCaption.textContent = currentLang === 'en' ? lastLightboxCaptionEn : lastLightboxCaptionVi;
  lightboxModal.classList.add('open');
}

function closeLightbox() {
  lightboxModal.classList.remove('open');
  lightboxImg.src = '';
  lightboxImg.style.display = 'block';
  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.style.display = 'none';
  }
  if (lightboxCustom) {
    lightboxCustom.style.display = 'none';
    lightboxCustom.innerHTML = '';
  }
}

// Slide Overview Drawer
function toggleOverview(forceState) {
  const shouldOpen = typeof forceState === 'boolean' ? forceState : !overviewModal.classList.contains('open');
  overviewModal.classList.toggle('open', shouldOpen);
}

// Fullscreen Toggle
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// Laser Pointer
function toggleLaser() {
  laserEnabled = !laserEnabled;
  document.body.classList.toggle('laser-mode', laserEnabled);
  btnLaser.classList.toggle('laser-active', laserEnabled);
}

window.addEventListener('mousemove', (e) => {
  if (!laserEnabled) return;
  laserDot.style.left = `${e.clientX}px`;
  laserDot.style.top = `${e.clientY}px`;
});

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (lightboxModal.classList.contains('open')) {
    if (e.key === 'Escape' || e.key === ' ') {
      e.preventDefault();
      closeLightbox();
    }
    return;
  }

  if (overviewModal.classList.contains('open')) {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'g' || e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleOverview(false);
    }
    return;
  }

  switch (e.key) {
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
    case 'PageUp':
      e.preventDefault();
      prevSlide();
      break;
    case 'Home':
      e.preventDefault();
      goToSlide(0);
      break;
    case 'End':
      e.preventDefault();
      goToSlide(totalSlides - 1);
      break;
    case 'f':
    case 'F':
      e.preventDefault();
      toggleFullscreen();
      break;
    case 'g':
    case 'G':
    case 'm':
    case 'M':
      e.preventDefault();
      toggleOverview();
      break;
    case 'l':
    case 'L':
      e.preventDefault();
      toggleLaser();
      break;
  }
});

// Touch Swipe Support
let touchStartX = 0;
window.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 60) {
    if (diff < 0) nextSlide();
    else prevSlide();
  }
}, { passive: true });

initPresentation();
