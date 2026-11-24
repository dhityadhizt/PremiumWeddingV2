import {home} from "./js/home.js";[cite: 6]
import {bride} from "./js/bride.js";[cite: 6]
import {time} from "./js/time.js";[cite: 6]
import {galeri} from "./js/galeri.js";[cite: 6]
import {wishas} from "./js/wishas.js";[cite: 6]
import {navbar} from "./js/navbar.js";[cite: 6]
import {welcome} from "./js/welcome.js";[cite: 6]
import {splashBg} from "./js/splashBg.js";

// load content
document.addEventListener('DOMContentLoaded', () => {[cite: 6]
    AOS.init();[cite: 6]

    splashBg();
    welcome();[cite: 6]
    navbar();[cite: 6]
    home();[cite: 6]
    bride();
    time();[cite: 6]
    galeri();[cite: 6]
    wishas();[cite: 6]
});[cite: 6]
