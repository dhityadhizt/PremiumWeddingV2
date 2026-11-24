import {home} from "./js/home.js";
import {bride} from "./js/bride.js";
import {time} from "./js/time.js";
import {galeri} from "./js/galeri.js";
import {wishas} from "./js/wishas.js";
import {navbar} from "./js/navbar.js";
import {welcome} from "./js/welcome.js";
import {splashBg} from "./js/splashBg.js";

// load content
document.addEventListener('DOMContentLoaded', () => {
    AOS.init();

    splashBg();
    welcome();
    navbar();
    home();
    bride();
    time();
    galeri();
    wishas();
});
