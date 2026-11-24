import {data} from "../assets/data/data.js";
import {addClassElement, getQueryParameter, removeClassElement} from "../utils/helper.js";

export const welcome = () => {
    const welcomeElement = document.querySelector('.welcome');
    const homeElement = document.querySelector('.home');
    const navbarElement = document.querySelector('header nav');

    // Mengambil elemen yang sudah ada di index.html
    const welcomeContainer = document.querySelector('.welcome-content');
    const ornamentCenter = welcomeContainer ? welcomeContainer.querySelector('.welcome-ornament.center') : null;
    const welcomeInfo = welcomeContainer ? welcomeContainer.querySelector('.welcome-info') : null;

    const figureElement = welcomeInfo ? welcomeInfo.querySelector('figure') : null;
    const coupleNameElement = welcomeInfo ? welcomeInfo.querySelector('.welcome-couple-name') : null;
    const weddingToElement = welcomeInfo ? welcomeInfo.querySelector('p') : null;

    const audioElements = document.querySelector('.audio');
    const audioMusic = audioElements ? audioElements.querySelector('audio') || audioElements.children[0] : null;
    const audioButton = audioElements ? audioElements.querySelector('button') || audioElements.children[1] : null;
    const iconButton = audioButton ? audioButton.querySelector('i') || audioButton.children[0] : null;

    const generateFigureContent = (bride) => {
        const {couple: coupleImage} = bride;
        return `
            <div class="arch-image-wrap">
                <img src="${coupleImage}" alt="couple animation">
            </div>`;
    };

    const generateCoupleName = (bride) => {
        const {L: {name: brideLName}, P: {name: bridePName}} = bride;
        return `${brideLName.split(' ')[0]} &amp; ${bridePName.split(' ')[0]}`;
    };

    const generateParameterContent = () => {
        const name = document.querySelector('#name');
        const params = getQueryParameter('to');

        if (weddingToElement) {
            if (params) {
                weddingToElement.innerHTML = `Kepada Yth Bapak/Ibu/Saudara/i<span>${params}</span>`;
                if (name) name.value = params;
            } else {
                weddingToElement.innerHTML = `Kepada Yth Bapak/Ibu/Saudara/i<span>You are invited</span>`;
            }
        }
    };

    const initialAudio = () => {
        if (!audioMusic || !audioButton || !iconButton) return;
        let isPlaying = false;
        audioMusic.innerHTML = `<source src="${data.audio}" type="audio/mp3"/>`;

        audioButton.addEventListener('click', () => {
            if (isPlaying) {
                addClassElement(audioButton, 'active');
                removeClassElement(iconButton, 'bx-play-circle');
                addClassElement(iconButton, 'bx-pause-circle');
                audioMusic.play().catch(() => {});
            } else {
                removeClassElement(audioButton, 'active');
                removeClassElement(iconButton, 'bx-pause-circle');
                addClassElement(iconButton, 'bx-play-circle');
                audioMusic.pause();
            }
            isPlaying = !isPlaying;
        });
    };

    const openWeddingButton = welcomeInfo ? welcomeInfo.querySelector('button') : null;
    if (openWeddingButton) {
        openWeddingButton.addEventListener('click', () => {
            addClassElement(document.body, 'active');
            addClassElement(welcomeElement, 'hide');

            setTimeout(() => {
                addClassElement(homeElement, 'active');
                addClassElement(navbarElement, 'active');
                if (audioButton) addClassElement(audioButton, 'show');
                if (iconButton) {
                    removeClassElement(iconButton, 'bx-play-circle');
                    addClassElement(iconButton, 'bx-pause-circle');
                }
                if (audioMusic) audioMusic.play().catch(() => {});
            }, 1500);

            setTimeout(() => {
                if (audioButton) addClassElement(audioButton, 'active');
            }, 3000);
        });
    }

    const initializeWelcome = () => {
        if (ornamentCenter && !ornamentCenter.getAttribute('src')) {
            ornamentCenter.src = "./src/assets/images/Center.png";
            ornamentCenter.alt = "Ornament Center";
        }

        if (figureElement) {
            figureElement.innerHTML = generateFigureContent(data.bride);
        }

        if (coupleNameElement) {
            coupleNameElement.innerHTML = generateCoupleName(data.bride);
        }

        generateParameterContent();

        // Memicu kelas active agar animasi CSS berjalan sesuai urutan
        addClassElement(welcomeElement, 'active');
    };

    initializeWelcome();
    initialAudio();
};
