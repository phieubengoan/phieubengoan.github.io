/* ============================================
   1. MENU HAMBURGER (mobile)
   ============================================ */
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
const navScrim = document.getElementById('nav-scrim');

function openNav() {
  mainNav.classList.add('is-open');
  navScrim.classList.add('is-visible');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Đóng menu');
}

function closeNav() {
  mainNav.classList.remove('is-open');
  navScrim.classList.remove('is-visible');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Mở menu');
}

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.contains('is-open');
  isOpen ? closeNav() : openNav();
});

navScrim.addEventListener('click', closeNav);

// Đóng menu khi chọn 1 mục, và đánh dấu mục đang active
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('is-active'));
    link.classList.add('is-active');
    closeNav();
  });
});

/* ============================================
   2. DỮ LIỆU BẰNG KHEN
   ------------------------------------------------
   Thay các mục dưới đây bằng dữ liệu thật của bạn.
   "src" là đường dẫn tới file ảnh (png/jpg/jpeg...).
   Nếu để trống hoặc ảnh lỗi, hệ thống sẽ tự hiện
   một khung placeholder thay thế.
   ============================================ */
const CERTIFICATES = [
  { title: "Phiếu bé ngoan đầu tiên", meta: "Phiếu đầu tiên", src: "PhieuBeNgoan/pbn (1).png", special: true  },
  { title: "Phiếu bé ngoan 1", meta: "Tháng 1 - 2026", src: "PhieuBeNgoan/pbn (2).png" },
  { title: "Phiếu bé ngoan 2", meta: "Tháng 2 - 2026", src: "PhieuBeNgoan/pbn (3).png"},
  { title: "Phiếu bé ngoan 3", meta: "Tháng 3 - 2026", src: "PhieuBeNgoan/pbn (4).png" },
  { title: "Phiếu bé ngoan 4", meta: "Tháng 4 - 2026", src: "PhieuBeNgoan/pbn (5).png" },
  { title: "Phiếu bé ngoan 5", meta: "Tháng 5 - 2026", src: "PhieuBeNgoan/pbn (6).png" },
  { title: "Phiếu bé ngoan 6", meta: "Tháng 6 - 2026", src: "PhieuBeNgoan/pbn (7).png"},
  { title: "Phiếu bé ngoan 7", meta: "Tháng 7 - 2026", src: "PhieuBeNgoan/pbn (8).png" },
  { title: "Phiếu bé ngoan 8", meta: "Tháng 8 - 2026", src: "PhieuBeNgoan/pbn (9).png" },
  { title: "Phiếu bé ngoan 9", meta: "Tháng 9 - 2026", src: "PhieuBeNgoan/pbn (10).png" },
  { title: "Phiếu bé ngoan 10", meta: "Tháng 10 - 2026", src: "PhieuBeNgoan/pbn (11).png" },
];

const PAGE_SIZE = 6;
let renderedCount = 0;
 
const grid = document.getElementById('gallery-grid');
const statusEl = document.getElementById('gallery-status');
const sentinel = document.getElementById('gallery-sentinel');
const countEl = document.getElementById('gallery-count');
 
function makeCard(item, index) {
  const card = document.createElement('article');
  card.className = 'cert-card';
  card.style.animationDelay = `${(index % PAGE_SIZE) * 60}ms`;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Xem ${item.title}`);
 
  if (item.special) {
    card.classList.add('is-special');
  }
 
  const frame = document.createElement('div');
  frame.className = 'cert-frame';
 
  if (item.src) {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title;
    img.loading = 'lazy';
    img.onerror = () => {
      frame.innerHTML = '';
      frame.appendChild(makePlaceholder(item.title));
    };
    frame.appendChild(img);
  } else {
    frame.appendChild(makePlaceholder(item.title));
  }
 
  if (item.special) {
    const holo = document.createElement('div');
    holo.className = 'holo-shine';
    frame.appendChild(holo);
 
    const badge = document.createElement('span');
    badge.className = 'special-badge';
    badge.textContent = '✦ Đặc biệt';
    frame.appendChild(badge);
  }
 
  const body = document.createElement('div');
  body.className = 'cert-body';
 
  const info = document.createElement('div');
  info.className = 'cert-info';
  info.innerHTML = `
    <p class="cert-title">${item.title}</p>
    <p class="cert-meta">${item.meta}</p>
  `;
  body.appendChild(info);
 
  if (item.src) {
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.type = 'button';
    downloadBtn.setAttribute('aria-label', `Tải ${item.title} về máy`);
    downloadBtn.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3v12"/>
        <path d="M7 10l5 5 5-5"/>
        <path d="M5 21h14"/>
      </svg>
    `;
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = item.src;               // liên kết trực tiếp tới file gốc — giữ nguyên độ phân giải
      link.download = item.src.split('/').pop();
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
    body.appendChild(downloadBtn);
  }
 
  card.appendChild(frame);
  card.appendChild(body);
 
  if (item.special) {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--holo-x', `${px}%`);
      card.style.setProperty('--holo-y', `${py}%`);
      const tiltX = ((py - 50) / 50) * -6;
      const tiltY = ((px - 50) / 50) * 6;
      card.style.setProperty('--tilt-x', `${tiltX}deg`);
      card.style.setProperty('--tilt-y', `${tiltY}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', `0deg`);
      card.style.setProperty('--tilt-y', `0deg`);
    });
  }
 
  const openThis = () => {
    let url = `xem-phieu.html?src=${encodeURIComponent(item.src)}&title=${encodeURIComponent(item.title)}&meta=${encodeURIComponent(item.meta)}`;
    if (item.special) url += '&special=1';
    window.location.href = url;
  };
  card.addEventListener('click', openThis);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openThis(); }
  });
 
  return card;
}
 
function makePlaceholder(title) {
  const ph = document.createElement('div');
  ph.className = 'cert-placeholder';
  ph.textContent = title;
  return ph;
}
 
function loadNextPage() {
  const next = CERTIFICATES.slice(renderedCount, renderedCount + PAGE_SIZE);
  next.forEach((item, i) => grid.appendChild(makeCard(item, renderedCount + i)));
  renderedCount += next.length;
 
  countEl.textContent = `${renderedCount} / ${CERTIFICATES.length} mục`;
 
  if (renderedCount >= CERTIFICATES.length) {
    statusEl.textContent = 'Đã hiển thị tất cả bằng khen';
    statusEl.classList.add('is-visible');
    observer.disconnect();
  }
}
 
/* ============================================
   3. CUỘN XUỐNG ĐỂ TẢI THÊM (Infinite scroll)
   ============================================ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && renderedCount < CERTIFICATES.length) {
      statusEl.classList.add('is-visible');
      setTimeout(loadNextPage, 250); // độ trễ nhẹ để cảm giác mượt hơn
    }
  });
}, { rootMargin: '200px' });
 
observer.observe(sentinel);
loadNextPage(); // tải trang đầu tiên ngay khi mở trang
 
/* ============================================
   4. LIGHTBOX (xem chi tiết ảnh)
   ============================================ */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
 
function openLightbox(item) {
  if (item.src) {
    lightboxImg.src = item.src;
    lightboxImg.style.display = 'block';
  } else {
    lightboxImg.style.display = 'none';
  }
  lightboxImg.alt = item.title;
  lightboxCaption.textContent = `${item.title} — ${item.meta}`;
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
 
function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}
 
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});
 
/* ============================================
   5. NĂM HIỆN TẠI Ở FOOTER
   ============================================ */
document.getElementById('year').textContent = new Date().getFullYear();
 