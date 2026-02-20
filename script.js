// SPA navigation and Formspree contact handler

function navigate(page) {
  fetch(`pages/${page}.html`)
    .then(res => res.text())
    .then(data => {
      document.getElementById('content').innerHTML = data;
      history.pushState(null, '', `#${page}`);
      attachContactHandler();
    })
    .catch(() => {
      document.getElementById('content').innerHTML = '<p>Page not found.</p>';
    });
}

// Handle back/forward navigation
window.addEventListener('popstate', () => {
  const page = location.hash.replace('#', '') || 'home';
  navigate(page);
});

// Load initial page (run immediately if DOM already loaded)
const initPage = () => {
  const page = location.hash.replace('#', '') || 'home';
  navigate(page);
};
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

// --- Contact form (Formspree) ---
// Set your Formspree endpoint
const FORM_ENDPOINT = "https://formspree.io/f/mojlkonl";

async function handleContactSubmit(e) {
  const form = document.getElementById('contactForm');
  if (!form) return;
  e.preventDefault();

  const statusEl = document.getElementById('contactStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  if (statusEl) {
    statusEl.textContent = 'Sending...';
    statusEl.className = 'form-status sending';
  }

  try {
    const formData = new FormData(form);
    formData.append('_subject', 'Website contact form');

    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });

    if (res.ok) {
      if (statusEl) {
        statusEl.textContent = 'Message sent — thank you!';
        statusEl.className = 'form-status success';
      }
      form.reset();
    } else {
      const data = await res.json().catch(() => null);
      const msg = data && data.error ? data.error : res.statusText;
      if (statusEl) {
        statusEl.textContent = 'Send failed. ' + msg;
        statusEl.className = 'form-status error';
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = 'Send failed. ' + err.message;
      statusEl.className = 'form-status error';
    }
  } finally {
    submitBtn.disabled = false;
  }
}

function attachContactHandler() {
  const form = document.getElementById('contactForm');
  if (form && !form._handlerAttached) {
    form.addEventListener('submit', handleContactSubmit);
    form._handlerAttached = true;
  }
}

// Also attempt to attach when user interacts (covers SPA edge cases)
document.addEventListener('click', attachContactHandler);

// --- Game Portfolio Modal Functions ---
let currentImageIndex = 0;
let currentGameImages = [];

function openGameModal(event) {
  if (event) event.stopPropagation();
  
  // Get the capsule element
  const capsule = event.target.closest('.game-capsule');
  if (!capsule) return;
  
  // Extract game data from attributes
  const gameData = {
    title: capsule.dataset.gameTitle,
    description: capsule.dataset.gameDescription,
    tags: capsule.dataset.gameTags.split(',').map(t => t.trim()),
    images: capsule.dataset.gameImages.split(',').map(img => img.trim()),
    itch: capsule.dataset.gameItch,
    doc: capsule.dataset.gameDoc
  };
  
  // Populate modal with game data
  populateGameModal(gameData);
  
  // Open modal
  const modal = document.getElementById('gameModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function populateGameModal(gameData) {
  // Set title
  document.getElementById('gameTitle').textContent = gameData.title;
  
  // Set images and reset index
  currentGameImages = gameData.images;
  currentImageIndex = 0;
  document.getElementById('mainGameImage').src = gameData.images[0];
  
  // Populate thumbnails
  const thumbnailContainer = document.getElementById('thumbnailContainer');
  thumbnailContainer.innerHTML = '';
  gameData.images.forEach((img, index) => {
    const thumb = document.createElement('img');
    thumb.className = 'thumbnail' + (index === 0 ? ' active' : '');
    thumb.src = img;
    thumb.alt = 'Screenshot';
    thumb.onclick = function() { changeMainImage(this); };
    thumbnailContainer.appendChild(thumb);
  });
  
  // Populate tags
  const tagsContainer = document.getElementById('gameTags');
  tagsContainer.innerHTML = '';
  gameData.tags.forEach(tag => {
    const tagEl = document.createElement('span');
    const tagClass = 'tag-' + tag.toLowerCase().replace(/\s+/g, '-');
    // Only add background color class if tag has a defined color
    const coloredTags = ['level design', 'programming', 'narrative', 'art', 'audio', 'game design', 'systems design'];
    tagEl.className = 'tag' + (coloredTags.includes(tag.toLowerCase()) ? ' ' + tagClass : '');
    tagEl.textContent = tag;
    tagsContainer.appendChild(tagEl);
  });
  
  // Populate description (split by |)
  const descriptionContainer = document.getElementById('gameDescriptionContainer');
  descriptionContainer.innerHTML = '';
  const descParagraphs = gameData.description.split('|').map(p => p.trim()).filter(p => p);
  descParagraphs.forEach(para => {
    const p = document.createElement('p');
    p.style.margin = '0 0 12px 0';
    p.style.lineHeight = '1.6';
    p.style.fontFamily = '"Sniglet"';
    p.style.color = '#e0e0e0';
    p.style.fontSize = '1rem';
    p.textContent = para;
    descriptionContainer.appendChild(p);
  });
  
  // Set buttons - only show if href exists
  const itchButton = document.getElementById('itchButton');
  const docButton = document.getElementById('docButton');
  
  if (gameData.itch) {
    itchButton.href = gameData.itch;
    itchButton.style.display = 'inline-block';
  } else {
    itchButton.style.display = 'none';
  }
  
  if (gameData.doc) {
    docButton.href = gameData.doc;
    docButton.style.display = 'inline-block';
  } else {
    docButton.style.display = 'none';
  }
}

function closeGameModal(event) {
  if (event) event.stopPropagation();
  const modal = document.getElementById('gameModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function nextImage() {
  if (currentGameImages.length > 0) {
    currentImageIndex = (currentImageIndex + 1) % currentGameImages.length;
    document.getElementById('mainGameImage').src = currentGameImages[currentImageIndex];
    updateActiveThumbnail();
  }
}

function previousImage() {
  if (currentGameImages.length > 0) {
    currentImageIndex = (currentImageIndex - 1 + currentGameImages.length) % currentGameImages.length;
    document.getElementById('mainGameImage').src = currentGameImages[currentImageIndex];
    updateActiveThumbnail();
  }
}

function changeMainImage(thumbnail) {
  const thumbnails = document.querySelectorAll('.thumbnail');
  currentImageIndex = Array.from(thumbnails).indexOf(thumbnail);
  document.getElementById('mainGameImage').src = thumbnail.src;
  updateActiveThumbnail();
}

function updateActiveThumbnail() {
  document.querySelectorAll('.thumbnail').forEach((t, index) => {
    if (index === currentImageIndex) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
}

// Close modal when clicking outside (on overlay)
document.addEventListener('click', function(event) {
  const modal = document.getElementById('gameModal');
  if (!modal) return;
  
  const overlay = modal.querySelector('.modal-overlay');
  if (overlay && event.target === overlay) {
    closeGameModal();
  }
});

// --- Grid helper: center single item in last row ---
function updateGridLastRowCenter() {
  const grid = document.querySelector('.games-grid');
  if (!grid) return;
  const capsules = Array.from(grid.querySelectorAll('.game-capsule'));
  // clear any previous marker
  capsules.forEach(c => c.classList.remove('single-last'));
  if (capsules.length === 0) return;

  const last = capsules[capsules.length - 1];
  const lastTop = last.offsetTop;
  const lastRowItems = capsules.filter(c => c.offsetTop === lastTop);
  if (lastRowItems.length === 1) {
    last.classList.add('single-last');
  }
}

// Run on load and resize
window.addEventListener('resize', () => {
  // debounce briefly
  clearTimeout(window._gridCenterTimer);
  window._gridCenterTimer = setTimeout(updateGridLastRowCenter, 80);
});
window.addEventListener('DOMContentLoaded', updateGridLastRowCenter);

// Observe content changes (works with SPA page injection)
const contentRoot = document.getElementById('content');
if (contentRoot) {
  const obs = new MutationObserver(() => updateGridLastRowCenter());
  obs.observe(contentRoot, { childList: true, subtree: true });
}

// Also run once after script loads (covers immediate state)
setTimeout(updateGridLastRowCenter, 120);

// --- Project (Narrative & Props) Modal Functions ---
// Carousel items: { type: 'video|image', src: '...' }
let currentProjectCarouselIndex = 0;
let currentProjectCarousel = [];

function openProjectModal(event) {
  if (event) event.stopPropagation();
  const capsule = event.target.closest('.game-capsule');
  if (!capsule) return;

  const projectData = {
    title: capsule.dataset.projectTitle,
    description: capsule.dataset.projectDescription || '',
    tags: capsule.dataset.projectTags ? capsule.dataset.projectTags.split(',').map(t => t.trim()) : [],
    images: capsule.dataset.projectImages ? capsule.dataset.projectImages.split(',').map(i => i.trim()) : [],
    video: capsule.dataset.projectVideo || ''
  };

  populateProjectModal(projectData);

  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function populateProjectModal(data) {
  const titleEl = document.getElementById('projectTitle');
  if (titleEl) titleEl.textContent = data.title || '';

  // Build carousel: video first (if present), then images
  currentProjectCarousel = [];
  if (data.video) {
    currentProjectCarousel.push({ type: 'video', src: data.video });
  }
  (data.images || []).forEach(img => {
    currentProjectCarousel.push({ type: 'image', src: img });
  });
  
  currentProjectCarouselIndex = 0;
  
  // Display first item
  displayProjectCarouselItem(0);

  // Thumbnails: video first, then images
  const thumbContainer = document.getElementById('projectThumbnailContainer');
  if (thumbContainer) {
    thumbContainer.innerHTML = '';
    currentProjectCarousel.forEach((item, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'thumbnail' + (idx === 0 ? ' active' : '');
      thumb.style.cursor = 'pointer';
      thumb.style.position = 'relative';
      thumb.style.width = '100px';
      thumb.style.height = '100px';
      //thumb.style.borderRadius = '8px';
      thumb.style.overflow = 'hidden';
      //thumb.style.border = '3px solid rgba(255, 210, 0, 0.3)';
      thumb.style.transition = 'all 0.3s ease';
      thumb.style.flexShrink = '0';
      
      if (item.type === 'video') {
        // YouTube video thumbnail: extract video ID and use YouTube's thumbnail
        const videoId = extractYouTubeId(item.src);
        const thumbSrc = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const img = document.createElement('img');
        img.src = thumbSrc;
        img.alt = 'Video thumbnail';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        thumb.appendChild(img);
        
        // Play icon overlay
        const playIcon = document.createElement('div');
        playIcon.style.position = 'absolute';
        playIcon.style.top = '50%';
        playIcon.style.left = '50%';
        playIcon.style.transform = 'translate(-50%, -50%)';
        playIcon.style.fontSize = '30px';
        playIcon.style.color = 'white';
        playIcon.style.textShadow = '0 0 10px rgba(0,0,0,0.8)';
        playIcon.textContent = '▶';
        thumb.appendChild(playIcon);
      } else {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = 'Project image';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        thumb.appendChild(img);
      }
      
      thumb.onclick = function() { changeProjectCarouselItem(idx); };
      thumbContainer.appendChild(thumb);
    });
  }

  // Tags
  const tagsContainer = document.getElementById('projectTags');
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
    (data.tags || []).forEach(tag => {
      const tagEl = document.createElement('span');
      const tagClass = 'tag-' + tag.toLowerCase().replace(/\s+/g, '-');
      const coloredTags = ['art','narrative','prop design','manufacturing','design'];
      tagEl.className = 'tag' + (coloredTags.includes(tag.toLowerCase()) ? ' ' + tagClass : '');
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });
  }

  // Description (split by |)
  const descContainer = document.getElementById('projectDescriptionContainer');
  if (descContainer) {
    descContainer.innerHTML = '';
    const paragraphs = (data.description || '').split('|').map(p => p.trim()).filter(Boolean);
    paragraphs.forEach(pText => {
      const p = document.createElement('p');
      p.style.margin = '0 0 12px 0';
      p.style.lineHeight = '1.6';
      p.style.fontFamily = '"Sniglet"';
      p.style.color = '#e0e0e0';
      p.style.fontSize = '1rem';
      p.textContent = pText;
      descContainer.appendChild(p);
    });
  }
}

function extractYouTubeId(url) {
  // Handle various YouTube URL formats
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1].split('?')[0];
  }
  return videoId;
}

function displayProjectCarouselItem(index) {
  if (currentProjectCarousel.length === 0) return;
  
  const item = currentProjectCarousel[index];
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const mainContainer = modal.querySelector('.project-main-media');
  if (!mainContainer) return;
  
  if (!mainContainer) return;
  
  // Ensure container has proper positioning for absolute arrows
  mainContainer.style.position = 'relative';
  
  // Clear main container
  mainContainer.innerHTML = '';
  
  // Display video or image
  if (item.type === 'video') {
    const embedUrl = convertToEmbedUrl(item.src);
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = 'none';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    mainContainer.appendChild(iframe);
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = 'Project image';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    mainContainer.appendChild(img);
  }
  
  // Navigation arrows
  const leftArrow = document.createElement('button');
  leftArrow.className = 'nav-arrow left-arrow';
  leftArrow.innerHTML = '&lt;';
  leftArrow.onclick = previousProjectImage;
  mainContainer.appendChild(leftArrow);
  
  const rightArrow = document.createElement('button');
  rightArrow.className = 'nav-arrow right-arrow';
  rightArrow.innerHTML = '&gt;';
  rightArrow.onclick = nextProjectImage;
  mainContainer.appendChild(rightArrow);
}

/*function convertToEmbedUrl(url) {
  // Convert various YouTube URL formats to embed URL
  let videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url; // Return original if conversion fails
}*/

function convertToEmbedUrl(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return url;

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&enablejsapi=1`;
}

function closeProjectModal(event) {
  if (event) event.stopPropagation();
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function nextProjectImage() {
  if (currentProjectCarousel.length > 0) {
    currentProjectCarouselIndex = (currentProjectCarouselIndex + 1) % currentProjectCarousel.length;
    displayProjectCarouselItem(currentProjectCarouselIndex);
    updateProjectActiveThumbnail();
  }
}

function previousProjectImage() {
  if (currentProjectCarousel.length > 0) {
    currentProjectCarouselIndex = (currentProjectCarouselIndex - 1 + currentProjectCarousel.length) % currentProjectCarousel.length;
    displayProjectCarouselItem(currentProjectCarouselIndex);
    updateProjectActiveThumbnail();
  }
}

function changeProjectCarouselItem(index) {
  currentProjectCarouselIndex = index;
  displayProjectCarouselItem(index);
  updateProjectActiveThumbnail();
}

function updateProjectActiveThumbnail() {
  document.querySelectorAll('.carousel-thumb').forEach((t, idx) => {
    if (idx === currentProjectCarouselIndex) t.classList.add('active'); else t.classList.remove('active');
  });
}
