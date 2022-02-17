import API from './api';
import CONSTANTS from './constants';
import { i18n } from './lib/lib';

export const game = getGame();
export const canvas = getCanvas();

// export const CONSTANTS.MODULE_NAME = 'variant-encumbrance-dnd5e';
// export const VARIANT_ENCUMBRANCE_FLAG = 'variant-encumbrance-dnd5e';
// export const VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME = 'inventory-plus';
// export const VARIANT_ENCUMBRANCE_MIDI_QOL_MODULE_NAME = 'midi-qol';
// export const VARIANT_ENCUMBRANCE_ITEM_COLLECTION_MODULE_NAME = 'itemcollection';
// export const VARIANT_ENCUMBRANCE_DFREDS_CONVENIENT_EFFECTS_MODULE_NAME = 'dfreds-convenient-effects';
// export const VARIANT_ENCUMBRANCE_DF_QUALITY_OF_LIFE_MODULE_NAME = 'df-qol';
// export const VARIANT_ENCUMBRANCE_DAE_MODULE_NAME = 'dae';

/**
 * Because typescript doesn't know when in the lifecycle of foundry your code runs, we have to assume that the
 * canvas is potentially not yet initialized, so it's typed as declare let canvas: Canvas | {ready: false}.
 * That's why you get errors when you try to access properties on canvas other than ready.
 * In order to get around that, you need to type guard canvas.
 * Also be aware that this will become even more important in 0.8.x because no canvas mode is being introduced there.
 * So you will need to deal with the fact that there might not be an initialized canvas at any point in time.
 * @returns
 */
function getCanvas(): Canvas {
  if (!(canvas instanceof Canvas) || !canvas.ready) {
    throw new Error('Canvas Is Not Initialized');
  }
  return canvas;
}

/**
 * Because typescript doesn't know when in the lifecycle of foundry your code runs, we have to assume that the
 * canvas is potentially not yet initialized, so it's typed as declare let canvas: Canvas | {ready: false}.
 * That's why you get errors when you try to access properties on canvas other than ready.
 * In order to get around that, you need to type guard canvas.
 * Also be aware that this will become even more important in 0.8.x because no canvas mode is being introduced there.
 * So you will need to deal with the fact that there might not be an initialized canvas at any point in time.
 * @returns
 */
function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error('Game Is Not Initialized');
  }
  return game;
}

export function getAPI(): API {
  return game[CONSTANTS.MODULE_NAME].API;
}

export const registerSettings = function () {
  game.settings.registerMenu(CONSTANTS.MODULE_NAME, 'resetAllSettings', {
    name: `${CONSTANTS.MODULE_NAME}.setting.reset.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.reset.hint`,
    icon: 'fas fa-coins',
    type: ResetSettingsDialog,
    restricted: true,
  });

  // const settings = defaultSettings();
  // for (const [name, data] of Object.entries(settings)) {
  //   game.settings.register(CONSTANTS.MODULE_NAME, name, <any>data);
  // }

  // for (const [name, data] of Object.entries(otherSettings)) {
  //     game.settings.register(CONSTANTS.MODULE_NAME, name, data);
  // }

  // Removed on 0.6.5
  // game.settings.register(CONSTANTS.MODULE_NAME, 'enabled', {
  //   name: i18n(CONSTANTS.MODULE_NAME + '.setting.enabled.name'),
  //   hint: i18n(CONSTANTS.MODULE_NAME + '.setting.enabled.hint'),
  //   scope: 'world',
  //   config: false,
  //   type: Boolean,
  //   default: true,
  // });
  game.settings.register(CONSTANTS.MODULE_NAME, 'useVarianEncumbranceWithSpecificType', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.useVarianEncumbranceWithSpecificType.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useVarianEncumbranceWithSpecificType.hint'),
    scope: 'world',
    config: true,
    type: String,
    default: 'character,vehicle',
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'lightMultiplier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.lightMultiplier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.lightMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 5,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'lightMultiplierMetric', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.lightMultiplierMetric.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.lightMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 2.3,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'mediumMultiplier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.mediumMultiplier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.mediumMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 10,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'mediumMultiplierMetric', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.mediumMultiplierMetric.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.mediumMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 4.5,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'heavyMultiplier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyMultiplier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 15,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.strMultiplier = value;
    },
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'heavyMultiplierMetric', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyMultiplierMetric.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 6.8,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.strMultiplier = value;
    },
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'useStrengthMultiplier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.useStrengthMultiplier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useStrengthMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'strengthMultiplier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.strengthMultiplier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.strengthMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 15,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.strMultiplier = value;
    },
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'strengthMultiplierMetric', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.strengthMultiplierMetric.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.strengthMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 6.8,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.strMultiplier = value;
    },
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'useVariantEncumbrance', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.useVariantEncumbrance.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useVariantEncumbrance.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'unequippedMultiplier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.unequippedMultiplier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.unequippedMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 1,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'equippedMultiplier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.equippedMultiplier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.equippedMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 1,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'profEquippedMultiplier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.profEquippedMultiplier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.profEquippedMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 1,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'currencyWeight', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.currencyWeight.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.currencyWeight.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 50,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.currencyPerWeight = value;
    },
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'currencyWeightMetric', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.currencyWeightMetric.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.currencyWeightMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 110,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.currencyPerWeight = value;
    },
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'vehicleWeightMultiplier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.vehicleWeightMultiplier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.vehicleWeightMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 2000,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.currencyPerWeight = value;
    },
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'vehicleWeightMultiplierMetric', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.vehicleWeightMultiplierMetric.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.vehicleWeightMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 1000,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.currencyPerWeight = value;
    },
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'sizeMultipliers', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.sizeMultipliers.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.sizeMultipliers.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'units', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.units.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.units.hint'),
    scope: 'world',
    config: true,
    type: String,
    default: 'lbs.',
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'unitsMetric', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.unitsMetric.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.unitsMetric.hint'),
    scope: 'world',
    config: true,
    type: String,
    default: 'kg.',
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'lightWeightDecrease', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.lightWeightDecrease.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.lightWeightDecrease.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 10,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'heavyWeightDecrease', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyWeightDecrease.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyWeightDecrease.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 20,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'enablePreCheckEncumbranceTier', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.enablePreCheckEncumbranceTier.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.enablePreCheckEncumbranceTier.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'enableVarianEncumbranceOnSpecificActor', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.enableVarianEncumbranceOnSpecificActor.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.enableVarianEncumbranceOnSpecificActor.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'removeLabelButtonsSheetHeader', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.removeLabelButtonsSheetHeader.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.removeLabelButtonsSheetHeader.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'useStandardWeightCalculation', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.useStandardWeightCalculation.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useStandardWeightCalculation.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'useEquippedUnequippedItemCollectionFeature', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.useEquippedUnequippedItemCollectionFeature.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useEquippedUnequippedItemCollectionFeature.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'doNotUseSocketLibFeature', {
    name: i18n(CONSTANTS.MODULE_NAME + '.setting.doNotUseSocketLibFeature.name'),
    hint: i18n(CONSTANTS.MODULE_NAME + '.setting.doNotUseSocketLibFeature.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });
};

class ResetSettingsDialog extends FormApplication {
  constructor(...args: any[]) {
    super(args);
    //@ts-ignore
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.title`),
      content:
        '<p style="margin-bottom:1rem;">' +
        game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.content`) +
        '</p>',
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.confirm`),
          callback: async () => {
            await applyDefaultSettings();
            window.location.reload();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.cancel`),
        },
      },
      default: 'cancel',
    });
  }

  async _updateObject(event: Event, formData?: object): Promise<any> {
    // do nothing
  }
}

async function applyDefaultSettings() {
  const settings = defaultSettings(true);
  for (const [name, data] of Object.entries(settings)) {
    await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
  }
}

function defaultSettings(apply = false) {
  return {
    useVarianEncumbranceWithSpecificType: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.useVarianEncumbranceWithSpecificType.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useVarianEncumbranceWithSpecificType.hint'),
      scope: 'world',
      config: true,
      type: String,
      default: 'character,vehicle',
    },

    lightMultiplier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.lightMultiplier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.lightMultiplier.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 5,
    },

    lightMultiplierMetric: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.lightMultiplierMetric.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.lightMultiplierMetric.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 2.3,
    },

    mediumMultiplier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.mediumMultiplier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.mediumMultiplier.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 10,
    },

    mediumMultiplierMetric: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.mediumMultiplierMetric.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.mediumMultiplierMetric.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 4.5,
    },

    heavyMultiplier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyMultiplier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyMultiplier.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 15,
      onChange: (value) => {
        // NOT NECESSARY WE USE THE VALUE ON THE SETTING
        // DND5E.encumbrance.strMultiplier = value;
      },
    },

    heavyMultiplierMetric: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyMultiplierMetric.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyMultiplierMetric.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 6.8,
      onChange: (value) => {
        // NOT NECESSARY WE USE THE VALUE ON THE SETTING
        // DND5E.encumbrance.strMultiplier = value;
      },
    },

    useStrengthMultiplier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.useStrengthMultiplier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useStrengthMultiplier.hint'),
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    },

    strengthMultiplier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.strengthMultiplier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.strengthMultiplier.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 15,
      onChange: (value) => {
        // NOT NECESSARY WE USE THE VALUE ON THE SETTING
        // DND5E.encumbrance.strMultiplier = value;
      },
    },

    strengthMultiplierMetric: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.strengthMultiplierMetric.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.strengthMultiplierMetric.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 6.8,
      onChange: (value) => {
        // NOT NECESSARY WE USE THE VALUE ON THE SETTING
        // DND5E.encumbrance.strMultiplier = value;
      },
    },

    useVariantEncumbrance: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.useVariantEncumbrance.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useVariantEncumbrance.hint'),
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
    },

    unequippedMultiplier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.unequippedMultiplier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.unequippedMultiplier.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 1,
    },

    equippedMultiplier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.equippedMultiplier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.equippedMultiplier.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 1,
    },

    profEquippedMultiplier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.profEquippedMultiplier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.profEquippedMultiplier.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 1,
    },

    currencyWeight: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.currencyWeight.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.currencyWeight.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 50,
      onChange: (value) => {
        // NOT NECESSARY WE USE THE VALUE ON THE SETTING
        // DND5E.encumbrance.currencyPerWeight = value;
      },
    },

    currencyWeightMetric: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.currencyWeightMetric.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.currencyWeightMetric.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 110,
      onChange: (value) => {
        // NOT NECESSARY WE USE THE VALUE ON THE SETTING
        // DND5E.encumbrance.currencyPerWeight = value;
      },
    },

    vehicleWeightMultiplier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.vehicleWeightMultiplier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.vehicleWeightMultiplier.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 2000,
      onChange: (value) => {
        // NOT NECESSARY WE USE THE VALUE ON THE SETTING
        // DND5E.encumbrance.currencyPerWeight = value;
      },
    },

    vehicleWeightMultiplierMetric: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.vehicleWeightMultiplierMetric.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.vehicleWeightMultiplierMetric.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 1000,
      onChange: (value) => {
        // NOT NECESSARY WE USE THE VALUE ON THE SETTING
        // DND5E.encumbrance.currencyPerWeight = value;
      },
    },

    sizeMultipliers: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.sizeMultipliers.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.sizeMultipliers.hint'),
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
    },

    units: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.units.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.units.hint'),
      scope: 'world',
      config: true,
      type: String,
      default: 'lbs.',
    },

    unitsMetric: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.unitsMetric.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.unitsMetric.hint'),
      scope: 'world',
      config: true,
      type: String,
      default: 'kg.',
    },

    lightWeightDecrease: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.lightWeightDecrease.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.lightWeightDecrease.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 10,
    },

    heavyWeightDecrease: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyWeightDecrease.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.heavyWeightDecrease.hint'),
      scope: 'world',
      config: true,
      type: Number,
      default: 20,
    },

    enablePreCheckEncumbranceTier: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.enablePreCheckEncumbranceTier.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.enablePreCheckEncumbranceTier.hint'),
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    },

    enableVarianEncumbranceOnSpecificActor: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.enableVarianEncumbranceOnSpecificActor.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.enableVarianEncumbranceOnSpecificActor.hint'),
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
    },

    removeLabelButtonsSheetHeader: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.removeLabelButtonsSheetHeader.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.removeLabelButtonsSheetHeader.hint'),
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
    },

    useStandardWeightCalculation: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.useStandardWeightCalculation.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useStandardWeightCalculation.hint'),
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    },

    useEquippedUnequippedItemCollectionFeature: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.useEquippedUnequippedItemCollectionFeature.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.useEquippedUnequippedItemCollectionFeature.hint'),
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    },

    doNotUseSocketLibFeature: {
      name: i18n(CONSTANTS.MODULE_NAME + '.setting.doNotUseSocketLibFeature.name'),
      hint: i18n(CONSTANTS.MODULE_NAME + '.setting.doNotUseSocketLibFeature.hint'),
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    },
  };
}
