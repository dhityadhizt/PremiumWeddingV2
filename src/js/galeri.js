import { data } from "../assets/data/data.js";
import { galleryService } from "../services/galleryService.js";

const MAX_IMAGE_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;

export const galeri = () => {
    const galeriElement = document.querySelector('.galeri');
    const container = galeriElement.querySelector('.container');
    const showAllContainer = galeriElement.querySelector('.galeri-modal-all');

    const figureElement = container.querySelector('figure');
    const paginationElement = container.querySelector('ul');
    const prevButton = container.querySelector('button[aria-label="button prev galeri"]');
    const nextButton = container.querySelector('button[aria-label="button next galeri"]');
    const openCameraBtn = document.getElementById('open-live-camera-btn');
    const showAllButton = document.getElementById('show-all-photos-btn');

    const showAllBox = showAllContainer.querySelector('div');
    const closeButton = showAllContainer.querySelector('button[aria-label="close button"]');

    const cameraModal = document.getElementById('live-camera-modal');
    const closeCameraBtn = document.getElementById('close-camera-modal');
    const guestNameInput = document.getElementById('camera-guest-name');
    const videoStreamEl = document.getElementById('live-video-stream');
    const canvasEl = document.getElementById('live-photo-canvas');
    const previewImgEl = document.getElementById('live-photo-preview');
    const loadingOverlay = document.getElementById('camera-loading-overlay');
    const statusTextEl = document.getElementById('camera-status-text');

    const captureControls = document.getElementById('camera-capture-controls');
    const previewControls = document.getElementById('camera-preview-controls');
    const switchCameraBtn = document.getElementById('switch-camera-btn');
    const capturePhotoBtn = document.getElementById('capture-photo-btn');
    const triggerNativeCamBtn = document.getElementById('trigger-native-cam-btn');
    const nativeCameraInput = document.getElementById('native-camera-input');
    const retakePhotoBtn = document.getElementById('retake-photo-btn');
    const uploadPhotoBtn = document.getElementById('upload-photo-btn');

    let galleryItems = [...data.galeri];
    let currentIndex = 0;
    let autoPlayTimer = null;

    let currentStream = null;
    let facingMode = 'environment';
    let capturedImageDataUrl = null;
    let lastCaptureMode = 'native';

    const isMobileDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    };

    const urlParams = new URLSearchParams(window.location.search);
    const toParam = urlParams.get('to');
    if (toParam && guestNameInput) {
        guestNameInput.value = toParam;
    }

    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    const fitDimensions = (width, height, maxDim) => {
        let w = width || 1280;
        let h = height || 720;
        if (w > maxDim || h > maxDim) {
            if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
            } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
            }
        }
        return { width: w, height: h };
    };

    const showPreviewState = (dataUrl, mode) => {
        capturedImageDataUrl = dataUrl;
        lastCaptureMode = mode;
        previewImgEl.src = capturedImageDataUrl;
        videoStreamEl.style.display = 'none';
        previewImgEl.style.display = 'block';
        captureControls.style.display = 'none';
        previewControls.style.display = 'flex';
        loadingOverlay.style.display = 'none';
        cameraModal.classList.add('active');
        cameraModal.setAttribute('aria-hidden', 'false');
    };

    const renderCarousel = () => {
        if (galleryItems.length === 0) return;
        if (currentIndex >= galleryItems.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = galleryItems.length - 1;

        const currentItem = galleryItems[currentIndex];
        const captionHtml = currentItem.guestName
            ? `<figcaption class="galeri-caption"><i class='bx bxs-camera'></i> Foto oleh: <strong>${escapeHtml(currentItem.guestName)}</strong></figcaption>`
            : '';

        figureElement.innerHTML = `
            <img src="${currentItem.image}" alt="galeri image" id="${currentItem.id}" loading="lazy">
            ${captionHtml}
        `;

        paginationElement.innerHTML = '';
        galleryItems.forEach((item, idx) => {
            const li = document.createElement('li');
            li.dataset.index = idx;
            if (idx === currentIndex) li.classList.add('active');
            li.addEventListener('click', () => {
                currentIndex = idx;
                renderCarousel();
                resetAutoPlay();
            });
            paginationElement.appendChild(li);
        });
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        renderCarousel();
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        renderCarousel();
    };

    const resetAutoPlay = () => {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(nextSlide, 3500);
    };

    nextButton.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });

    prevButton.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });

    showAllButton.addEventListener('click', () => {
        showAllBox.innerHTML = galleryItems.map(item => `
            <div class="galeri-grid-item">
                <img src="${item.image}" alt="image galeri" loading="lazy">
                ${item.guestName ? `<span class="grid-guest-badge"><i class='bx bxs-camera'></i> ${escapeHtml(item.guestName)}</span>` : ''}
            </div>
        `).join('');
        showAllContainer.classList.add('active');
    });

    closeButton.addEventListener('click', () => {
        showAllBox.innerHTML = '';
        showAllContainer.classList.remove('active');
    });

    const loadRemotePhotos = async () => {
        const remotePhotos = await galleryService.getPhotos();
        if (remotePhotos && remotePhotos.length > 0) {
            galleryItems = [...remotePhotos, ...data.galeri];
            currentIndex = 0;
            renderCarousel();
        }
    };

    const stopCameraStream = () => {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        videoStreamEl.srcObject = null;
    };

    const openNativeDeviceCamera = () => {
        stopCameraStream();
        if (nativeCameraInput) {
            nativeCameraInput.value = '';
            nativeCameraInput.click();
        }
    };

    const startWebRtcCamera = async () => {
        stopCameraStream();
        capturedImageDataUrl = null;
        previewImgEl.style.display = 'none';
        videoStreamEl.style.display = 'block';
        captureControls.style.display = 'flex';
        previewControls.style.display = 'none';
        loadingOverlay.style.display = 'none';

        cameraModal.classList.add('active');
        cameraModal.setAttribute('aria-hidden', 'false');

        videoStreamEl.style.transform = facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Browser tidak mendukung getUserMedia');
            }
            const constraints = {
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoStreamEl.srcObject = currentStream;
        } catch (err) {
            console.warn('Akses WebRTC kamera gagal/ditolak, beralih ke kamera native device:', err);
            cameraModal.classList.remove('active');
            cameraModal.setAttribute('aria-hidden', 'true');
            openNativeDeviceCamera();
        }
    };

    // Klik tombol "Foto Yuk":
    // - Di HP/Tablet (Android & iOS): langsung membuka aplikasi kamera bawaan device
    // - Di Desktop/Laptop: langsung membuka stream webcam device (atau fallback ke file picker)
    openCameraBtn.addEventListener('click', () => {
        if (isMobileDevice()) {
            openNativeDeviceCamera();
        } else {
            startWebRtcCamera();
        }
    });

    if (triggerNativeCamBtn) {
        triggerNativeCamBtn.addEventListener('click', () => {
            cameraModal.classList.remove('active');
            cameraModal.setAttribute('aria-hidden', 'true');
            openNativeDeviceCamera();
        });
    }

    closeCameraBtn.addEventListener('click', () => {
        stopCameraStream();
        cameraModal.classList.remove('active');
        cameraModal.setAttribute('aria-hidden', 'true');
    });

    switchCameraBtn.addEventListener('click', () => {
        facingMode = facingMode === 'environment' ? 'user' : 'environment';
        startWebRtcCamera();
    });

    capturePhotoBtn.addEventListener('click', () => {
        if (!currentStream) return;

        const { width, height } = fitDimensions(
            videoStreamEl.videoWidth,
            videoStreamEl.videoHeight,
            MAX_IMAGE_DIMENSION
        );

        canvasEl.width = width;
        canvasEl.height = height;

        const ctx = canvasEl.getContext('2d');
        if (facingMode === 'user') {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(videoStreamEl, 0, 0, width, height);

        const dataUrl = canvasEl.toDataURL('image/jpeg', JPEG_QUALITY);
        stopCameraStream();
        showPreviewState(dataUrl, 'webrtc');
    });

    nativeCameraInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const { width, height } = fitDimensions(img.width, img.height, MAX_IMAGE_DIMENSION);
                canvasEl.width = width;
                canvasEl.height = height;

                const ctx = canvasEl.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvasEl.toDataURL('image/jpeg', JPEG_QUALITY);
                stopCameraStream();
                showPreviewState(dataUrl, 'native');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    retakePhotoBtn.addEventListener('click', () => {
        nativeCameraInput.value = '';
        if (lastCaptureMode === 'native' || isMobileDevice()) {
            cameraModal.classList.remove('active');
            cameraModal.setAttribute('aria-hidden', 'true');
            openNativeDeviceCamera();
        } else {
            startWebRtcCamera();
        }
    });

    uploadPhotoBtn.addEventListener('click', async () => {
        if (!capturedImageDataUrl) return;

        const guestName = guestNameInput.value.trim() || 'Fansku';
        loadingOverlay.style.display = 'flex';
        statusTextEl.textContent = 'Loading... Sabar, fans';
        uploadPhotoBtn.disabled = true;
        retakePhotoBtn.disabled = true;

        const response = await galleryService.uploadPhoto({
            guestName: guestName,
            imageBase64: capturedImageDataUrl
        });

        uploadPhotoBtn.disabled = false;
        retakePhotoBtn.disabled = false;
        loadingOverlay.style.display = 'none';

        if (response && response.status === 'success' && response.photo) {
            galleryItems.unshift(response.photo);
            currentIndex = 0;
            renderCarousel();
            resetAutoPlay();
            cameraModal.classList.remove('active');
            cameraModal.setAttribute('aria-hidden', 'true');
        } else {
            const errMsg = (response && response.message)
                ? response.message
                : 'Gagal mengupload foto. Periksa deployment Apps Script & izin Drive.';
            alert(errMsg);
        }
    });

    renderCarousel();
    resetAutoPlay();
    loadRemotePhotos();
};
