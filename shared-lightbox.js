// shared-lightbox.js

(function() {
  // Inject HTML structure into document body
  function injectHTML() {
    if (document.getElementById('shared-lightbox')) return;

    const overlay = document.createElement('div');
    overlay.className = 'shared-lightbox';
    overlay.id = 'shared-lightbox';
    
    // Close on clicking backdrop/overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target === document.getElementById('shared-lightbox-content') || e.target.classList.contains('shared-lightbox-media-wrapper')) {
        SharedLightbox.close();
      }
    });

    overlay.innerHTML = `
      <button class="shared-lightbox-close" id="shared-lightbox-close" aria-label="Chiudi">&times;</button>
      <button class="shared-lightbox-nav shared-lightbox-prev" id="shared-lightbox-prev" aria-label="Precedente">&#10094;</button>
      <div class="shared-lightbox-content" id="shared-lightbox-content">
        <div class="shared-lightbox-media-wrapper">
          <img src="" alt="Preview" class="shared-lightbox-img" id="shared-lightbox-img" draggable="false">
          <video src="" controls class="shared-lightbox-video" id="shared-lightbox-video"></video>
          <audio src="" controls class="shared-lightbox-audio" id="shared-lightbox-audio"></audio>
          <div class="shared-lightbox-lens" id="shared-lightbox-lens"></div>
        </div>
      </div>
      <button class="shared-lightbox-nav shared-lightbox-next" id="shared-lightbox-next" aria-label="Successiva">&#10095;</button>
      <div class="shared-lightbox-caption" id="shared-lightbox-caption"></div>
    `;

    document.body.appendChild(overlay);

    // Wire up events
    document.getElementById('shared-lightbox-close').addEventListener('click', () => SharedLightbox.close());
    document.getElementById('shared-lightbox-prev').addEventListener('click', () => SharedLightbox.prev());
    document.getElementById('shared-lightbox-next').addEventListener('click', () => SharedLightbox.next());

    // Swipe events for touch devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    overlay.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    overlay.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        SharedLightbox.next();
      } else if (touchEndX > touchStartX + swipeThreshold) {
        SharedLightbox.prev();
      }
    }, { passive: true });

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') SharedLightbox.close();
      if (e.key === 'ArrowRight') SharedLightbox.next();
      if (e.key === 'ArrowLeft') SharedLightbox.prev();
    });

    // Zoom Lens Setup
    setupMagnifier();
  }

  function setupMagnifier() {
    const img = document.getElementById('shared-lightbox-img');
    const lens = document.getElementById('shared-lightbox-lens');

    if (!img || !lens) return;

    // Check if it is a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      // Disable magnifying lens on mobile/touch devices
      return;
    }

    img.addEventListener('mouseenter', () => {
      const rect = img.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      lens.style.display = 'block';
      lens.style.backgroundImage = `url(${img.src})`;
      lens.style.backgroundSize = `${rect.width * 2}px ${rect.height * 2}px`;
    });

    img.addEventListener('mouseleave', () => {
      lens.style.display = 'none';
    });

    img.addEventListener('mousemove', (e) => {
      const rect = img.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Center the lens over the cursor
      const lensWidth = lens.offsetWidth || 250;
      const lensHeight = lens.offsetHeight || 250;

      lens.style.left = `${e.clientX - lensWidth / 2}px`;
      lens.style.top = `${e.clientY - lensHeight / 2}px`;

      // 200% zoom background positioning
      const bgX = -(x * 2 - lensWidth / 2);
      const bgY = -(y * 2 - lensHeight / 2);
      lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
    });
  }

  const SharedLightbox = {
    items: [],
    currentIndex: 0,

    open(items, startIndex) {
      if (!document.getElementById('shared-lightbox')) {
        injectHTML();
      }

      this.items = items || [];
      this.currentIndex = startIndex || 0;

      if (this.items.length === 0) return;

      const overlay = document.getElementById('shared-lightbox');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      this.updateMedia();
    },

    close() {
      const overlay = document.getElementById('shared-lightbox');
      if (!overlay) return;

      overlay.classList.remove('active');
      document.body.style.overflow = '';

      // Reset media elements to stop playback
      const video = document.getElementById('shared-lightbox-video');
      const audio = document.getElementById('shared-lightbox-audio');
      const img = document.getElementById('shared-lightbox-img');
      const lens = document.getElementById('shared-lightbox-lens');

      if (video) { video.pause(); video.src = ''; }
      if (audio) { audio.pause(); audio.src = ''; }
      if (img) { img.src = ''; }
      if (lens) { lens.style.display = 'none'; }
    },

    prev() {
      if (this.items.length <= 1) return;
      this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
      this.updateMedia();
    },

    next() {
      if (this.items.length <= 1) return;
      this.currentIndex = (this.currentIndex + 1) % this.items.length;
      this.updateMedia();
    },

    updateMedia() {
      const item = this.items[this.currentIndex];
      if (!item) return;

      const img = document.getElementById('shared-lightbox-img');
      const video = document.getElementById('shared-lightbox-video');
      const audio = document.getElementById('shared-lightbox-audio');
      const caption = document.getElementById('shared-lightbox-caption');
      const lens = document.getElementById('shared-lightbox-lens');

      // Hide all media
      img.style.display = 'none';
      video.style.display = 'none';
      audio.style.display = 'none';
      if (lens) lens.style.display = 'none';

      // Reset controls
      if (video) { video.pause(); video.src = ''; }
      if (audio) { audio.pause(); audio.src = ''; }

      if (item.type === 'image') {
        img.src = item.url;
        img.style.display = 'block';
      } else if (item.type === 'video') {
        video.src = item.url;
        video.style.display = 'block';
        video.play().catch(e => console.log('Autoplay blocked:', e));
      } else if (item.type === 'audio') {
        audio.src = item.url;
        audio.style.display = 'block';
        audio.play().catch(e => console.log('Autoplay blocked:', e));
      }

      // Update caption: e.g. "filename.jpg (3 di 12)"
      const indexInfo = `${this.currentIndex + 1} di ${this.items.length}`;
      caption.textContent = `${item.name} (${indexInfo})`;
    }
  };

  // Export to window
  window.SharedLightbox = SharedLightbox;

  // Auto-inject when script loads or DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHTML);
  } else {
    injectHTML();
  }
})();
