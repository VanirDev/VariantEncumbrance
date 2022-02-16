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
import { registerSettings } from './module/settings';
import { preloadTemplates } from './module/preloadTemplates';
import { initHooks, readyHooks, setupHooks } from './module/modules';
import EffectInterface from './module/effects/effect-interface';
import { canvas, game } from './module/settings';
import CONSTANTS from './module/constants';

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async () => {
  console.log(`${CONSTANTS.MODULE_NAME} | Initializing ${CONSTANTS.MODULE_NAME}`);

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
      `The '${CONSTANTS.MODULE_NAME}' module requires to install and activate the 'libWrapper' module.`,
    );
    return;
  }
  if (!game.modules.get('socketlib')?.active && game.user?.isGM) {
    ui.notifications?.error(
      `The '${CONSTANTS.MODULE_NAME}' module requires to install and activate the 'socketlib' module.`,
    );
    return;
  }

  readyHooks();
});

// Add any additional hooks if necessary

Hooks.once('socketlib.ready', () => {
  game[CONSTANTS.MODULE_NAME] = game[CONSTANTS.MODULE_NAME] || {};

  // game[CONSTANTS.MODULE_NAME].effects = new EffectDefinitions();
  game[CONSTANTS.MODULE_NAME].effectInterface = new EffectInterface(CONSTANTS.MODULE_NAME);
  // game[CONSTANTS.MODULE_NAME].statusEffects = new StatusEffects();
  game[CONSTANTS.MODULE_NAME].effectInterface.initialize();
});

Hooks.once('libChangelogsReady', function () {
  //@ts-ignore
  libChangelogs.register(CONSTANTS.MODULE_NAME, `- Little update`, 'minor');
  //@ts-ignore
  libChangelogs.registerConflict(
    CONSTANTS.MODULE_NAME,
    CONSTANTS.DF_QUALITY_OF_LIFE_MODULE_NAME,
    `- update typescript and effect hanlder`,
    'minor',
  );
  //@ts-ignore
  // libChangelogs.registerConflict(
  //   CONSTANTS.MODULE_NAME,
  //   VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME,
  //   'no particular errors, but it is still not recommended to use this module with version of inventory +',
  //   'minor',
  // );
});
