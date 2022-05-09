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
import { error } from './module/lib/lib';
import API from './module/api';

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
  setupHooks();
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', () => {
  // Do anything once the module is ready
  if (!game.modules.get('lib-wrapper')?.active && game.user?.isGM) {
    let word = 'install and activate';
    if (game.modules.get('lib-wrapper')) word = 'activate';
    throw error(`Requires the 'libWrapper' module. Please ${word} it.`);
  }
  if (!game.modules.get('socketlib')?.active && game.user?.isGM) {
    let word = 'install and activate';
    if (game.modules.get('socketlib')) word = 'activate';
    throw error(`Requires the 'socketlib' module. Please ${word} it.`);
  }

  readyHooks();
});

// Add any additional hooks if necessary

export interface VariantEncumbranceModuleData {
  api: typeof API;
  socket: any;
}

/**
 * Initialization helper, to set API.
 * @param api to set to game module.
 */
export function setApi(api: typeof API): void {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as VariantEncumbranceModuleData;
  data.api = api;
}

/**
 * Returns the set API.
 * @returns Api from games module.
 */
export function getApi(): typeof API {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as VariantEncumbranceModuleData;
  return data.api;
}

/**
 * Initialization helper, to set Socket.
 * @param socket to set to game module.
 */
export function setSocket(socket: any): void {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as VariantEncumbranceModuleData;
  data.socket = socket;
}

/*
 * Returns the set socket.
 * @returns Socket from games module.
 */
export function getSocket() {
  const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as VariantEncumbranceModuleData;
  return data.socket;
}

Hooks.once('libChangelogsReady', function () {
  //@ts-ignore
  libChangelogs.registerConflict(
    CONSTANTS.MODULE_NAME,
    CONSTANTS.DF_QUALITY_OF_LIFE_MODULE_NAME,
    `
    - possible wrong calculation on vehicle sheet with the feature "Vehicle Cargo Capacity Unit", it should work, but i'm not tested all the use cases, open a issue if you encounter any problem
    `,
    'minor',
  );
  //@ts-ignore
  // libChangelogs.registerConflict(
  //   CONSTANTS.MODULE_NAME,
  //   VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME,
  //   'no particular errors, but it is still not recommended to use this module with version of inventory +',
  //   'minor',
  // );

  //@ts-ignore
  libChangelogs.register(
    CONSTANTS.MODULE_NAME,
    `
  - Integration of bulk system
  `,
    'minor',
  );
});
