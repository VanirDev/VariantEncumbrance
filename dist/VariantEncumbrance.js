/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import JavaScript modules
// Import TypeScript modules
import { getGame, registerSettings } from "./module/settings.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import { VARIANT_ENCUMBRANCE_MODULE_NAME } from "./module/settings.js";
import { initHooks, readyHooks, setupHooks } from "./module/Hooks.js";
// import { installedModules, setupModules } from './module/setupModules';
export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3
export let debug = (...args) => { if (debugEnabled > 1)
    console.log(`DEBUG:${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, ...args); };
export let log = (...args) => console.log(`${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, ...args);
export let warn = (...args) => { if (debugEnabled > 0)
    console.warn(`${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, ...args); };
export let error = (...args) => console.error(`${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, ...args);
export let timelog = (...args) => warn(`${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, Date.now(), ...args);
export let i18n = key => {
    return getGame().i18n.localize(key);
};
export let i18nFormat = (key, data = {}) => {
    return getGame().i18n.format(key, data);
};
export let setDebugLevel = (debugText) => {
    debugEnabled = { "none": 0, "warn": 1, "debug": 2, "all": 3 }[debugText] || 0;
    // 0 = none, warnings = 1, debug = 2, all = 3
    if (debugEnabled >= 3)
        CONFIG.debug.hooks = true;
};
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async () => {
    console.log(`${VARIANT_ENCUMBRANCE_MODULE_NAME} | Initializing ${VARIANT_ENCUMBRANCE_MODULE_NAME}`);
    // Register custom module settings
    registerSettings();
    initHooks();
    // Assign custom classes and constants here
    // Register custom module settings
    //registerSettings();
    //fetchParams();
    // Preload Handlebars templates
    await preloadTemplates();
    // Register custom sheets (if any)
});
/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
    // Do anything after initialization but before ready
    //setupModules();
    setupHooks();
    registerSettings();
});
/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', () => {
    // Do anything once the module is ready
    // if (!getGame().modules.get("lib-wrapper")?.active && getGame().user.isGM){
    // 	ui.notifications.error(`The '${VARIANT_ENCUMBRANCE_MODULE_NAME}' module requires to install and activate the 'libWrapper' module.`);
    // 	return;
    // }
    readyHooks();
});
// Add any additional hooks if necessary
