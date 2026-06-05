// --- PORTFOLIO CONTROLLER & ANIMATION TRIGGER ---

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENTS ---
  const announcementBar = document.getElementById("announcement-bar");
  const announcementCloseBtn = document.getElementById("announcement-close");
  const portfolioLinks = document.querySelectorAll(".portfolio-link");
  const bgImages = document.querySelectorAll(".bg-image");
  const portfolioList = document.querySelector(".portfolio-list");
  
  const galleryDrawer = document.getElementById("gallery-drawer");
  const galleryTitle = document.getElementById("gallery-title");
  const galleryCloseBtn = document.getElementById("gallery-close");
  const galleryGrid = document.getElementById("gallery-grid");

  const hamburger = document.getElementById("hamburger");
  const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  // --- PERSISTENT ANNOUNCEMENT BAR ---
  if (localStorage.getItem("announcement-closed") === "true") {
    if (announcementBar) announcementBar.style.display = "none";
  }

  if (announcementCloseBtn) {
    announcementCloseBtn.addEventListener("click", () => {
      announcementBar.style.opacity = "0";
      announcementBar.style.marginTop = `-${announcementBar.offsetHeight}px`;
      localStorage.setItem("announcement-closed", "true");
      setTimeout(() => {
        announcementBar.style.display = "none";
      }, 500);
    });
  }

  // --- DYNAMIC CINEMATIC BACKGROUND TRANSITIONS ---
  portfolioLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
      const index = link.getAttribute("data-portfolio-index");
      bgImages.forEach(img => img.classList.remove("active"));
      const activeBg = document.querySelector(`.bg-image[data-bg-index="${index}"]`);
      if (activeBg) {
        activeBg.classList.add("active");
      }
    });
  });

  // --- IMMERSIVE LIGHTBOX GALLERY OPEN/CLOSE ---
  portfolioLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const index = link.getAttribute("data-portfolio-index");
      openGallery(index);
    });
  });

  function openGallery(index) {
    const data = portfolioData[index];
    if (!data) return;

    // Set header titles
    galleryTitle.textContent = data.title;
    
    // Clear grid
    galleryGrid.innerHTML = "";

    // Populate grid
    data.images.forEach((img, i) => {
      const item = document.createElement("div");
      item.classList.add("gallery-item");
      item.style.animation = `fadeSlideUp 0.6s cubic-bezier(0.25, 1, 0.5, 1) ${i * 0.1}s both`;
      
      item.innerHTML = `
        <img src="${img.url}" alt="${img.title}" loading="lazy" />
        <div class="gallery-item-overlay">
          <h2 class="gallery-item-title">${img.title}</h2>
          <span class="gallery-item-meta">${img.tag}</span>
        </div>
      `;
      
      // Full-size offline preview logic
      item.addEventListener("click", () => {
        openFullPreview(i, data.images);
      });

      galleryGrid.appendChild(item);
    });

    // Open drawer
    galleryDrawer.classList.add("open");
    document.body.style.overflow = "hidden"; // Disable background scrolling
  }

  if (galleryCloseBtn) {
    galleryCloseBtn.addEventListener("click", () => {
      galleryDrawer.classList.remove("open");
      document.body.style.overflow = ""; // Re-enable scroll
    });
  }

  // Close gallery on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (galleryDrawer.classList.contains("open")) {
        galleryDrawer.classList.remove("open");
        document.body.style.overflow = "";
      }
    }
  });

  // --- FULLSIZE IMAGE PREVIEW OVERLAY (WITH LIGHT GRAY NAV ARROWS) ---
  function openFullPreview(startIndex, images) {
    let currentIndex = startIndex;
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "#CDD1D0"; /* RAL 7035 - Grigio Perla */
    overlay.style.zIndex = "200";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.4s ease";

    overlay.innerHTML = `
      <div class="overlay-img-container" style="position:relative; display:flex; justify-content:center; align-items:center; max-width:80%; max-height:80vh;">
        <button class="nav-arrow prev-btn" aria-label="Immagine Precedente">&#10094;</button>
        <img id="preview-img" src="" alt="" style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:4px; box-shadow:0 20px 50px rgba(0,0,0,0.8);" />
        <button class="nav-arrow next-btn" aria-label="Immagine Successiva">&#10095;</button>
      </div>
      <span id="preview-title" style="color:#2D3032; margin-top:20px; font-family:var(--font-display); font-weight:700; letter-spacing: 0.05em; font-size:1.1rem; text-transform:uppercase;"></span>
      <span class="close-overlay-trigger" style="color:rgba(45,48,50,0.6); font-size:0.8rem; margin-top:5px; text-transform:uppercase; letter-spacing:0.15em; cursor:pointer; user-select:none;">CLICCA SULLO SFONDO PER CHIUDERE</span>
    `;

    const previewImg = overlay.querySelector("#preview-img");
    const previewTitle = overlay.querySelector("#preview-title");
    const prevBtn = overlay.querySelector(".prev-btn");
    const nextBtn = overlay.querySelector(".next-btn");

    function updatePreview() {
      const img = images[currentIndex];
      if (!img) return;
      previewImg.style.opacity = "0";
      previewImg.style.transform = "scale(0.97)";
      previewImg.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      
      setTimeout(() => {
        previewImg.src = img.url;
        previewImg.alt = img.title;
        previewTitle.textContent = img.title;
        previewImg.style.opacity = "1";
        previewImg.style.transform = "scale(1)";
      }, 150);
    }

    // Nav actions
    function nextImage() {
      currentIndex = (currentIndex + 1) % images.length;
      updatePreview();
    }

    function prevImage() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updatePreview();
    }

    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      prevImage();
    });

    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      nextImage();
    });

    previewImg.addEventListener("click", (e) => {
      e.stopPropagation(); // Don't close modal when clicking the image
    });

    // Close on overlay background click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.classList.contains("close-overlay-trigger")) {
        closeOverlay();
      }
    });

    // Keyboard navigation
    const keyHandler = (e) => {
      if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "Escape") {
        closeOverlay();
      }
    };
    document.addEventListener("keydown", keyHandler);

    function closeOverlay() {
      overlay.style.opacity = "0";
      document.removeEventListener("keydown", keyHandler);
      setTimeout(() => {
        overlay.remove();
      }, 400);
    }

    // Initial load
    updatePreview();

    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.style.opacity = "1";
    }, 10);
  }

  // --- MOBILE HAMBURGER NAVIGATION ---
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileNavOverlay.classList.contains("open");
      if (isOpen) {
        mobileNavOverlay.classList.remove("open");
        hamburger.querySelector("span:nth-child(1)").style.transform = "none";
        hamburger.querySelector("span:nth-child(2)").style.opacity = "1";
        hamburger.querySelector("span:nth-child(3)").style.transform = "none";
      } else {
        mobileNavOverlay.classList.add("open");
        hamburger.querySelector("span:nth-child(1)").style.transform = "rotate(45deg) translate(5px, 5px)";
        hamburger.querySelector("span:nth-child(2)").style.opacity = "0";
        hamburger.querySelector("span:nth-child(3)").style.transform = "rotate(-45deg) translate(6px, -6px)";
      }
    });
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener("click", () => {
      mobileNavOverlay.classList.remove("open");
      hamburger.querySelector("span:nth-child(1)").style.transform = "none";
      hamburger.querySelector("span:nth-child(2)").style.opacity = "1";
      hamburger.querySelector("span:nth-child(3)").style.transform = "none";
    });
  });

  // --- PREMIUM CURSOR TRACKER GLOW EFFECT ---
  const glow = document.createElement("div");
  glow.style.position = "fixed";
  glow.style.width = "400px";
  glow.style.height = "400px";
  glow.style.borderRadius = "50%";
  glow.style.background = "radial-gradient(circle, rgba(255,51,102,0.03) 0%, transparent 70%)";
  glow.style.pointerEvents = "none";
  glow.style.transform = "translate(-50%, -50%)";
  glow.style.zIndex = "1";
  glow.style.opacity = "0";
  glow.style.transition = "opacity 1s ease";
  document.body.appendChild(glow);

  document.addEventListener("mousemove", (e) => {
    glow.style.opacity = "1";
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
});

// Adding custom keyframes animation dynamically to style tag for slideup effect
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleTag);
