import { warn, error, debug, i18n } from '../VariantEncumbrance';
import {
  getGame,
  VARIANT_ENCUMBRANCE_FLAG,
  VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME,
  VARIANT_ENCUMBRANCE_ITEM_COLLECTION_MODULE_NAME,
  VARIANT_ENCUMBRANCE_MIDI_QOL_MODULE_NAME,
  VARIANT_ENCUMBRANCE_MODULE_NAME,
} from './settings';
import { ENCUMBRANCE_TIERS, VariantEncumbranceImpl } from './VariantEncumbranceImpl';
import { EncumbranceData, EncumbranceMode, EncumbranceFlags, EncumbranceActorType } from './VariantEncumbranceModels';

export let ENCUMBRANCE_STATE = {
  UNENCUMBERED: '', // "Unencumbered",
  ENCUMBERED: '', // "Encumbered",
  HEAVILY_ENCUMBERED: '', // "Heavily Encumbered",
  OVERBURDENED: '', // "Overburdened"
};

export let invPlusActive;
export let itemContainerActive;

export let invMidiQol;

// export const effectInterface = new EffectInterface();

export const readyHooks = async () => {
  // effectInterface.initialize();

  ENCUMBRANCE_STATE = {
    UNENCUMBERED: i18n(VARIANT_ENCUMBRANCE_MODULE_NAME + '.effect.name.unencumbered'), // "Unencumbered",
    ENCUMBERED: i18n(VARIANT_ENCUMBRANCE_MODULE_NAME + '.effect.name.encumbered'), // "Encumbered",
    HEAVILY_ENCUMBERED: i18n(VARIANT_ENCUMBRANCE_MODULE_NAME + '.effect.name.heavily_encumbered'), // "Heavily Encumbered",
    OVERBURDENED: i18n(VARIANT_ENCUMBRANCE_MODULE_NAME + '.effect.name.overburdened'), // "Overburdened"
  };

  Hooks.on(
    'renderActorSheet',
    async function (actorSheet: ActorSheet, htmlElement: JQuery<HTMLElement>, actorObject: any) {
      if (actorObject.isCharacter) {
        const actorEntity = <Actor>getGame().actors?.get(actorObject.actor._id);
        const encumbranceData = VariantEncumbranceImpl.calculateEncumbrance(
          actorEntity,
          actorEntity.data.items.contents,
        );
        let encumbranceElements;
        if (htmlElement[0].tagName === 'FORM' && htmlElement[0].id === '') {
          encumbranceElements = htmlElement.find('.encumbrance')[0]?.children;
        } else {
          encumbranceElements = htmlElement.find('.encumbrance')[0]?.children;
        }

        if (
          !encumbranceElements &&
          ((getGame().modules.get('compact-beyond-5e-sheet')?.active &&
            actorSheet.template.includes('compact-beyond-5e-sheet')) ||
            (getGame().modules.get('dndbeyond-character-sheet')?.active &&
              actorSheet.template.includes('dndbeyond-character-sheet')))
        ) {
          const encumbranceElementsTmp: any = htmlElement.find('.encumberance')[0]?.children;

          encumbranceElementsTmp[0].textContent =
            'Weight Carried: ' +
            Math.round(encumbranceData.totalWeight * 100) / 100 +
            ' ' +
            getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'units');

          encumbranceElementsTmp[1].textContent =
            'Max: ' + encumbranceData.heavyMax + ' ' + getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'units');
          // TODO visual integration with compact-beyond-5e-sheet
          //const div = document.createElement('div');
          //div.classList.add('encumbrance');
          /*
          const div = htmlElement.find('.encumberance')[0];

          const span1 = document.createElement('span');
          span1.classList.add('encumbrance-bar');

          const span2 = document.createElement('span');
          span2.classList.add('encumbrance-label');

          const icon1 = document.createElement('icon');
          icon1.classList.add('encumbrance-breakpoint');
          icon1.classList.add('encumbrance-33');
          icon1.classList.add('arrow-up');

          const icon2 = document.createElement('icon');
          icon2.classList.add('encumbrance-breakpoint');
          icon2.classList.add('encumbrance-33');
          icon2.classList.add('arrow-down');

          const icon3 = document.createElement('icon');
          icon3.classList.add('encumbrance-breakpoint');
          icon3.classList.add('encumbrance-66');
          icon3.classList.add('arrow-up');

          const icon4 = document.createElement('icon');
          icon4.classList.add('encumbrance-breakpoint');
          icon4.classList.add('encumbrance-66');
          icon4.classList.add('arrow-down');

          div.appendChild(span1)
          div.appendChild(span2)
          div.appendChild(icon1)
          div.appendChild(icon2)
          div.appendChild(icon3)
          div.appendChild(icon4)

          encumbranceElements = htmlElement.find('.encumberance')[0]?.children;
          */
          /*
          <div class="encumbrance ">
                <span class="encumbrance-bar" style="width:36.166666666666664%"></span>
                <span class="encumbrance-label">108.5 / 300</span>
                <i class="encumbrance-breakpoint encumbrance-33 arrow-up"></i>
                <i class="encumbrance-breakpoint encumbrance-33 arrow-down"></i>
                <i class="encumbrance-breakpoint encumbrance-66 arrow-up"></i>
                <i class="encumbrance-breakpoint encumbrance-66 arrow-down"></i>
          </div>
          */
        }

        if (encumbranceElements) {
          encumbranceElements[2].style.left = (encumbranceData.lightMax / encumbranceData.heavyMax) * 100 + '%';
          encumbranceElements[3].style.left = (encumbranceData.lightMax / encumbranceData.heavyMax) * 100 + '%';
          encumbranceElements[4].style.left = (encumbranceData.mediumMax / encumbranceData.heavyMax) * 100 + '%';
          encumbranceElements[5].style.left = (encumbranceData.mediumMax / encumbranceData.heavyMax) * 100 + '%';
          encumbranceElements[0].style.cssText =
            'width: ' +
            Math.min(Math.max((encumbranceData.totalWeight / encumbranceData.heavyMax) * 100, 0), 99.8) +
            '%;';
          // encumbranceElements[1].textContent = Math.round(encumbranceData.totalWeight * 100) / 100 + " " + getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "units");
          encumbranceElements[1].textContent =
            Math.round(encumbranceData.totalWeight * 100) / 100 +
            '/' +
            encumbranceData.heavyMax +
            ' ' +
            getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'units');

          encumbranceElements[0].classList.remove('medium');
          encumbranceElements[0].classList.remove('heavy');

          if (encumbranceData.encumbranceTier === ENCUMBRANCE_TIERS.LIGHT) {
            encumbranceElements[0].classList.add('medium');
          }
          if (encumbranceData.encumbranceTier === ENCUMBRANCE_TIERS.HEAVY) {
            encumbranceElements[0].classList.add('heavy');
          }
          if (encumbranceData.encumbranceTier === ENCUMBRANCE_TIERS.MAX) {
            encumbranceElements[0].classList.add('max');
          }

          htmlElement.find('.encumbrance-breakpoint.encumbrance-33.arrow-up').parent().css('margin-bottom', '4px');
          htmlElement
            .find('.encumbrance-breakpoint.encumbrance-33.arrow-up')
            .append(`<div class="encumbrance-breakpoint-label VELabel">${encumbranceData.lightMax}<div>`);
          htmlElement
            .find('.encumbrance-breakpoint.encumbrance-66.arrow-up')
            .append(`<div class="encumbrance-breakpoint-label VELabel">${encumbranceData.mediumMax}<div>`);
          encumbranceElements[1].insertAdjacentHTML(
            'afterend',
            `<span class="VELabel" style="right:0%">${encumbranceData.heavyMax}</span>`,
          );
          encumbranceElements[1].insertAdjacentHTML('afterend', `<span class="VELabel">0</span>`);
        }
      }
    },
  );

  Hooks.on('updateActor', async (actorEntity: Actor, data) => {
    if (
      actorEntity &&
      (actorEntity.data.type === EncumbranceActorType.CHARACTER ||
        actorEntity.data.type === EncumbranceActorType.VEHICLE)
    ) {
      let doTheUpdate = false;

      // For our purpose we filter only the STR modifier action
      //@ts-ignore
      if (data?.data?.abilities?.str) {
        //@ts-ignore
        if (actorEntity.data.data.abilities.str.value !== data?.data?.abilities?.str.value) {
          //@ts-ignore
          actorEntity.data.data.abilities.str.value = data?.data?.abilities?.str.value;
        }
        doTheUpdate = true;
      }
      // For our purpose we filter only the CURRENCY modifier action
      if (data?.data?.currency) {
        doTheUpdate = true;
      }
      // For our purpose we filter only the invenctory-plus modifier action
      if (
        invPlusActive &&
        data?.flags &&
        hasProperty(data, `flags.${VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME}`)
      ) {
        doTheUpdate = true;
      }

      // Do the update
      if (doTheUpdate) {
        await VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, EncumbranceMode.ADD);
      }
    }
  });

  // Hooks.on('preCreateActiveEffect', (activeEffect, config, userId) => {

  // });

  // Hooks.on('createActiveEffect', (activeEffect, config, userId) => {
  //   if (!activeEffect?.data?.flags?.isConvenient) {
  //     return;
  //   }
  //   const actorEntity: any = activeEffect.parent;
  //   if (actorEntity && (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)) {
  //     if (getGame().userId !== userId || actorEntity.constructor.name != 'Actor5e') {
  //       // Only act if we initiated the update ourselves, and the effect is a child of a character
  //       return;
  //     }

  //     if (!activeEffect?.data?.flags[VARIANT_ENCUMBRANCE_FLAG]) {
  //       VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, activeEffect, EncumbranceMode.ADD);
  //     }
  //   }
  // });

  // Hooks.on('preDeleteActiveEffect', (activeEffect, config, userId) => {

  // });

  // Hooks.on('deleteActiveEffect', (activeEffect, config, userId) => {
  //   if (!activeEffect?.data?.flags?.isConvenient) {
  //     return;
  //   }

  //   const actorEntity: any = activeEffect.parent;
  //   if (actorEntity && (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)) {
  //     if (getGame().userId !== userId || actorEntity.constructor.name != 'Actor5e') {
  //       // Only act if we initiated the update ourselves, and the effect is a child of a character
  //       return;
  //     }

  //     if (!activeEffect?.data?.flags[VARIANT_ENCUMBRANCE_FLAG]) {
  //       VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, activeEffect, EncumbranceMode.DELETE);
  //     }
  //   }
  // });

  // Hooks.on('preUpdateActiveEffect', function (activeEffect, config, userId) {

  // });

  // Hooks.on('updateActiveEffect', function (activeEffect, config, userId) {
  //   if (!activeEffect?.data?.flags?.isConvenient) {
  //     return;
  //   }

  //   const actorEntity: any = activeEffect.parent;
  //   if (actorEntity && (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)) {
  //     if (getGame().userId !== userId || actorEntity.constructor.name != 'Actor5e') {
  //       // Only act if we initiated the update ourselves, and the effect is a child of a character
  //       return;
  //     }

  //     if (!activeEffect?.data?.flags[VARIANT_ENCUMBRANCE_FLAG]) {
  //       VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, activeEffect, EncumbranceMode.UPDATE);
  //     }
  //   }
  // });
  Hooks.on('getActorSheetHeaderButtons', async (app, buttons: any[]) => {
    const actorSheet = <ActorSheet>app.object.sheet;
    const actorEntity = <Actor>actorSheet.actor;
    const enableVarianEncumbranceOnSpecificActor = <boolean>(
      getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'enableVarianEncumbranceOnSpecificActor')
    );

    if (!actorEntity) {
      return;
    }

    if (enableVarianEncumbranceOnSpecificActor) {
      
      const varianEncumbranceButtons: any[] = [];

      let enableVarianEncumbranceEffectsOnSpecificActorFlag = true;
      if (!hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.ENABLED_AE}`)) {
        await actorEntity.setFlag(
          VARIANT_ENCUMBRANCE_FLAG,
          EncumbranceFlags.ENABLED_AE,
          enableVarianEncumbranceEffectsOnSpecificActorFlag,
        );
      } else {
        enableVarianEncumbranceEffectsOnSpecificActorFlag = <boolean>(
          actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.ENABLED_AE)
        );
      }

      let enableVarianEncumbranceWeightOnSpecificActorFlag = true;
      if (!hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.ENABLED_WE}`)) {
        await actorEntity.setFlag(
          VARIANT_ENCUMBRANCE_FLAG,
          EncumbranceFlags.ENABLED_WE,
          enableVarianEncumbranceWeightOnSpecificActorFlag,
        );
      } else {
        enableVarianEncumbranceWeightOnSpecificActorFlag = <boolean>(
          actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.ENABLED_WE)
        );
      }

      if (getGame().user?.isGM) {
        let mylabel = i18n('variant-encumbrance-dnd5e.label.enableVEAndWEOnSpecificActor');
        let myicon = 'fas fa-weight-hanging';
        let index = 0;
        if (enableVarianEncumbranceEffectsOnSpecificActorFlag && enableVarianEncumbranceWeightOnSpecificActorFlag) {
          mylabel = i18n('variant-encumbrance-dnd5e.label.enableVEAndWEOnSpecificActor');
          myicon = 'fas fa-weight-hanging';
          index = 0;
        } else if (
          !enableVarianEncumbranceEffectsOnSpecificActorFlag &&
          enableVarianEncumbranceWeightOnSpecificActorFlag
        ) {
          mylabel = i18n('variant-encumbrance-dnd5e.label.enableWEOnSpecificActor');
          myicon = 'fas fa-balance-scale-right';
          index = 1;
        } else if (
          !enableVarianEncumbranceEffectsOnSpecificActorFlag &&
          !enableVarianEncumbranceWeightOnSpecificActorFlag
        ) {
          mylabel = i18n('variant-encumbrance-dnd5e.label.disableVEAndWEOnSpecificActor');
          myicon = 'fas fa-feather';
          index = 2;
        } else if (
          enableVarianEncumbranceEffectsOnSpecificActorFlag &&
          !enableVarianEncumbranceWeightOnSpecificActorFlag
        ) {
          // THIS USE CASE CAN'T BE HAPPENED WE REST TO THE STANDARD
          mylabel = i18n('variant-encumbrance-dnd5e.label.enableVEAndWEOnSpecificActor');
          myicon = 'fas fa-weight-hanging';
          index = 3;
        } else {
          throw new Error('Something is wrong');
        }

        const removeLabelButtonsSheetHeader = <boolean>(
          getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'removeLabelButtonsSheetHeader')
        );

        if (removeLabelButtonsSheetHeader) {
          mylabel = '';
        }

        //if (app.object.isOwner) {
        // only prototype actors
        if (!app.object.token) {
          //   varianEncumbranceButtons.push({
          //       label: removeLabelSheetHeader ? "" : "Theatre.UI.Config.Theatre",
          //       class: "configure-theatre",
          //       icon: "fas fa-user-edit",
          //       onclick: ev => Theatre.onConfigureInsert(ev, app.object.sheet)
          //   });
        }
        varianEncumbranceButtons.push({
          label: mylabel,
          class: 'enable-disable-variant-encumbrance',
          icon: myicon,
          onclick: async (ev) => {
            if (index == 0) {
              enableVarianEncumbranceEffectsOnSpecificActorFlag = false;
              enableVarianEncumbranceWeightOnSpecificActorFlag = true;
              mylabel = i18n('variant-encumbrance-dnd5e.label.enableWEOnSpecificActor');
              myicon = 'fas fa-balance-scale-right';
              index = 1;
            } else if (index == 1) {
              enableVarianEncumbranceEffectsOnSpecificActorFlag = false;
              enableVarianEncumbranceWeightOnSpecificActorFlag = false;
              mylabel = i18n('variant-encumbrance-dnd5e.label.disableVEAndWEOnSpecificActor');
              myicon = 'fas fa-feather';
              index = 2;
            } else if (index == 2) {
              enableVarianEncumbranceEffectsOnSpecificActorFlag = true;
              enableVarianEncumbranceWeightOnSpecificActorFlag = true;
              mylabel = i18n('variant-encumbrance-dnd5e.label.enableVEAndWEOnSpecificActor');
              myicon = 'fas fa-weight-hanging';
              index = 0;
            } else if (index == 3) {
              enableVarianEncumbranceEffectsOnSpecificActorFlag = true;
              enableVarianEncumbranceWeightOnSpecificActorFlag = true;
              mylabel = i18n('variant-encumbrance-dnd5e.label.enableVEAndWEOnSpecificActor');
              myicon = 'fas fa-weight-hanging';
              index = 0;
            }

            await actorEntity.setFlag(
              VARIANT_ENCUMBRANCE_FLAG,
              EncumbranceFlags.ENABLED_AE,
              enableVarianEncumbranceEffectsOnSpecificActorFlag,
            );
            await actorEntity.setFlag(
              VARIANT_ENCUMBRANCE_FLAG,
              EncumbranceFlags.ENABLED_WE,
              enableVarianEncumbranceWeightOnSpecificActorFlag,
            );

            if (!enableVarianEncumbranceEffectsOnSpecificActorFlag) {
              await VariantEncumbranceImpl.manageActiveEffect(actorEntity, ENCUMBRANCE_TIERS.NONE);
            }
            if (enableVarianEncumbranceWeightOnSpecificActorFlag) {
              await VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, EncumbranceMode.UPDATE);
            }
            if (removeLabelButtonsSheetHeader) {
              mylabel = '';
            }
            ev.currentTarget.innerHTML = `<i class="${myicon}"></i>${mylabel}`;
          },
        });
      }
      buttons.unshift(...varianEncumbranceButtons);
    } else {
      if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.ENABLED_AE}`)) {
        actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.ENABLED_AE);
      }
      if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.ENABLED_WE}`)) {
        actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.ENABLED_WE);
      }
      await VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, EncumbranceMode.UPDATE);
    }
  });
};

export const setupHooks = async () => {
  // setup all the hooks

  // //@ts-ignore
  // libWrapper.register(
  //   VARIANT_ENCUMBRANCE_MODULE_NAME,
  //   'CONFIG.Item.documentClass.prototype.getEmbeddedDocument',
  //   getEmbeddedDocument,
  //   'MIXED',
  // );
  //@ts-ignore
  libWrapper.register(
    VARIANT_ENCUMBRANCE_MODULE_NAME,
    'CONFIG.Item.documentClass.prototype.createEmbeddedDocuments',
    createEmbeddedDocuments,
    'MIXED',
  );
  //@ts-ignore
  libWrapper.register(
    VARIANT_ENCUMBRANCE_MODULE_NAME,
    'CONFIG.Item.documentClass.prototype.deleteEmbeddedDocuments',
    deleteEmbeddedDocuments,
    'MIXED',
  );
  //@ts-ignore
  libWrapper.register(
    VARIANT_ENCUMBRANCE_MODULE_NAME,
    'CONFIG.Item.documentClass.prototype.updateEmbeddedDocuments',
    updateEmbeddedDocuments,
    'MIXED',
  );
  //@ts-ignore
  // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.prepareEmbeddedEntities", prepareEmbeddedEntities, "WRAPPER");
  //@ts-ignore
  // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.getEmbeddedCollection", getEmbeddedCollection, "MIXED")
  // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.prepareDerivedData", prepareDerivedData, "WRAPPER");

  //@ts-ignore
  // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.actor", getActor, "OVERRIDE")
  //@ts-ignore
  // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.update", _update, "MIXED")
  //@ts-ignore
  // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.delete", _delete, "MIXED")
  //@ts-ignore
  // libWrapper.register(MODULE_NAME, "CONFIG.Item.documentClass.prototype.isEmbedded", isEmbedded, "OVERRIDE")

  //@ts-ignore
  // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass._onCreateDocuments", _onCreateDocuments, "MIXED")

  //@ts-ignore
  libWrapper.register(
    VARIANT_ENCUMBRANCE_MODULE_NAME,
    'CONFIG.Item.documentClass.createDocuments',
    createDocuments,
    'MIXED',
  );
  //@ts-ignore
  libWrapper.register(
    VARIANT_ENCUMBRANCE_MODULE_NAME,
    'CONFIG.Item.documentClass.deleteDocuments',
    deleteDocuments,
    'MIXED',
  );
  //@ts-ignore
  libWrapper.register(
    VARIANT_ENCUMBRANCE_MODULE_NAME,
    'CONFIG.Item.documentClass.updateDocuments',
    updateDocuments,
    'MIXED',
  );
};

export const initHooks = () => {
  warn('Init Hooks processing');

  // CONFIG.DND5E.encumbrance = {
  //   currencyPerWeight: {
  //     imperial: 50,
  //     metric: 110
  //   },
  //   strMultiplier: {
  //     imperial: 15,
  //     metric: 6.8
  //   },
  //   vehicleWeightMultiplier: {
  //     imperial: 2000, // 2000 lbs in an imperial ton
  //     metric: 1000 // 1000 kg in a metric ton
  //   }
  // };

  //@ts-ignore
  CONFIG.DND5E.encumbrance.strMultiplier.imperial = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'strengthMultiplier') || 15;
  //@ts-ignore
  CONFIG.DND5E.encumbrance.strMultiplier.metric = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'strengthMultiplierMetric') || 6.8;
  
  //@ts-ignore
  CONFIG.DND5E.encumbrance.currencyPerWeight.imperial = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight') || 50;
  //@ts-ignore
  CONFIG.DND5E.encumbrance.currencyPerWeight.metric = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeightMetric') || 110;

  //@ts-ignore
  CONFIG.DND5E.encumbrance.vehicleWeightMultiplier.imperial = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'vehicleWeightMultiplier') || 2000;
  //@ts-ignore
  CONFIG.DND5E.encumbrance.vehicleWeightMultiplier.metric = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'vehicleWeightMultiplierMetric') || 1000

  // CONFIG.debug.hooks = true; // For debugging only

  invPlusActive = <boolean>getGame().modules.get(VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME)?.active;
  invMidiQol = <boolean>getGame().modules.get(VARIANT_ENCUMBRANCE_MIDI_QOL_MODULE_NAME)?.active;
  itemContainerActive = <boolean>getGame().modules.get(VARIANT_ENCUMBRANCE_ITEM_COLLECTION_MODULE_NAME)?.active;

  // effectInterface.initialize();
};

// export function getEmbeddedDocument(wrapped, embeddedName, id, { strict = false } = {}) {
//   const actorEntity: Actor = this.actor;
//   if (actorEntity && (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)) {
//     VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, EncumbranceMode.ADD);
//   }
//   return wrapped(embeddedName, id, { strict });
// }

export async function createEmbeddedDocuments(wrapped, embeddedName, data, context) {
  const actorEntity: Actor = this.actor;
  if (
    actorEntity &&
    (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)
  ) {
    await VariantEncumbranceImpl.updateEncumbrance(actorEntity, data, undefined, EncumbranceMode.ADD);
  }
  return wrapped(embeddedName, data, context);
}

export async function deleteEmbeddedDocuments(wrapped, embeddedName, ids = [], options = {}) {
  const actorEntity: Actor = this.actor;
  if (
    actorEntity &&
    (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)
  ) {
    await VariantEncumbranceImpl.updateEncumbrance(actorEntity, ids, undefined, EncumbranceMode.DELETE);
  }
  return wrapped(embeddedName, ids, options);
}

export async function updateEmbeddedDocuments(wrapped, embeddedName, data, options) {
  const actorEntity: Actor = this.actor;
  if (
    actorEntity &&
    (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)
  ) {
    await VariantEncumbranceImpl.updateEncumbrance(actorEntity, data, undefined, EncumbranceMode.UPDATE);
  }
  return wrapped(embeddedName, data, options);
}

export async function createDocuments(wrapped, data, context = { parent: {}, pack: {}, options: {} }) {
  const { parent, pack, options } = context;
  const actorEntity: Actor = <Actor>parent;
  if (
    actorEntity &&
    (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)
  ) {
    await VariantEncumbranceImpl.updateEncumbrance(actorEntity, data, undefined, EncumbranceMode.ADD);
  }
  return wrapped(data, context);
}

export async function updateDocuments(wrapped, updates = [], context = { parent: {}, pack: {}, options: {} }) {
  const { parent, pack, options } = context;
  const actorEntity: Actor = <Actor>parent;
  if (
    actorEntity &&
    (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)
  ) {
    await VariantEncumbranceImpl.updateEncumbrance(actorEntity, updates, undefined, EncumbranceMode.UPDATE);
  }
  return wrapped(updates, context);
}

export async function deleteDocuments(wrapped, ids = [], context = { parent: {}, pack: {}, options: {} }) {
  const { parent, pack, options } = context;
  const actorEntity: Actor = <Actor>parent;
  if (
    actorEntity &&
    (actorEntity.data.type === EncumbranceActorType.CHARACTER || actorEntity.data.type === EncumbranceActorType.VEHICLE)
  ) {
    await VariantEncumbranceImpl.updateEncumbrance(actorEntity, ids, undefined, EncumbranceMode.DELETE);
  }
  return wrapped(ids, context);
}

//// export function prepareEmbeddedEntities(wrapped) {
////   const actorEntity:Actor = this.actor;
////   updateEncumbrance(actorEntity, undefined, undefined, "add");
////   wrapped();
////   return;
//// }

// export function getEmbeddedCollection(wrapped, type) {
//   const actorEntity:Actor = this.actor;
//   VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, "add");
//   return wrapped(type);
// }

// export async function _onCreateDocuments(wrapped, items, context) {
//   for ( let item of items ) {
//     const actorEntity:Actor = item.actor;
//     VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, "add");
//   }
//   return wrapped(items, context);
// }

// export async function _update(wrapped, data) {
//   const actorEntity:Actor = this.actor;
//   const isequipped = data.equipped;
//   if(actorEntity && actorEntity.data.type === "character"){
//     await VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, "add");
//   }
//   return wrapped(data);
// }

// export async function _delete(wrapped, data) {
//   const actorEntity:Actor = this.actor;
//   VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, "delete");
//   return wrapped(data);
// }
