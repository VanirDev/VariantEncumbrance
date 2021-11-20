//@ts-ignore
// import { DND5E } from '../../../systems/dnd5e/module/config.js';

export const VARIANT_ENCUMBRANCE_MODULE_NAME = 'variant-encumbrance-dnd5e';
export const VARIANT_ENCUMBRANCE_FLAG = 'variant-encumbrance-dnd5e';
export const VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME = 'inventory-plus';
export const VARIANT_ENCUMBRANCE_MIDI_QOL_MODULE_NAME = 'midi-qol';
export const VARIANT_ENCUMBRANCE_ITEM_COLLECTION_MODULE_NAME = 'itemcollection';
export const VARIANT_ENCUMBRANCE_DFREDS_CONVENIENT_EFFECTS_MODULE_NAME = 'dfreds-convenient-effects';
export const VARIANT_ENCUMBRANCE_DF_QUALITY_OF_LIFE_MODULE_NAME = 'df-qol';

/**
 * Because typescript doesn't know when in the lifecycle of foundry your code runs, we have to assume that the
 * canvas is potentially not yet initialized, so it's typed as declare let canvas: Canvas | {ready: false}.
 * That's why you get errors when you try to access properties on canvas other than ready.
 * In order to get around that, you need to type guard canvas.
 * Also be aware that this will become even more important in 0.8.x because no canvas mode is being introduced there.
 * So you will need to deal with the fact that there might not be an initialized canvas at any point in time.
 * @returns
 */
export function getCanvas(): Canvas {
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
export function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error('Game Is Not Initialized');
  }
  return game;
}

export const registerSettings = function () {
  // Removed on 0.6.5
  // getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'enabled', {
  //   name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.enabled.name'),
  //   hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.enabled.hint'),
  //   scope: 'world',
  //   config: false,
  //   type: Boolean,
  //   default: true,
  // });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightMultiplier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.lightMultiplier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.lightMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 5,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightMultiplierMetric', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.lightMultiplierMetric.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.lightMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 2.3,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'mediumMultiplier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.mediumMultiplier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.mediumMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 10,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'mediumMultiplierMetric', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.mediumMultiplierMetric.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.mediumMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 4.5,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.heavyMultiplier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.heavyMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 15,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.strMultiplier = value;
    },
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplierMetric', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.heavyMultiplierMetric.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.heavyMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 6.8,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.strMultiplier = value;
    },
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useStrengthMultiplier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.useStrengthMultiplier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.useStrengthMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'strengthMultiplier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.strengthMultiplier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.strengthMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 15,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.strMultiplier = value;
    },
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'strengthMultiplierMetric', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.strengthMultiplierMetric.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.strengthMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 6.8,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.strMultiplier = value;
    },
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useVariantEncumbrance', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.useVariantEncumbrance.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.useVariantEncumbrance.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'unequippedMultiplier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.unequippedMultiplier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.unequippedMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 1,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'equippedMultiplier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.equippedMultiplier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.equippedMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 1,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'profEquippedMultiplier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.profEquippedMultiplier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.profEquippedMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 1,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.currencyWeight.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.currencyWeight.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 50,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.currencyPerWeight = value;
    },
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeightMetric', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.currencyWeightMetric.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.currencyWeightMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 110,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.currencyPerWeight = value;
    },
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'vehicleWeightMultiplier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.vehicleWeightMultiplier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.vehicleWeightMultiplier.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 2000,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.currencyPerWeight = value;
    },
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'vehicleWeightMultiplierMetric', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.vehicleWeightMultiplierMetric.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.vehicleWeightMultiplierMetric.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 1000,
    onChange: (value) => {
      // NOT NECESSARY WE USE THE VALUE ON THE SETTING
      // DND5E.encumbrance.currencyPerWeight = value;
    },
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'sizeMultipliers', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.sizeMultipliers.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.sizeMultipliers.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'units', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.units.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.units.hint'),
    scope: 'world',
    config: true,
    type: String,
    default: 'lbs.',
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'unitsMetric', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.unitsMetric.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.unitsMetric.hint'),
    scope: 'world',
    config: true,
    type: String,
    default: 'kg.',
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightWeightDecrease', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.lightWeightDecrease.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.lightWeightDecrease.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 10,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyWeightDecrease', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.heavyWeightDecrease.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.heavyWeightDecrease.hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: 20,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'enablePreCheckEncumbranceTier', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.enablePreCheckEncumbranceTier.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.enablePreCheckEncumbranceTier.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'enableVarianEncumbranceOnSpecificActor', {
    name: getGame().i18n.localize(
      VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.enableVarianEncumbranceOnSpecificActor.name',
    ),
    hint: getGame().i18n.localize(
      VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.enableVarianEncumbranceOnSpecificActor.hint',
    ),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'removeLabelButtonsSheetHeader', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.removeLabelButtonsSheetHeader.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.removeLabelButtonsSheetHeader.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useStandardWeightCalculation', {
    name: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.useStandardWeightCalculation.name'),
    hint: getGame().i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.useStandardWeightCalculation.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  getGame().settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useEquippedUnequippedItemCollectionFeature', {
    name: getGame().i18n.localize(
      VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.useEquippedUnequippedItemCollectionFeature.name',
    ),
    hint: getGame().i18n.localize(
      VARIANT_ENCUMBRANCE_MODULE_NAME + '.setting.useEquippedUnequippedItemCollectionFeature.hint',
    ),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });
};
