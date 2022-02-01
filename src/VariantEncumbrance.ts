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
import {
  registerSettings,
  VARIANT_ENCUMBRANCE_DF_QUALITY_OF_LIFE_MODULE_NAME,
  VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME,
} from './module/settings';
import { preloadTemplates } from './module/preloadTemplates';
import { VARIANT_ENCUMBRANCE_MODULE_NAME } from './module/settings';
import { initHooks, readyHooks, setupHooks } from './module/Hooks';
import EffectInterface from './module/effects/effect-interface';
import { canvas, game } from './module/settings';

export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3
export const debug = (...args) => {
  if (debugEnabled > 1) console.log(`DEBUG:${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, ...args);
};
export const log = (...args) => console.log(`${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, ...args);
export const warn = (...args) => {
  if (debugEnabled > 0) console.warn(`${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, ...args);
};
export const error = (...args) => console.error(`${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, ...args);
export const timelog = (...args) => warn(`${VARIANT_ENCUMBRANCE_MODULE_NAME} | `, Date.now(), ...args);

export const i18n = (key) => {
  return game.i18n.localize(key);
};
export const i18nFormat = (key, data = {}) => {
  return game.i18n.format(key, data);
};

export const setDebugLevel = (debugText: string) => {
  debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
  // 0 = none, warnings = 1, debug = 2, all = 3
  if (debugEnabled >= 3) CONFIG.debug.hooks = true;
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
  if (!game.modules.get('lib-wrapper')?.active && game.user?.isGM) {
    ui.notifications?.error(
      `The '${VARIANT_ENCUMBRANCE_MODULE_NAME}' module requires to install and activate the 'libWrapper' module.`,
    );
    return;
  }
  if (!game.modules.get('socketlib')?.active && game.user?.isGM) {
    ui.notifications?.error(
      `The '${VARIANT_ENCUMBRANCE_MODULE_NAME}' module requires to install and activate the 'socketlib' module.`,
    );
    return;
  }

  readyHooks();
});

// Add any additional hooks if necessary

Hooks.once('socketlib.ready', () => {
  game[VARIANT_ENCUMBRANCE_MODULE_NAME] = game[VARIANT_ENCUMBRANCE_MODULE_NAME] || {};

  // game[VARIANT_ENCUMBRANCE_MODULE_NAME].effects = new EffectDefinitions();
  game[VARIANT_ENCUMBRANCE_MODULE_NAME].effectInterface = new EffectInterface(
    VARIANT_ENCUMBRANCE_MODULE_NAME,
    undefined,
  );
  // game[VARIANT_ENCUMBRANCE_MODULE_NAME].statusEffects = new StatusEffects();
  game[VARIANT_ENCUMBRANCE_MODULE_NAME].effectInterface.initialize();
});

Hooks.once('libChangelogsReady', function () {
  //@ts-ignore
  libChangelogs.register(VARIANT_ENCUMBRANCE_MODULE_NAME, `- Little update`, 'minor');
  //@ts-ignore
  libChangelogs.registerConflict(
    VARIANT_ENCUMBRANCE_MODULE_NAME,
    VARIANT_ENCUMBRANCE_DF_QUALITY_OF_LIFE_MODULE_NAME,
    '- bug fix',
    'minor',
  );
  //@ts-ignore
  // libChangelogs.registerConflict(
  //   VARIANT_ENCUMBRANCE_MODULE_NAME,
  //   VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME,
  //   'no particular errors, but it is still not recommended to use this module with version of inventory +',
  //   'minor',
  // );
});
