document.addEventListener("DOMContentLoaded", () => {
  
  // --- DOM ELEMENTS ---
  const sections = document.querySelectorAll(".spa-section");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  const brandLogo = document.getElementById("brand-logo");
  const hamburger = document.getElementById("hamburger");
  const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
  
  // Lightbox Elements
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxTag = document.getElementById("lightbox-tag");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  

  
  // Custom Glow
  const customGlow = document.getElementById("custom-glow");

  // --- STATE VARIABLES ---
  let activeSectionId = "overview";
  let lightboxImages = [];
  let lightboxIndex = 0;
  
  // Pagination State for Overview Grid
  const OVERVIEW_BATCH_SIZE = 24;
  let renderedOverviewCount = 0;

  // --- Shuffle Overview Data Editorially on Page Load ---
  if (typeof portfolioData !== "undefined" && portfolioData.overview) {
    portfolioData.overview = generateCuratedOverviewList(portfolioData.overview);
  }

  // --- Shuffle Editorial Projects on Page Load ---
  if (typeof portfolioData !== "undefined" && portfolioData.editorials && portfolioData.editorials.projects) {
    portfolioData.editorials.projects = shuffleProjects(portfolioData.editorials.projects);
  }

  // --- Initialize App ---
  initSPA();
  initDynamicGrids();
  initTabs();
  initContactForm();
  initCursorTracker();

  // ==========================================
  // 1. SPA ROUTING & SECTION TRANSITIONS
  // ==========================================
  function initSPA() {
    // Handle initial load hash
    const initialHash = window.location.hash.replace("#", "");
    const validSections = [
      "overview",
      "editorials",
      "campaigns-fashion",
      "campaigns-lingerie",
      "campaigns-swimwear",
      "body-form",
      "portraits-beauty",
      "film-work",
      "bio-contact",
      "unpublished-research"
    ];
    
    if (initialHash && validSections.includes(initialHash)) {
      activeSectionId = initialHash;
    } else {
      activeSectionId = "overview";
      window.location.hash = "overview";
    }
    
    switchSection(activeSectionId, false);
    
    // Hash change listener
    window.addEventListener("hashchange", () => {
      const newHash = window.location.hash.replace("#", "");
      if (newHash && validSections.includes(newHash) && newHash !== activeSectionId) {
        switchSection(newHash, true);
      }
    });

    // Nav Links click binding
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const targetSection = link.getAttribute("data-section");
        if (targetSection) {
          e.preventDefault();
          window.location.hash = targetSection;
          closeMobileMenu();
        }
      });
    });

    // Prevent default on dropdown toggle clicks
    document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
      });
    });

    // Mobile dropdown toggle
    const mobileDropdownToggle = document.querySelector(".mobile-dropdown-toggle");
    const mobileSubmenu = document.querySelector(".mobile-submenu");
    if (mobileDropdownToggle && mobileSubmenu) {
      mobileDropdownToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        mobileDropdownToggle.classList.toggle("open");
        mobileSubmenu.classList.toggle("open");
      });
    }

    // Brand Logo link click
    if (brandLogo) {
      brandLogo.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "overview";
      });
    }

    // Hamburger Menu
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
        if (isExpanded) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }
  }

  function switchSection(targetId, animate = true) {
    let sectionId = targetId;

    if (targetId === "unpublished-research") {
      sectionId = "editorials";
    }

    const currentActive = document.querySelector(".spa-section.active");
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    // Update state
    activeSectionId = targetId;

    // Update active class on nav links
    navLinks.forEach(link => {
      if (link.getAttribute("data-section") === targetId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Update parent dropdown toggle active states
    const archiveToggles = document.querySelectorAll('[data-dropdown="archive"]');
    const archiveSections = ["editorials", "campaigns-fashion", "campaigns-lingerie", "campaigns-swimwear", "unpublished-research"];
    if (archiveSections.includes(targetId)) {
      archiveToggles.forEach(toggle => toggle.classList.add("active"));
    } else {
      archiveToggles.forEach(toggle => toggle.classList.remove("active"));
    }

    if (currentActive && currentActive.id === sectionId && targetId !== "editorials" && targetId !== "unpublished-research") {
      return;
    }

    if (animate && currentActive) {
      // Fade out current
      currentActive.style.opacity = "0";
      currentActive.style.transform = "translateY(15px)";
      
      setTimeout(() => {
        currentActive.classList.remove("active");
        currentActive.style.display = "none";
        
        // Show target
        targetSection.style.display = "block";
        targetSection.offsetHeight; // trigger reflow
        targetSection.classList.add("active");
        targetSection.style.opacity = "1";
        targetSection.style.transform = "translateY(0)";
        
        if (targetId === "unpublished-research") {
          showUnpublishedResearchDirectly();
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 400);
    } else {
      // Instant transition
      sections.forEach(s => {
        s.classList.remove("active");
        s.style.display = "none";
        s.style.opacity = "0";
        s.style.transform = "translateY(15px)";
      });
      
      targetSection.style.display = "block";
      targetSection.offsetHeight; // trigger reflow
      targetSection.classList.add("active");
      targetSection.style.opacity = "1";
      targetSection.style.transform = "translateY(0)";

      if (targetId === "unpublished-research") {
        showUnpublishedResearchDirectly();
      }
    }
    
    // Close detail view of editorial when leaving the editorials tab
    if (targetId !== "unpublished-research") {
      resetEditorialDetails();
    }
  }

  function openMobileMenu() {
    hamburger.setAttribute("aria-expanded", "true");
    mobileNavOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    
    // Animate hamburger spans
    hamburger.querySelector("span:nth-child(1)").style.transform = "rotate(45deg) translate(5px, 5px)";
    hamburger.querySelector("span:nth-child(2)").style.opacity = "0";
    hamburger.querySelector("span:nth-child(3)").style.transform = "rotate(-45deg) translate(6px, -6px)";
  }

  function closeMobileMenu() {
    hamburger.setAttribute("aria-expanded", "false");
    mobileNavOverlay.classList.remove("open");
    document.body.style.overflow = "";
    
    // Reset hamburger spans
    hamburger.querySelector("span:nth-child(1)").style.transform = "none";
    hamburger.querySelector("span:nth-child(2)").style.opacity = "1";
    hamburger.querySelector("span:nth-child(3)").style.transform = "none";

    // Reset mobile dropdown and submenu
    const mobileDropdownToggle = document.querySelector(".mobile-dropdown-toggle");
    const mobileSubmenu = document.querySelector(".mobile-submenu");
    if (mobileDropdownToggle && mobileSubmenu) {
      mobileDropdownToggle.classList.remove("open");
      mobileSubmenu.classList.remove("open");
    }
  }

  // ==========================================
  // 2. DYNAMIC GRIDS & RENDERING
  // ==========================================
  function initDynamicGrids() {
    // 2.1 Overview Grid (Paginated)
    renderOverviewBatch();
    const btnLoadMore = document.getElementById("btn-overview-load-more");
    if (btnLoadMore) {
      btnLoadMore.addEventListener("click", () => {
        renderOverviewBatch();
      });
    }

    // 2.2 Editorials Covers List
    renderEditorialsGrid();

    // 2.3 Campaigns Tabs Grids
    renderGrid("campaigns-fashion-grid", portfolioData.campaigns.fashion, "FASHION");
    renderGrid("campaigns-lingerie-grid", portfolioData.campaigns.lingerie, "LINGERIE");
    renderGrid("campaigns-swimwear-grid", portfolioData.campaigns.swimwear, "SWIMMWEAR");

    // 2.4 Body & Form Tabs Grids
    renderGrid("body-organic-grid", portfolioData.body_and_form.organic_sculptures, "BODY & FORM");
    renderGrid("body-shadows-grid", portfolioData.body_and_form.shadows_and_graphic_intimacy, "BODY & FORM");

    // 2.5 Portraits & Beauty Tabs Grids
    renderGrid("pb-portraits-grid", portfolioData.portraits_and_beauty.portraits, "PORTRAITS");
    renderGrid("pb-beauty-grid", portfolioData.portraits_and_beauty.beauty, "BEAUTY");
    renderGrid("pb-pets-grid", portfolioData.portraits_and_beauty.pets_and_portraits, "PET & PORTRAITS");
    

  }

  // Helper to render basic grids
  function renderGrid(containerId, images, tag) {
    const grid = document.getElementById(containerId);
    if (!grid || !images) return;
    
    grid.innerHTML = "";
    images.forEach((img, index) => {
      const item = createGalleryItem(img, index, images, tag);
      grid.appendChild(item);
    });
  }

  // Create standard gallery item with lazy image fade-in and hover background trigger
  function createGalleryItem(img, index, imagesList, tag) {
    const item = document.createElement("div");
    const isOverviewStyle = ["OVERVIEW", "FASHION", "LINGERIE", "SWIMMWEAR", "BODY & FORM", "EDITORIALS"].includes(tag);
    
    // Use overview-item for Overview and Campaigns sections (smaller, no text, original aspect ratios)
    // and gallery-item for other sections
    if (isOverviewStyle) {
      item.classList.add("overview-item");
    } else {
      item.classList.add("gallery-item");
    }
    
    const imageElement = document.createElement("img");
    imageElement.src = img.url;
    imageElement.alt = img.title;
    imageElement.loading = "lazy";
    
    // Fade-in when fully loaded
    imageElement.addEventListener("load", () => {
      imageElement.classList.add("loaded");
    });
    
    // For cached images
    if (imageElement.complete) {
      imageElement.classList.add("loaded");
    }

    item.appendChild(imageElement);

    // Only add hover overlay text if NOT in an Overview-style section
    if (!isOverviewStyle) {
      const overlay = document.createElement("div");
      overlay.classList.add("gallery-item-overlay");
      overlay.innerHTML = `
        <h2 class="gallery-item-title">${img.title}</h2>
        <span class="gallery-item-meta">${tag}</span>
      `;
      item.appendChild(overlay);
    }

    // Open lightbox on click
    item.addEventListener("click", () => {
      openLightbox(imagesList, index);
    });

    return item;
  }



  // Overview batch pagination rendering
  function renderOverviewBatch() {
    const grid = document.getElementById("overview-grid");
    const container = document.getElementById("overview-load-more-container");
    if (!grid || !portfolioData.overview) return;

    const allImages = portfolioData.overview;
    const start = renderedOverviewCount;
    const end = Math.min(start + OVERVIEW_BATCH_SIZE, allImages.length);

    for (let i = start; i < end; i++) {
      const item = createGalleryItem(allImages[i], i, allImages, "OVERVIEW");
      grid.appendChild(item);
    }

    renderedOverviewCount = end;

    // Show/hide load more button
    if (container) {
      if (renderedOverviewCount < allImages.length) {
        container.style.display = "block";
      } else {
        container.style.display = "none";
      }
    }
  }

  // Render Editorials Covers List
  function renderEditorialsGrid() {
    const grid = document.getElementById("editorials-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // Render structured projects
    portfolioData.editorials.projects.forEach(project => {
      // Seleziona la cover ottimale: deve essere orizzontale (layout spread) e non la copertina singola
      let coverImg = null;
      if (project.id === "covers") {
        coverImg = project.images[0];
      } else {
        // Cerca la prima immagine orizzontale che non contenga "cover" nel nome
        coverImg = project.images.find(img => img.is_horizontal && !img.url.toLowerCase().includes("cover"));
        // Fallback 1: qualsiasi immagine orizzontale
        if (!coverImg) {
          coverImg = project.images.find(img => img.is_horizontal);
        }
        // Fallback 2: la prima immagine che non contenga "cover"
        if (!coverImg) {
          coverImg = project.images.find(img => !img.url.toLowerCase().includes("cover"));
        }
        // Fallback 3: la prima in assoluto
        if (!coverImg) {
          coverImg = project.images[0];
        }
      }

      const card = createEditorialCard(project.title, coverImg.url, () => {
        showEditorialProject(project);
      });
      grid.appendChild(card);
    });  }

  function createEditorialCard(title, coverUrl, clickCallback) {
    const card = document.createElement("div");
    card.classList.add("editorial-card");
    
    const inner = document.createElement("div");
    inner.classList.add("editorial-card-inner");

    const img = document.createElement("img");
    img.src = coverUrl;
    img.alt = title;
    img.loading = "lazy";
    img.classList.add("editorial-card-img");

    const overlay = document.createElement("div");
    overlay.classList.add("editorial-card-overlay");
    overlay.innerHTML = `
      <span class="editorial-card-subtitle">Editorial Project</span>
      <h2 class="editorial-card-title">${title}</h2>
    `;

    inner.appendChild(img);
    inner.appendChild(overlay);
    card.appendChild(inner);

    card.addEventListener("click", clickCallback);

    return card;
  }

  // Load selected editorial project details
  function showEditorialProject(project) {
    const listView = document.getElementById("editorials-list-view");
    const detailView = document.getElementById("editorial-detail-view");
    const detailTitle = document.getElementById("editorial-detail-title");
    const detailGrid = document.getElementById("editorial-detail-grid");

    const mag = project.magazine || "";
    const placeStr = project.place ? ` &mdash; ${project.place}` : "";
    detailTitle.innerHTML = `
      <span class="detail-title-magazine">${mag}</span>
      <span class="detail-title-main">${project.title}${placeStr}</span>
    `;
    detailGrid.innerHTML = "";

    project.images.forEach((img, index) => {
      const item = createGalleryItem(img, index, project.images, "EDITORIALS");
      detailGrid.appendChild(item);
    });

    // Inizializza i pulsanti di navigazione in fondo
    setupEditorialNavigation(project);

    // Fade out list and fade in details
    listView.style.opacity = "0";
    listView.style.transform = "translateY(10px)";
    listView.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    
    setTimeout(() => {
      listView.classList.add("hidden");
      listView.style.display = "none";
      
      detailView.style.display = "block";
      detailView.classList.remove("hidden");
      detailView.offsetHeight; // trigger reflow
      detailView.classList.add("active");
      detailView.style.opacity = "1";
      detailView.style.transform = "translateY(0)";
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  }

  // Navigazione dinamica tra storie editoriali
  function navigateToEditorialProject(nextProject) {
    const detailView = document.getElementById("editorial-detail-view");
    const detailTitle = document.getElementById("editorial-detail-title");
    const detailGrid = document.getElementById("editorial-detail-grid");
    
    if (!detailView || !detailTitle || !detailGrid) return;
    
    // Dissolvenza in uscita del contenuto corrente
    detailGrid.style.opacity = "0";
    detailGrid.style.transform = "translateY(10px)";
    detailGrid.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    
    setTimeout(() => {
      // Carica i nuovi dettagli
      const mag = nextProject.magazine || "";
      const placeStr = nextProject.place ? ` &mdash; ${nextProject.place}` : "";
      detailTitle.innerHTML = `
        <span class="detail-title-magazine">${mag}</span>
        <span class="detail-title-main">${nextProject.title}${placeStr}</span>
      `;
      detailGrid.innerHTML = "";
      
      const listImages = nextProject.images;
      listImages.forEach((img, index) => {
        const item = createGalleryItem(img, index, listImages, "EDITORIALS");
        detailGrid.appendChild(item);
      });
      
      // Ricostruisce la barra di navigazione per il nuovo progetto
      setupEditorialNavigation(nextProject);

      // Dissolvenza in ingresso dei nuovi contenuti
      detailGrid.offsetHeight; // trigger reflow
      detailGrid.style.opacity = "1";
      detailGrid.style.transform = "translateY(0)";
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 250);
  }

  // Generatore dinamico del footer di navigazione
  function setupEditorialNavigation(project) {
    const detailView = document.getElementById("editorial-detail-view");
    if (!detailView) return;

    // Rimuove footer di navigazione esistente se presente
    const oldFooter = detailView.querySelector(".project-navigation-footer");
    if (oldFooter) oldFooter.remove();

    const projectsList = [...portfolioData.editorials.projects];
    if (portfolioData.editorials.unpublished_research && portfolioData.editorials.unpublished_research.length > 0) {
      projectsList.push({
        id: "unpublished-research",
        title: "Unpublished Research",
        images: portfolioData.editorials.unpublished_research
      });
    }

    const currentIndex = projectsList.findIndex(p => p.id === project.id || (project.title === "Unpublished Research" && p.id === "unpublished-research"));
    
    if (currentIndex !== -1 && projectsList.length > 1) {
      const prevProject = projectsList[(currentIndex - 1 + projectsList.length) % projectsList.length];
      const nextProject = projectsList[(currentIndex + 1) % projectsList.length];
      
      const footer = document.createElement("div");
      footer.classList.add("project-navigation-footer");
      
      const btnPrev = document.createElement("button");
      btnPrev.classList.add("btn-nav-project");
      btnPrev.innerHTML = "&larr;";
      btnPrev.title = `Previous: ${prevProject.title}`;
      btnPrev.addEventListener("click", () => navigateToEditorialProject(prevProject));
      
      const indicator = document.createElement("span");
      indicator.classList.add("nav-indicator");
      indicator.textContent = `${currentIndex + 1} / ${projectsList.length}`;
      
      const btnNext = document.createElement("button");
      btnNext.classList.add("btn-nav-project");
      btnNext.innerHTML = "&rarr;";
      btnNext.title = `Next: ${nextProject.title}`;
      btnNext.addEventListener("click", () => navigateToEditorialProject(nextProject));
      
      footer.appendChild(btnPrev);
      footer.appendChild(indicator);
      footer.appendChild(btnNext);
      detailView.appendChild(footer);
    }
  }

  // Return to editorials covers grid
  // Return to editorials covers grid or hash redirect
  const btnBackEditorials = document.getElementById("btn-back-editorials");
  if (btnBackEditorials) {
    btnBackEditorials.addEventListener("click", () => {
      if (window.location.hash === "#editorials") {
        resetEditorialDetails();
      } else {
        window.location.hash = "editorials";
      }
    });
  }

  function showUnpublishedResearchDirectly() {
    if (typeof portfolioData !== "undefined" && portfolioData.editorials && portfolioData.editorials.unpublished_research) {
      showEditorialProject({
        title: "Unpublished Research",
        id: "unpublished-research",
        place: "",
        magazine: "",
        images: portfolioData.editorials.unpublished_research
      });
    }
  }

  function resetEditorialDetails() {
    const listView = document.getElementById("editorials-list-view");
    const detailView = document.getElementById("editorial-detail-view");

    if (!listView || !detailView || detailView.classList.contains("hidden")) return;

    detailView.style.opacity = "0";
    detailView.style.transform = "translateY(10px)";
    
    setTimeout(() => {
      detailView.classList.remove("active");
      detailView.classList.add("hidden");
      detailView.style.display = "none";
      
      listView.style.display = "block";
      listView.classList.remove("hidden");
      listView.offsetHeight; // trigger reflow
      listView.style.opacity = "1";
      listView.style.transform = "translateY(0)";
    }, 300);
  }

  // ==========================================
  // 3. TABS SYSTEMS
  // ==========================================
  function initTabs() {
    const tabLinks = document.querySelectorAll(".tab-link");
    
    tabLinks.forEach(link => {
      link.addEventListener("click", () => {
        const targetTabId = link.getAttribute("data-tab");
        const section = link.closest(".spa-section");
        if (!targetTabId || !section) return;

        // Deactivate other tabs in this section
        section.querySelectorAll(".tab-link").forEach(l => l.classList.remove("active"));
        section.querySelectorAll(".tab-content").forEach(c => {
          c.classList.remove("active");
          c.style.display = "none";
        });

        // Activate clicked tab
        link.classList.add("active");
        const targetContent = document.getElementById(targetTabId);
        if (targetContent) {
          targetContent.style.display = "block";
          targetContent.offsetHeight; // reflow
          targetContent.classList.add("active");
        }
      });
    });
  }

  // ==========================================
  // 4. UNIVERSAL LIGHTBOX ENGINE
  // ==========================================
  function openLightbox(imagesList, index) {
    if (!lightbox || !imagesList || imagesList.length === 0) return;
    
    lightboxImages = imagesList;
    lightboxIndex = index;

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // disable background scrolling

    updateLightboxContent();

    // Event listeners
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", prevLightbox);
    lightboxNext.addEventListener("click", nextLightbox);
    document.addEventListener("keydown", handleLightboxKeys);
    
    // Close on background click
    lightbox.addEventListener("click", handleLightboxBgClick);
  }

  function closeLightbox() {
    if (!lightbox) return;
    
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Clear resources
    lightboxImg.src = "";
    lightboxImg.classList.remove("loaded");

    // Remove listeners
    lightboxClose.removeEventListener("click", closeLightbox);
    lightboxPrev.removeEventListener("click", prevLightbox);
    lightboxNext.removeEventListener("click", nextLightbox);
    document.removeEventListener("keydown", handleLightboxKeys);
    lightbox.removeEventListener("click", handleLightboxBgClick);
  }

  function updateLightboxContent() {
    const currentImg = lightboxImages[lightboxIndex];
    if (!currentImg) return;

    // Fade image out before switching src
    lightboxImg.style.opacity = "0";
    lightboxImg.style.transform = "scale(0.97)";

    setTimeout(() => {
      lightboxImg.src = currentImg.url;
      lightboxImg.alt = currentImg.title;
      
      // Hide caption for Overview section to keep it clean and name-free
      const isOverview = (currentImg.tag === "OVERVIEW" || activeSectionId === "overview");
      const caption = document.querySelector(".lightbox-caption");
      if (caption) {
        if (isOverview) {
          caption.style.display = "none";
        } else {
          caption.style.display = "flex";
          
          // Cerca se l'immagine fa parte di un progetto editoriale
          const parentProject = portfolioData.editorials.projects.find(proj => 
            proj.images.some(img => img.url === currentImg.url)
          );
          const isUnpublished = portfolioData.editorials.unpublished_research && 
                                portfolioData.editorials.unpublished_research.some(img => img.url === currentImg.url);
          
          if (parentProject) {
            const mag = parentProject.magazine || "Grazia";
            const title = parentProject.title;
            const place = parentProject.place;
            const parts = [mag, title, place].filter(Boolean);
            
            lightboxTitle.textContent = parts.join(" — ");
            lightboxTag.style.display = "none";
          } else if (isUnpublished) {
            lightboxTitle.textContent = "Unpublished Research";
            lightboxTag.style.display = "none";
          } else {
            lightboxTitle.textContent = currentImg.title;
            lightboxTag.textContent = currentImg.tag || "PORTFOLIO";
            lightboxTag.style.display = "block";
          }
        }
      }

      lightboxImg.onload = () => {
        lightboxImg.style.opacity = "1";
        lightboxImg.style.transform = "scale(1)";
      };
      
      // In case image was cached
      if (lightboxImg.complete) {
        lightboxImg.style.opacity = "1";
        lightboxImg.style.transform = "scale(1)";
      }
    }, 150);
  }

  // Ottiene la lista ordinata dei progetti editoriali attivi
  function getEditorialProjectsList() {
    const projectsList = [...portfolioData.editorials.projects];
    if (portfolioData.editorials.unpublished_research && portfolioData.editorials.unpublished_research.length > 0) {
      if (!projectsList.some(p => p.id === "unpublished-research")) {
        projectsList.push({
          id: "unpublished-research",
          title: "Unpublished Research",
          place: "",
          magazine: "",
          images: portfolioData.editorials.unpublished_research
        });
      }
    }
    return projectsList;
  }

  // Sincronizza la vista di dettaglio in background del sito
  function syncBackgroundProject(project) {
    const detailTitle = document.getElementById("editorial-detail-title");
    const detailGrid = document.getElementById("editorial-detail-grid");
    if (!detailTitle || !detailGrid) return;
    
    const mag = project.magazine || "";
    const placeStr = project.place ? ` &mdash; ${project.place}` : "";
    detailTitle.innerHTML = `
      <span class="detail-title-magazine">${mag}</span>
      <span class="detail-title-main">${project.title}${placeStr}</span>
    `;
    detailGrid.innerHTML = "";
    
    const listImages = project.images;
    listImages.forEach((img, index) => {
      const item = createGalleryItem(img, index, listImages, "EDITORIALS");
      detailGrid.appendChild(item);
    });
    
    setupEditorialNavigation(project);
  }

  function nextLightbox(e) {
    if (e) e.stopPropagation();
    
    const currentImg = lightboxImages[lightboxIndex];
    let parentProject = null;
    let projectsList = [];
    
    if (currentImg && currentImg.tag === "EDITORIALS") {
      projectsList = getEditorialProjectsList();
      parentProject = projectsList.find(proj => 
        proj.images.some(img => img.url === currentImg.url)
      );
    }
    
    if (parentProject && lightboxIndex === lightboxImages.length - 1) {
      // Siamo all'ultima foto della storia corrente: passa alla storia successiva!
      const parentIdx = projectsList.findIndex(p => p.id === parentProject.id);
      const nextProject = projectsList[(parentIdx + 1) % projectsList.length];
      
      lightboxImages = nextProject.images;
      lightboxIndex = 0;
      
      syncBackgroundProject(nextProject);
      updateLightboxContent();
    } else {
      lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
      updateLightboxContent();
    }
  }

  function prevLightbox(e) {
    if (e) e.stopPropagation();
    
    const currentImg = lightboxImages[lightboxIndex];
    let parentProject = null;
    let projectsList = [];
    
    if (currentImg && currentImg.tag === "EDITORIALS") {
      projectsList = getEditorialProjectsList();
      parentProject = projectsList.find(proj => 
        proj.images.some(img => img.url === currentImg.url)
      );
    }
    
    if (parentProject && lightboxIndex === 0) {
      // Siamo alla prima foto della storia corrente: passa alla storia precedente!
      const parentIdx = projectsList.findIndex(p => p.id === parentProject.id);
      const prevProject = projectsList[(parentIdx - 1 + projectsList.length) % projectsList.length];
      
      lightboxImages = prevProject.images;
      lightboxIndex = lightboxImages.length - 1;
      
      syncBackgroundProject(prevProject);
      updateLightboxContent();
    } else {
      lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
      updateLightboxContent();
    }
  }

  function handleLightboxKeys(e) {
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      nextLightbox();
    } else if (e.key === "ArrowLeft") {
      prevLightbox();
    }
  }

  function handleLightboxBgClick(e) {
    // If click is on lightbox wrapper container, background backdrop, or caption margins, close
    const clickedInsideImage = lightboxImg.contains(e.target);
    const clickedNavs = lightboxPrev.contains(e.target) || lightboxNext.contains(e.target) || lightboxClose.contains(e.target);
    
    if (!clickedInsideImage && !clickedNavs) {
      closeLightbox();
    }
  }

  // ==========================================
  // 5. CONTACT FORM & FORMSPREE
  // ==========================================
  function initContactForm() {
    const form = document.getElementById("contact-form");
    const successMsg = document.getElementById("form-success");
    const submitBtn = document.getElementById("submit-btn");

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Basic client-side validation
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");
      const firstName = document.getElementById("first-name");
      const lastName = document.getElementById("last-name");

      if (!firstName.value.strip || !firstName.value.trim() ||
          !lastName.value.strip || !lastName.value.trim() ||
          !emailInput.value || !messageInput.value) {
        alert("Per favore, compila tutti i campi obbligatori.");
        return;
      }

      // Show loading spinner
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      // Submit via Fetch
      const formData = new FormData(form);
      
      fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        submitBtn.classList.remove("loading");
        if (response.ok) {
          // Success
          form.reset();
          form.style.display = "none";
          successMsg.classList.add("visible");
          successMsg.style.display = "flex";
        } else {
          // Error response
          response.json().then(data => {
            if (Object.hasOwn(data, 'errors')) {
              alert(data["errors"].map(error => error["message"]).join(", "));
            } else {
              alert("Si è verificato un errore durante l'invio. Riprova più tardi.");
            }
          });
          submitBtn.disabled = false;
        }
      })
      .catch(error => {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        alert("Si è verificato un errore di connessione. Controlla la tua rete.");
      });
    });
  }

  // ==========================================
  // 6. PREMIUM CURSOR GLOW EFFECT
  // ==========================================
  function initCursorTracker() {
    if (!customGlow) return;

    document.addEventListener("mousemove", (e) => {
      customGlow.style.opacity = "1";
      customGlow.style.left = `${e.clientX}px`;
      customGlow.style.top = `${e.clientY}px`;
    });

    document.addEventListener("mouseleave", () => {
      customGlow.style.opacity = "0";
    });
  }

  // Back to Top functionality
  const btnBackToTop = document.getElementById("btn-back-to-top");
  if (btnBackToTop) {
    btnBackToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ==========================================
  // 7. SMART HYBRID EDITORIAL SHUFFLE ENGINE
  // ==========================================
  function generateCuratedOverviewList(images) {
    if (!images || images.length === 0) return [];

    // Helper per rimescolare un array (Fisher-Yates Shuffle)
    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      return arr;
    }

    // Le 10 foto "opere d'arte" con forte attinenza cromatica e luxury abbinate per la prima riga
    const TOP_10_IMAGES = [
      "max-salvaggio-fotografo-drink-campaign-campari.jpg",                   // Rosso Campari vibrante
      "max-salvaggio-fotografo-moda-grazia-daniela-de-jesus-cambodia-143.jpg", // Rosso Abito / Tempio grigio scuro
      "max-salvaggio-fotografo-moda-grazia-shanghai-073.jpg",                   // Rosso tradizionale abito / Città
      "max-salvaggio-fotografo-beauty-ray-bitancourt-021.jpg",                 // Toni caldi della pelle, ritratto studio neutro
      "max-salvaggio-fotografo-lingerie-010.jpg",                             // Lingerie, luce calda candela / ombre dorate
      "max-salvaggio-fotografo-nudo-fine-art-003.jpg",                         // Nudo chiaroscuro caldo / ombre profonde
      "max-salvaggio-fotografo-moda-grazia-egypt-081.jpg",                     // Sabbia dorata deserto
      "max-salvaggio-fotografo-moda-grazia-daniela-de-jesus-mexico-088.jpeg",   // Sabbia Tulum / sole caldo
      "max-salvaggio-fotografo-nudo-fine-art-009.jpg",                         // Chiaroscuro toni caldi B&W
      "max-salvaggio-fotografo-adv-bag-dee-ocleppo.jpg"                        // Accessori, cuoio / toni caldi luxury
    ];

    // Estrai le prime 10 foto e mantieni l'ordine esatto definito sopra
    const top10List = [];
    const remainingImages = [];

    images.forEach(img => {
      const filename = img.url.split('/').pop().toLowerCase();
      // Trova corrispondenze esatte ignorando maiuscole/minuscole
      let foundIdx = -1;
      for (let i = 0; i < TOP_10_IMAGES.length; i++) {
        if (filename === TOP_10_IMAGES[i].toLowerCase()) {
          foundIdx = i;
          break;
        }
      }
      
      if (foundIdx !== -1) {
        top10List[foundIdx] = img;
      } else {
        remainingImages.push(img);
      }
    });

    // Filtra eventuali buchi se qualche nome file non corrisponde esattamente
    const finalTop10 = top10List.filter(Boolean);

    // Struttura dati per catalogare le restanti immagini
    const rawEditorialGroups = {
      cambodia: [],
      mexico: [],
      egypt: [],
      hong_kong: [],
      kenya: [],
      shanghai: [],
      sicilia: [],
      tulum: [],
      vietnam: []
    };

    const genreGroups = {
      beauty: [],
      lingerie: [],
      nude: [],
      equestrian: [],
      pets: [],
      commercial: []
    };

    // Classifica ogni scatto basandoti sul nome del file
    remainingImages.forEach(img => {
      const url = img.url.toLowerCase();
      if (url.includes("cambodia")) rawEditorialGroups.cambodia.push(img);
      else if (url.includes("egypt")) rawEditorialGroups.egypt.push(img);
      else if (url.includes("mexico")) rawEditorialGroups.mexico.push(img);
      else if (url.includes("hong-kong") || url.includes("hong_kong")) rawEditorialGroups.hong_kong.push(img);
      else if (url.includes("kenya")) rawEditorialGroups.kenya.push(img);
      else if (url.includes("shanghai")) rawEditorialGroups.shanghai.push(img);
      else if (url.includes("sicilia")) rawEditorialGroups.sicilia.push(img);
      else if (url.includes("tulum")) rawEditorialGroups.tulum.push(img);
      else if (url.includes("vietnam")) rawEditorialGroups.vietnam.push(img);
      else if (url.includes("beauty") || url.includes("bitancourt")) genreGroups.beauty.push(img);
      else if (url.includes("lingerie")) genreGroups.lingerie.push(img);
      else if (url.includes("nude") || url.includes("nudo")) genreGroups.nude.push(img);
      else if (url.includes("polo") || url.includes("cavallo")) genreGroups.equestrian.push(img);
      else if (url.includes("cane") || url.includes("pet")) genreGroups.pets.push(img);
      else genreGroups.commercial.push(img);
    });

    // Rimescola le restanti foto all'interno di ciascuna categoria di genere
    Object.keys(genreGroups).forEach(key => {
      shuffleArray(genreGroups[key]);
    });

    // Mantiene le storie editoriali UNITE, COMPLETE e SEQUENZIALI (senza spezzarle in blocchi e senza rimescolarle internamente)
    // per non perdere il senso della pubblicazione originale/storia
    const editorialGroups = [
      rawEditorialGroups.cambodia,
      rawEditorialGroups.mexico,
      rawEditorialGroups.egypt,
      rawEditorialGroups.hong_kong,
      rawEditorialGroups.kenya,
      rawEditorialGroups.shanghai,
      rawEditorialGroups.sicilia,
      rawEditorialGroups.tulum,
      rawEditorialGroups.vietnam
    ].filter(g => g.length > 0);

    const activeGenres = [
      genreGroups.beauty, genreGroups.lingerie, genreGroups.nude,
      genreGroups.equestrian, genreGroups.pets, genreGroups.commercial
    ].filter(g => g.length > 0);

    // Rimescola la sequenza dei blocchi editoriali e dei generi distanziatori
    shuffleArray(editorialGroups);
    shuffleArray(activeGenres);

    const result = [...finalTop10]; // Inserisci prima le 10 foto cromatica-luxury
    let genreIndex = 0;

    for (let i = 0; i < editorialGroups.length; i++) {
      // 1. Aggiungi il blocco editoriale sequenziale
      result.push(...editorialGroups[i]);

      // 2. Se non è l'ultimo blocco, inserisci un distanziatore coerente di 4 foto di un altro genere
      if (i < editorialGroups.length - 1 && activeGenres.length > 0) {
        let attempts = 0;
        let found = false;
        
        while (attempts < activeGenres.length) {
          const currentGenre = activeGenres[genreIndex];
          if (currentGenre && currentGenre.length >= 4) {
            const separatorImages = currentGenre.splice(0, 4);
            result.push(...separatorImages);
            found = true;
            genreIndex = (genreIndex + 1) % activeGenres.length;
            break;
          }
          genreIndex = (genreIndex + 1) % activeGenres.length;
          attempts++;
        }

        if (!found) {
          for (let g = 0; g < activeGenres.length; g++) {
            if (activeGenres[g].length > 0) {
              const count = Math.min(4, activeGenres[g].length);
              const separatorImages = activeGenres[g].splice(0, count);
              result.push(...separatorImages);
              break;
            }
          }
        }
      }
    }

    activeGenres.forEach(genre => {
      if (genre.length > 0) {
        result.push(...genre);
      }
    });

    return result;
  }

  // ==========================================
  // 8. SHUFFLE EDITORIAL PROJECTS ENGINE (ALTERNATED)
  // ==========================================
  function shuffleProjects(projects) {
    if (!projects || projects.length <= 1) return projects;

    // Helper per estrarre la categoria tematica/ambientazione dal project-id
    function getCategory(pid) {
      const id = pid.toLowerCase();
      if (id.includes("hong-kong") || id.includes("shanghai")) return "urban";
      if (id.includes("safari") || id.includes("egypt") || id.includes("specie") || id.includes("viaggio-oriente")) return "desert";
      if (id.includes("giungla") || id.includes("seduzioni")) return "exotic";
      if (id.includes("dark") || id.includes("nero") || id.includes("mito")) return "studio-dark";
      if (id.includes("bianco") || id.includes("leggerezza") || id.includes("romanzo")) return "bright";
      return "classic"; // covers, bon-ton, dettaglio
    }

    const covers = projects.find(p => p.id === "covers");
    const others = projects.filter(p => p.id !== "covers");

    // Rimescola in modo casuale gli altri progetti
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = others[i];
      others[i] = others[j];
      others[j] = temp;
    }

    // Risolutore ad alternanza per impedire categorie consecutive uguali
    const arranged = [];
    let lastCategory = "";
    
    if (covers) {
      arranged.push(covers);
      lastCategory = getCategory(covers.id);
    }

    const pool = [...others];
    let stuckCount = 0;

    while (pool.length > 0 && stuckCount < 100) {
      let found = false;
      for (let i = 0; i < pool.length; i++) {
        const cat = getCategory(pool[i].id);
        if (cat !== lastCategory) {
          arranged.push(pool[i]);
          lastCategory = cat;
          pool.splice(i, 1);
          found = true;
          stuckCount = 0;
          break;
        }
      }
      if (!found) {
        // Se non ci sono opzioni valide (es. tutti gli elementi rimasti appartengono alla stessa categoria)
        // inseriamo il primo elemento del pool per evitare loop infiniti
        arranged.push(pool[0]);
        lastCategory = getCategory(pool[0].id);
        pool.splice(0, 1);
        stuckCount++;
      }
    }

    return arranged;
  }
});
