import { BULK_CATEGORY, BulkData, EncumbranceActorType } from './../VariantEncumbranceModels';
import CONSTANTS from '../constants.js';
import type {
  EffectChangeData,
  EffectChangeDataProperties,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import type EmbeddedCollection from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs';
import type { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';

// =============================
// Module Generic function
// =============================

export async function getToken(documentUuid) {
  const document = await fromUuid(documentUuid);
  //@ts-ignore
  return document?.token ?? document;
}

export function getOwnedTokens(priorityToControlledIfGM: boolean): Token[] {
  const gm = game.user?.isGM;
  if (gm) {
    if (priorityToControlledIfGM) {
      const arr = <Token[]>canvas.tokens?.controlled;
      if (arr && arr.length > 0) {
        return arr;
      } else {
        return <Token[]>canvas.tokens?.placeables;
      }
    } else {
      return <Token[]>canvas.tokens?.placeables;
    }
  }
  if (priorityToControlledIfGM) {
    const arr = <Token[]>canvas.tokens?.controlled;
    if (arr && arr.length > 0) {
      return arr;
    }
  }
  let ownedTokens = <Token[]>canvas.tokens?.placeables.filter((token) => token.isOwner && (!token.data.hidden || gm));
  if (ownedTokens.length === 0 || !canvas.tokens?.controlled[0]) {
    ownedTokens = <Token[]>(
      canvas.tokens?.placeables.filter((token) => (token.observer || token.isOwner) && (!token.data.hidden || gm))
    );
  }
  return ownedTokens;
}

export function is_UUID(inId) {
  return typeof inId === 'string' && (inId.match(/\./g) || []).length && !inId.endsWith('.');
}

export function getUuid(target) {
  // If it's an actor, get its TokenDocument
  // If it's a token, get its Document
  // If it's a TokenDocument, just use it
  // Otherwise fail
  const document = getDocument(target);
  return document?.uuid ?? false;
}

export function getDocument(target) {
  if (target instanceof foundry.abstract.Document) return target;
  return target?.document;
}

export function is_real_number(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === 'number' && isFinite(inNumber);
}

export function isGMConnected() {
  return !!Array.from(<Users>game.users).find((user) => user.isGM && user.active);
}

export function isGMConnectedAndSocketLibEnable() {
  return isGMConnected(); // && !game.settings.get(CONSTANTS.MODULE_NAME, 'doNotUseSocketLibFeature');
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isActiveGM(user) {
  return user.active && user.isGM;
}

export function getActiveGMs() {
  return game.users?.filter(isActiveGM);
}

export function isResponsibleGM() {
  if (!game.user?.isGM) return false;
  return !getActiveGMs()?.some((other) => other.data._id < <string>game.user?.data._id);
}

export function firstGM() {
  return game.users?.find((u) => u.isGM && u.active);
}

export function isFirstGM() {
  return game.user?.id === firstGM()?.id;
}

export function firstOwner(doc): User | undefined {
  /* null docs could mean an empty lookup, null docs are not owned by anyone */
  if (!doc) return undefined;
  const permissionObject = (doc instanceof TokenDocument ? doc.actor?.data.permission : doc.data.permission) ?? {};
  const playerOwners = Object.entries(permissionObject)
    .filter(([id, level]) => !game.users?.get(id)?.isGM && game.users?.get(id)?.active && level === 3)
    .map(([id, level]) => id);

  if (playerOwners.length > 0) {
    return game.users?.get(<string>playerOwners[0]);
  }

  /* if no online player owns this actor, fall back to first GM */
  return firstGM();
}

/* Players first, then GM */
export function isFirstOwner(doc) {
  return game.user?.id === firstOwner(doc)?.id;
}

// ================================
// Logger utility
// ================================

// export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3

export function debug(msg, args = '') {
  if (game.settings.get(CONSTANTS.MODULE_NAME, 'debug')) {
    console.log(`DEBUG | ${CONSTANTS.MODULE_NAME} | ${msg}`, args);
  }
  return msg;
}

export function log(message) {
  message = `${CONSTANTS.MODULE_NAME} | ${message}`;
  console.log(message.replace('<br>', '\n'));
  return message;
}

export function notify(message) {
  message = `${CONSTANTS.MODULE_NAME} | ${message}`;
  ui.notifications?.notify(message);
  console.log(message.replace('<br>', '\n'));
  return message;
}

export function info(info, notify = false) {
  info = `${CONSTANTS.MODULE_NAME} | ${info}`;
  if (notify) ui.notifications?.info(info);
  console.log(info.replace('<br>', '\n'));
  return info;
}

export function warn(warning, notify = false) {
  warning = `${CONSTANTS.MODULE_NAME} | ${warning}`;
  if (notify) ui.notifications?.warn(warning);
  console.warn(warning.replace('<br>', '\n'));
  return warning;
}

export function error(error, notify = true) {
  error = `${CONSTANTS.MODULE_NAME} | ${error}`;
  if (notify) ui.notifications?.error(error);
  return new Error(error.replace('<br>', '\n'));
}

export function timelog(message): void {
  warn(Date.now(), message);
}

export const i18n = (key: string): string => {
  return game.i18n.localize(key)?.trim();
};

export const i18nFormat = (key: string, data = {}): string => {
  return game.i18n.format(key, data)?.trim();
};

// export const setDebugLevel = (debugText: string): void => {
//   debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
//   // 0 = none, warnings = 1, debug = 2, all = 3
//   if (debugEnabled >= 3) CONFIG.debug.hooks = true;
// };

export function dialogWarning(message, icon = 'fas fa-exclamation-triangle') {
  return `<p class="${CONSTANTS.MODULE_NAME}-dialog">
        <i style="font-size:3rem;" class="${icon}"></i><br><br>
        <strong style="font-size:1.2rem;">${CONSTANTS.MODULE_NAME}</strong>
        <br><br>${message}
    </p>`;
}

// =========================================================================================

export function cleanUpString(stringToCleanUp: string) {
  // regex expression to match all non-alphanumeric characters in string
  const regex = /[^A-Za-z0-9]/g;
  if (stringToCleanUp) {
    return i18n(stringToCleanUp).replace(regex, '').toLowerCase();
  } else {
    return stringToCleanUp;
  }
}

export function isStringEquals(stringToCheck1: string, stringToCheck2: string, startsWith = false): boolean {
  if (stringToCheck1 && stringToCheck2) {
    const s1 = cleanUpString(stringToCheck1) ?? '';
    const s2 = cleanUpString(stringToCheck2) ?? '';
    if (startsWith) {
      return s1.startsWith(s2) || s2.startsWith(s1);
    } else {
      return s1 === s2;
    }
  } else {
    return stringToCheck1 === stringToCheck2;
  }
}

/**
 * The duplicate function of foundry keep converting my string value to "0"
 * i don't know why this methos is a brute force solution for avoid that problem
 */
export function duplicateExtended(obj: any): any {
  try {
    //@ts-ignore
    if (structuredClone) {
      //@ts-ignore
      return structuredClone(obj);
    } else {
      // Shallow copy
      // const newObject = jQuery.extend({}, oldObject);
      // Deep copy
      // const newObject = jQuery.extend(true, {}, oldObject);
      return jQuery.extend(true, {}, obj);
    }
  } catch (e) {
    return duplicate(obj);
  }
}

// =========================================================================================

/**
 *
 * @param obj Little helper for loop enum element on typescript
 * @href https://www.petermorlion.com/iterating-a-typescript-enum/
 * @returns
 */
export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

/**
 * @href https://stackoverflow.com/questions/7146217/merge-2-arrays-of-objects
 * @param target
 * @param source
 * @param prop
 */
export function mergeByProperty(target: any[], source: any[], prop: any) {
  for (const sourceElement of source) {
    const targetElement = target.find((targetElement) => {
      return sourceElement[prop] === targetElement[prop];
    });
    targetElement ? Object.assign(targetElement, sourceElement) : target.push(sourceElement);
  }
  return target;
}

/**
 * Returns the first selected token
 */
export function getFirstPlayerTokenSelected(): Token | null {
  // Get first token ownted by the player
  const selectedTokens = <Token[]>canvas.tokens?.controlled;
  if (selectedTokens.length > 1) {
    //iteractionFailNotification(i18n("foundryvtt-arms-reach.warningNoSelectMoreThanOneToken"));
    return null;
  }
  if (!selectedTokens || selectedTokens.length === 0) {
    //if(game.user.character.data.token){
    //  //@ts-ignore
    //  return game.user.character.data.token;
    //}else{
    return null;
    //}
  }
  return <Token>selectedTokens[0];
}

/**
 * Returns a list of selected (or owned, if no token is selected)
 * note: ex getSelectedOrOwnedToken
 */
export function getFirstPlayerToken(): Token | null {
  // Get controlled token
  let token: Token;
  const controlled: Token[] = <Token[]>canvas.tokens?.controlled;
  // Do nothing if multiple tokens are selected
  if (controlled.length && controlled.length > 1) {
    //iteractionFailNotification(i18n("foundryvtt-arms-reach.warningNoSelectMoreThanOneToken"));
    return null;
  }
  // If exactly one token is selected, take that
  token = <Token>controlled[0];
  if (!token) {
    if (!controlled.length || controlled.length === 0) {
      // If no token is selected use the token of the users character
      token = <Token>canvas.tokens?.placeables.find((token) => token.data._id === game.user?.character?.data?._id);
    }
    // If no token is selected use the first owned token of the users character you found
    if (!token) {
      token = <Token>canvas.tokens?.ownedTokens[0];
    }
  }
  return token;
}

function getElevationToken(token: Token): number {
  const base = token.document.data;
  return getElevationPlaceableObject(base);
}

function getElevationWall(wall: Wall): number {
  const base = wall.document.data;
  return getElevationPlaceableObject(base);
}

function getElevationPlaceableObject(placeableObject: any): number {
  let base = placeableObject;
  if (base.document) {
    base = base.document.data;
  }
  const base_elevation =
    //@ts-ignore
    typeof _levels !== 'undefined' &&
    //@ts-ignore
    _levels?.advancedLOS &&
    (placeableObject instanceof Token || placeableObject instanceof TokenDocument)
      ? //@ts-ignore
        _levels.getTokenLOSheight(placeableObject)
      : base.elevation ??
        base.flags['levels']?.elevation ??
        base.flags['levels']?.rangeBottom ??
        base.flags['wallHeight']?.wallHeightBottom ??
        0;
  return base_elevation;
}

// =============================
// Module specific function
// =============================

export function convertPoundsToKg(valNum: number): number {
  return valNum / 2.20462262;
}

export function convertKgToPounds(valNum: number): number {
  return valNum * 2.20462262;
}

export function checkBulkCategory(weight: number): BulkData {
  let bulkRef = weight;
  if (game.settings.get('dnd5e', 'metricWeightUnits')) {
    bulkRef = weight <= 0 ? 0 : convertPoundsToKg(weight);
  }
  if (bulkRef <= 0) {
    return BULK_CATEGORY.NONE;
  } else if (bulkRef <= 2) {
    return BULK_CATEGORY.TINY;
  } else if (bulkRef > 2 && bulkRef <= 5) {
    return BULK_CATEGORY.SMALL;
  } else if (bulkRef > 5 && bulkRef <= 10) {
    return BULK_CATEGORY.SMALL;
  } else if (bulkRef > 10 && bulkRef <= 35) {
    return BULK_CATEGORY.LARGE;
  } else if (bulkRef > 35 && bulkRef <= 70) {
    return BULK_CATEGORY.X_LARGE;
  } else if (bulkRef > 70) {
    return BULK_CATEGORY.XX_LARGE;
  } else {
    return BULK_CATEGORY.XX_LARGE;
  }
}

export function retrieveAttributeEncumbranceMax(actorEntity: Actor, standardValueN: number): number {
  // const standardValueS = getProperty(actor, 'data.data.attributes.encumbrance.max');
  // let standardValueN = 0;
  // try {
  //   standardValueN = Number(standardValueS);
  // } catch (e) {
  //   standardValueN = 0;
  // }
  const daeValue = retrieveActiveEffectDataChangeByKey(actorEntity, 'data.attributes.encumbrance.max');
  try {
    if (daeValue) {
      const valueN = Number(daeValue.value);
      if (daeValue.mode === CONST.ACTIVE_EFFECT_MODES.ADD) {
        return standardValueN + valueN;
      } else if (daeValue.mode === CONST.ACTIVE_EFFECT_MODES.DOWNGRADE) {
        return standardValueN - valueN;
      } else if (daeValue.mode === CONST.ACTIVE_EFFECT_MODES.MULTIPLY) {
        return standardValueN * valueN;
      } else if (
        daeValue.mode === CONST.ACTIVE_EFFECT_MODES.CUSTOM ||
        daeValue.mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE ||
        daeValue.mode === CONST.ACTIVE_EFFECT_MODES.UPGRADE
      ) {
        return valueN;
      } else {
        warn(`Can't parse the mode value ${daeValue.mode} for 'data.attributes.encumbrance.max'`);
        return 0;
      }
    } else {
      return 0;
    }
  } catch (e) {
    warn(`Can't parse the value ${daeValue} for 'data.attributes.encumbrance.max'`);
    return 0;
  }
}

export function retrieveAttributeCapacityCargo(actor: Actor, standardValueN: number): number {
  // const standardValueS = getProperty(actor, 'data.data.attributes.capacity.cargo');
  // let standardValueN = 0;
  // try {
  //   standardValueN = Number(standardValueS);
  // } catch (e) {
  //   standardValueN = 0;
  // }
  const daeValue = retrieveActiveEffectDataChangeByKey(actor, 'data.data.attributes.capacity.cargo');
  try {
    if (daeValue) {
      const valueN = Number(daeValue.value);
      if (daeValue.mode === CONST.ACTIVE_EFFECT_MODES.ADD) {
        return standardValueN + valueN;
      } else if (daeValue.mode === CONST.ACTIVE_EFFECT_MODES.DOWNGRADE) {
        return standardValueN - valueN;
      } else if (daeValue.mode === CONST.ACTIVE_EFFECT_MODES.MULTIPLY) {
        return standardValueN * valueN;
      } else if (
        daeValue.mode === CONST.ACTIVE_EFFECT_MODES.CUSTOM ||
        daeValue.mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE ||
        daeValue.mode === CONST.ACTIVE_EFFECT_MODES.UPGRADE
      ) {
        return valueN;
      } else {
        warn(`Can't parse the mode value ${daeValue.mode} for 'data.data.attributes.capacity.cargo'`);
        return 0;
      }
    } else {
      return 0;
    }
  } catch (e) {
    warn(`Can't parse the value ${daeValue} for 'data.data.attributes.capacity.cargo'`);
    return 0;
  }
}

export function retrieveActiveEffectDataChangeByKey(actor: Actor, key: string): EffectChangeDataProperties | undefined {
  if (!actor) {
    return undefined;
  }
  if (actor.documentName !== 'Actor') {
    return undefined;
  }
  const isPlayerOwned = <boolean>actor.token?.isOwner;
  if (!game.user?.isGM && !isPlayerOwned) {
    return undefined;
  }
  // let sourceToken = <Token>actor.token?.object;
  // if (!sourceToken) {
  //   sourceToken = <Token>canvas.tokens?.placeables.find((t) => {
  //     return <string>t.actor?.id === <string>actor.id;
  //   });
  // }
  // if (!sourceToken) {
  //   return;
  // }
  //@ts-ignore
  let valueDefault: EffectChangeDataProperties | undefined = undefined;
  const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects;
  for (const aef of actorEffects) {
    if (aef.data.disabled) {
      continue;
    }
    const c = retrieveActiveEffectDataChangeByKeyFromActiveEffect(actor, key, aef.data.changes);
    if (c && c.value) {
      valueDefault = c;
      break;
    }
  }
  return valueDefault;
}

export function retrieveActiveEffectDataChangeByKeyFromActiveEffect(
  actor: Actor,
  activeEffectDataChangeKey: string,
  effectChanges: EffectChangeData[],
): EffectChangeDataProperties|undefined {
  const effectEntityChanges = effectChanges.sort((a, b) => <number>a.priority - <number>b.priority);
  const atcvEffectChangeData = <EffectChangeData>effectEntityChanges.find((aee) => {
    if (aee.key === activeEffectDataChangeKey && aee.value) {
      return aee;
    }
  });
  if(!atcvEffectChangeData || !atcvEffectChangeData.value){
    return undefined;
  }
  let myvalue = '';
  if (atcvEffectChangeData.value && String(atcvEffectChangeData.value).includes('data.')) {
    // Retrieve the formula.
    const formula = atcvEffectChangeData.value.replace(/data\./g, '@');
    // Replace shorthand.
    // formula = formula
    //   .replace(/@abil\./g, '@abilities.')
    //   .replace(/@attr\./g, '@attributes.');
    // Roll the dice!
    // Build the roll.
    const data = actor ? actor.getRollData() : {};
    const roll = new Roll(formula, data);
    // Roll the dice.
    let myresult = '';
    //roll.roll();
    try {
      // TODO Roll#evaluate is becoming asynchronous. In the short term you may pass async=true or async=false
      // to evaluation options to nominate your preferred behavior.
      roll.evaluate({ async: false });
      //await roll.evaluate({async: true});
      myresult = roll.total ? String(roll.total) : roll.result;
    } catch (e) {
      const evalValue = eval(roll.result);
      myresult = evalValue ? String(evalValue) : '';
    }
    myvalue = myresult;
  } else if (atcvEffectChangeData.value && String(atcvEffectChangeData.value).includes('@')) {
    // Retrieve the formula.
    const formula = atcvEffectChangeData.value;
    // Replace shorthand.
    // formula = formula
    //   .replace(/@abil\./g, '@abilities.')
    //   .replace(/@attr\./g, '@attributes.');
    // Roll the dice!
    // Build the roll.
    const data = actor ? actor.getRollData() : {};
    const roll = new Roll(formula, data);
    // Roll the dice.
    let myresult = '';
    //roll.roll();
    try {
      // TODO Roll#evaluate is becoming asynchronous. In the short term you may pass async=true or async=false
      // to evaluation options to nominate your preferred behavior.
      roll.evaluate({ async: false });
      //await roll.evaluate({async: true});
      myresult = roll.total ? String(roll.total) : roll.result;
    } catch (e) {
      const evalValue = eval(roll.result);
      myresult = evalValue ? String(evalValue) : '';
    }
    myvalue = myresult;
  } else {
    try {
      const evalValue = eval(atcvEffectChangeData.value);
      myvalue = evalValue ? String(evalValue) : '';
    } catch (e) {
      myvalue = atcvEffectChangeData.value;
    }
  }
  return {
    key: atcvEffectChangeData.key,
    value: myvalue,
    mode: atcvEffectChangeData.mode,
    priority: atcvEffectChangeData.priority,
  };
}
