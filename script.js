/* ╔══════════════════════════════════════════════════════════════╗
   ║  ROMANTIC BIRTHDAY WEBSITE — SCRIPT.JS                      ║
   ║  Handles animations, music, scrolling, and interactions     ║
   ╚══════════════════════════════════════════════════════════════╝ */

document.addEventListener('DOMContentLoaded', () => {
    // ─── Elements ───
    const startBtn = document.getElementById('start-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicLabel = musicToggle?.querySelector('.music-label');
    const voiceAudio = document.getElementById('voice-audio');
    const voicePlayBtn = document.getElementById('voice-play-btn');
    const voiceProgress = document.getElementById('voice-progress');
    const voiceCurrentTime = document.getElementById('voice-current');
    const voiceDuration = document.getElementById('voice-duration');
    const voiceWave = document.querySelector('.audio-wave');
    const heartsContainer = document.getElementById('hearts-container');

    let isMusicPlaying = false;

    // ─── 1. START BUTTON — Smooth scroll to Our Story ───
    startBtn?.addEventListener('click', () => {
        const storySection = document.getElementById('our-story');
        if (storySection) {
            storySection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // ─── 2. FLOATING HEARTS ───
    const heartEmojis = ['💕', '💗', '💖', '💝', '♥️', '🩷', '🤍', '✨', '🌸'];

    function createHeart() {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
        heart.style.animationDuration = (8 + Math.random() * 12) + 's';
        heartsContainer?.appendChild(heart);

        heart.addEventListener('animationend', () => heart.remove());
    }

    // Spawn hearts periodically
    setInterval(createHeart, 1800);
    // Create a few initial hearts
    for (let i = 0; i < 5; i++) {
        setTimeout(createHeart, i * 400);
    }

    // ─── 3. SCROLL REVEAL ANIMATION ───
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('[data-reveal]').forEach(el => {
        revealObserver.observe(el);
    });

    // ─── 4. CAROUSEL GALLERY (Auto-sliding with image + video support) ───
    const carouselTrack = document.getElementById('carousel-track');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselPrev = document.getElementById('carousel-prev');
    const carouselNext = document.getElementById('carousel-next');
    const carouselDotsContainer = document.getElementById('carousel-dots');
    const gallerySection = document.getElementById('gallery');
    let musicStarted = false;

    let currentSlide = 0;
    let slideCount = carouselSlides.length;
    let autoSlideTimer = null;
    let videoTimer = null;
    let isGalleryVisible = false;

    // ── Build progress dots ──
    if (carouselDotsContainer && slideCount > 0) {
        // If many slides, add class for smaller dots
        if (slideCount > 12) {
            carouselDotsContainer.classList.add('many-dots');
        }
        carouselSlides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            carouselDotsContainer.appendChild(dot);
        });
    }

    function updateDots() {
        const dots = carouselDotsContainer?.querySelectorAll('.carousel-dot');
        dots?.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    function goToSlide(index) {
        // Stop any running video timers
        clearTimeout(videoTimer);
        stopAllVideos();

        currentSlide = ((index % slideCount) + slideCount) % slideCount;
        if (carouselTrack) {
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        updateDots();
        activateSlide();
        resetAutoSlide();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function stopAllVideos() {
        carouselSlides.forEach(slide => {
            const video = slide.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
    }

    function activateSlide() {
        const currentSlideEl = carouselSlides[currentSlide];
        if (!currentSlideEl) return;

        const isVideo = currentSlideEl.dataset.type === 'video';

        if (isVideo) {
            const video = currentSlideEl.querySelector('video');
            if (video) {
                video.currentTime = 0;
                video.muted = true;
                video.play().catch(() => {});
                // Auto-advance after 3 seconds regardless of video length
                videoTimer = setTimeout(() => {
                    video.pause();
                    nextSlide();
                }, 3000);
            }
        }
        // Images use the autoSlideTimer (set in resetAutoSlide)
    }

    function resetAutoSlide() {
        clearInterval(autoSlideTimer);
        const currentSlideEl = carouselSlides[currentSlide];
        const isVideo = currentSlideEl?.dataset.type === 'video';

        // Only set auto-timer for images; videos handle their own timing
        if (!isVideo) {
            autoSlideTimer = setInterval(() => {
                nextSlide();
            }, 3000);
        }
    }

    // Nav button listeners
    carouselPrev?.addEventListener('click', prevSlide);
    carouselNext?.addEventListener('click', nextSlide);

    // Keyboard arrows when gallery is in view
    document.addEventListener('keydown', (e) => {
        if (!isGalleryVisible) return;
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselTrack?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // ─── 4b. GALLERY OBSERVER — Start carousel + music when visible ───
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                isGalleryVisible = true;
                musicToggle?.classList.add('visible');

                // Start carousel auto-play
                activateSlide();
                resetAutoSlide();

                // Start background music
                if (!musicStarted && bgMusic) {
                    bgMusic.volume = 0.3;
                    bgMusic.play().then(() => {
                        isMusicPlaying = true;
                        musicStarted = true;
                        musicToggle?.classList.add('playing');
                        if (musicLabel) musicLabel.textContent = 'Pause';
                    }).catch(() => {
                        if (musicLabel) musicLabel.textContent = 'Play';
                    });
                }
            } else {
                isGalleryVisible = false;
                // Pause carousel when not visible
                clearInterval(autoSlideTimer);
                clearTimeout(videoTimer);
                stopAllVideos();
            }
        });
    }, { threshold: 0.3 });

    if (gallerySection) {
        galleryObserver.observe(gallerySection);
    }

    // Music toggle button
    musicToggle?.addEventListener('click', () => {
        if (!bgMusic) return;
        if (isMusicPlaying) {
            bgMusic.pause();
            isMusicPlaying = false;
            musicToggle.classList.remove('playing');
            if (musicLabel) musicLabel.textContent = 'Play';
        } else {
            bgMusic.volume = 0.3;
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                musicStarted = true;
                musicToggle.classList.add('playing');
                if (musicLabel) musicLabel.textContent = 'Pause';
            }).catch(() => {});
        }
    });

    // ─── 5. VOICE NOTE PLAYER ───
    let isVoicePlaying = false;

    voicePlayBtn?.addEventListener('click', () => {
        if (!voiceAudio) return;
        if (isVoicePlaying) {
            voiceAudio.pause();
            isVoicePlaying = false;
            updatePlayButton(false);
            voiceWave?.classList.remove('active');
        } else {
            voiceAudio.play().then(() => {
                isVoicePlaying = true;
                updatePlayButton(true);
                voiceWave?.classList.add('active');
            }).catch(() => {});
        }
    });

    function updatePlayButton(playing) {
        const playIcon = voicePlayBtn?.querySelector('.play-icon');
        const pauseIcon = voicePlayBtn?.querySelector('.pause-icon');
        if (playIcon) playIcon.style.display = playing ? 'none' : 'block';
        if (pauseIcon) pauseIcon.style.display = playing ? 'block' : 'none';
    }

    voiceAudio?.addEventListener('timeupdate', () => {
        if (voiceAudio.duration) {
            const percent = (voiceAudio.currentTime / voiceAudio.duration) * 100;
            if (voiceProgress) voiceProgress.style.width = percent + '%';
            if (voiceCurrentTime) voiceCurrentTime.textContent = formatTime(voiceAudio.currentTime);
        }
    });

    voiceAudio?.addEventListener('loadedmetadata', () => {
        if (voiceDuration) voiceDuration.textContent = formatTime(voiceAudio.duration);
    });

    voiceAudio?.addEventListener('ended', () => {
        isVoicePlaying = false;
        updatePlayButton(false);
        voiceWave?.classList.remove('active');
        if (voiceProgress) voiceProgress.style.width = '0%';
        if (voiceCurrentTime) voiceCurrentTime.textContent = '0:00';
    });

    // Click on progress bar to seek
    const progressBar = document.querySelector('.audio-progress-bar');
    progressBar?.addEventListener('click', (e) => {
        if (!voiceAudio || !voiceAudio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        voiceAudio.currentTime = percent * voiceAudio.duration;
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + secs.toString().padStart(2, '0');
    }

    // ─── 6. (Carousel replaces old lightbox — see section 4 above) ───

    // ─── 7. LOVE LETTER FINALE — Burst of hearts ───
    const letterSection = document.getElementById('love-letter');
    const finaleHearts = document.querySelector('.finale-hearts');
    let finaleTriggered = false;

    const letterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !finaleTriggered) {
                finaleTriggered = true;
                // Burst of hearts when love letter is reached
                for (let i = 0; i < 20; i++) {
                    setTimeout(createHeart, i * 150);
                }
            }
        });
    }, { threshold: 0.4 });

    if (letterSection) {
        letterObserver.observe(letterSection);
    }

    // ─── 8. PARALLAX-LIKE SUBTLE EFFECT ON LANDING ───
    const landingSection = document.getElementById('landing');
    const landingContent = document.querySelector('.landing-content');

    window.addEventListener('scroll', () => {
        if (!landingSection || !landingContent) return;
        const scrolled = window.scrollY;
        const landingHeight = landingSection.offsetHeight;

        if (scrolled < landingHeight) {
            const progress = scrolled / landingHeight;
            landingContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            landingContent.style.opacity = 1 - progress * 1.2;
        }
    }, { passive: true });

    // ─── 9. SECTION NAV DOTS (Subtle side navigation) ───
    createNavDots();

    function createNavDots() {
        const sections = document.querySelectorAll('.section');
        const nav = document.createElement('nav');
        nav.className = 'section-nav';
        nav.setAttribute('aria-label', 'Section navigation');

        const sectionNames = ['Home', 'Story', 'Reasons', 'Gallery', 'Comic', 'Voice', 'Letter'];

        sections.forEach((section, index) => {
            const dot = document.createElement('button');
            dot.className = 'nav-dot';
            dot.setAttribute('aria-label', `Go to ${sectionNames[index] || 'section'}`);
            dot.dataset.tooltip = sectionNames[index] || '';
            dot.addEventListener('click', () => {
                section.scrollIntoView({ behavior: 'smooth' });
            });
            nav.appendChild(dot);
        });

        document.body.appendChild(nav);

        // Style the nav dots
        const style = document.createElement('style');
        style.textContent = `
            .section-nav {
                position: fixed;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                gap: 12px;
                z-index: 50;
            }
            .nav-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid rgba(232, 135, 158, 0.5);
                background: transparent;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }
            .nav-dot:hover,
            .nav-dot.active {
                background: #e8879e;
                border-color: #e8879e;
                transform: scale(1.3);
            }
            .nav-dot::before {
                content: attr(data-tooltip);
                position: absolute;
                right: 24px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(90, 61, 74, 0.9);
                color: white;
                padding: 4px 12px;
                border-radius: 6px;
                font-size: 0.75rem;
                font-family: 'Poppins', sans-serif;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            .nav-dot:hover::before {
                opacity: 1;
            }
            @media (max-width: 768px) {
                .section-nav { display: none; }
            }
        `;
        document.head.appendChild(style);

        // Active dot tracking
        const dotObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(sections).indexOf(entry.target);
                    nav.querySelectorAll('.nav-dot').forEach((d, i) => {
                        d.classList.toggle('active', i === index);
                    });
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(s => dotObserver.observe(s));
    }
});
