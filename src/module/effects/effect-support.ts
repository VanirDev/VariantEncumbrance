import type { ActiveEffectDataProperties } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData';
import type { EffectChangeData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import type { PropertiesToSource } from '@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes';
import { duplicateExtended, i18n, isStringEquals, is_real_number } from '../lib/lib';
import Effect, { Constants } from './effect';

export class EffectSupport {
  static buildDefault(
    // effectData: Effect,
    id: string,
    name: string,
    icon: string,
    isPassive: boolean,
    changes: EffectChangeData[] = [],
    atlChanges: EffectChangeData[] = [],
    tokenMagicChanges: EffectChangeData[] = [],
    atcvChanges: EffectChangeData[] = [],
  ): Effect {
    return new Effect({
      customId: id,
      name: i18n(name),
      description: ``,
      icon: icon,
      tint: undefined,
      seconds: 0,
      rounds: 0,
      turns: 0,
      flags: foundry.utils.mergeObject(
        {},
        {
          core: {
            statusId: isPassive ? undefined : id,
            overlay: false,
          },
          isConvenient: true,
        },
      ),
      changes: changes,
      atlChanges: atlChanges,
      tokenMagicChanges: tokenMagicChanges,
      atcvChanges: atcvChanges,
      isDisabled: false,
      isTemporary: !isPassive,
      isSuppressed: false,
    });
  }

  static isDuplicateEffectChange(aeKey: string, arrChanges: EffectChangeData[]) {
    let isDuplicate = false;
    for (const aec of arrChanges) {
      if (isStringEquals(aec.key, aeKey)) {
        isDuplicate = true;
        break;
      }
    }
    return isDuplicate;
  }

  static _handleIntegrations(effect: Effect): EffectChangeData[] {
    const arrChanges: EffectChangeData[] = [];
    for (const change of effect?.changes) {
      if (!change.value) {
        change.value = '';
      }
      arrChanges.push(change);
    }

    if (effect.atlChanges.length > 0) {
      for (const atlChange of effect.atlChanges) {
        if (arrChanges.filter((e) => e.key === atlChange.key).length <= 0) {
          if (!EffectSupport.isDuplicateEffectChange(atlChange.key, arrChanges)) {
            if (!atlChange.value) {
              atlChange.value = '';
            }
            arrChanges.push(atlChange);
          }
        }
      }
    }

    if (effect.tokenMagicChanges.length > 0) {
      for (const tokenMagicChange of effect.tokenMagicChanges) {
        if (arrChanges.filter((e) => e.key === tokenMagicChange.key).length <= 0) {
          if (!EffectSupport.isDuplicateEffectChange(tokenMagicChange.key, arrChanges)) {
            if (!tokenMagicChange.value) {
              tokenMagicChange.value = '';
            }
            arrChanges.push(tokenMagicChange);
          }
        }
      }
    }

    if (effect.atcvChanges.length > 0) {
      for (const atcvChange of effect.atcvChanges) {
        if (arrChanges.filter((e) => e.key === atcvChange.key).length <= 0) {
          if (!EffectSupport.isDuplicateEffectChange(atcvChange.key, arrChanges)) {
            if (!atcvChange.value) {
              atcvChange.value = '';
            }
            arrChanges.push(atcvChange);
          }
        }
      }
    }
    /*
    if (effect.atlChanges.length > 0) {
      arrChanges.push(...effect.atlChanges);
    }

    if (effect.tokenMagicChanges.length > 0) {
      arrChanges.push(...effect.tokenMagicChanges);
    }

    if (effect.atcvChanges.length > 0) {
      arrChanges.push(...effect.atcvChanges);
    }
    */
    return arrChanges;
  }

  static _isEmptyObject(obj: any) {
    // because Object.keys(new Date()).length === 0;
    // we have to do some additional check
    if (obj == null || obj == undefined) {
      return true;
    }
    const result =
      obj && // null and undefined check
      (Object.keys(obj).length === 0 || Object.getPrototypeOf(obj) === Object.prototype);
    return result;
  }

  static _getDurationData(seconds: number, rounds: number, turns: number, isTemporary: boolean) {
    const isPassive = !isTemporary;
    if (game.combat) {
      if (isPassive) {
        return {
          startTime: game.time.worldTime,
          startRound: 0,
          startTurn: 0,
        };
      } else {
        return {
          startRound: game.combat.round,
          rounds: EffectSupport._getCombatRounds(seconds, rounds),
          turns: turns,
        };
      }
    } else {
      if (isPassive) {
        return {
          startTime: game.time.worldTime,
          startRound: 0,
          startTurn: 0,
        };
      } else {
        return {
          startTime: game.time.worldTime,
          seconds: EffectSupport._getSeconds(seconds, rounds),
        };
      }
    }
    /*
    if (game.combat) {
      return {
        startRound: game.combat.round,
        rounds: EffectSupport._getCombatRounds(seconds, rounds),
        turns: turns,
      };
    } else {
      return {
        startTime: game.time.worldTime,
        seconds: EffectSupport._getSeconds(seconds, rounds),
      };
    }
    */
  }

  static _getCombatRounds(seconds: number, rounds: number) {
    if (rounds) {
      return rounds;
    }

    if (seconds) {
      return seconds / Constants.SECONDS.IN_ONE_ROUND;
    }

    return undefined;
  }

  static _getSeconds(seconds: number, rounds: number) {
    if (seconds) {
      return seconds;
    }

    if (rounds) {
      return rounds * Constants.SECONDS.IN_ONE_ROUND;
    }

    return undefined;
  }

  static convertActiveEffectToEffect(effect: ActiveEffect): Effect {
    const atlChanges = effect.data.changes.filter((changes) => changes.key.startsWith('ATL'));
    const tokenMagicChanges = effect.data.changes.filter((changes) => changes.key === 'macro.tokenMagic');
    const atcvChanges = effect.data.changes.filter((changes) => changes.key.startsWith('ATCV'));
    const changes = effect.data.changes.filter(
      (change) => !change.key.startsWith('ATL') && change.key !== 'macro.tokenMagic' && !change.key.startsWith('ATCV'),
    );
    const isDisabled = effect.data.disabled || false;
    //@ts-ignore
    const isSuppressed = effect.data.document.isSuppressed || false;
    const isTemporary = effect.isTemporary || false;
    const isPassive = !isTemporary;

    return new Effect({
      customId: <string>effect.id,
      name: i18n(effect.data.label),
      description: i18n(<string>effect.data.flags.customEffectDescription),
      icon: <string>effect.data.icon,
      tint: <string>effect.data.tint,
      seconds: effect.data.duration.seconds,
      rounds: effect.data.duration.rounds,
      turns: effect.data.duration.turns,
      flags: effect.data.flags,
      changes,
      atlChanges,
      tokenMagicChanges,
      atcvChanges,
      isDisabled,
      isTemporary,
      isSuppressed,
    });
  }

  static convertActiveEffectDataPropertiesToActiveEffect(
    p: PropertiesToSource<ActiveEffectDataProperties>,
    isPassive: boolean,
  ): ActiveEffect {
    let isTemporary = false;
    //@ts-ignore
    const currentDae = EffectSupport._isEmptyObject(p.dae) ? p.flags.dae : p.dae;
    if (is_real_number(p.duration.seconds)) {
      isTemporary = true;
    }
    if (is_real_number(p.duration.rounds)) {
      isTemporary = true;
    }
    if (is_real_number(p.duration.turns)) {
      isTemporary = true;
    }
    isPassive = !isTemporary;
    //@ts-ignore
    return ActiveEffect.create({
      id: p._id,
      name: i18n(p.label),
      label: i18n(p.label),
      icon: p.icon,
      tint: p.tint,
      duration: EffectSupport._getDurationData(
        <number>p.duration.seconds,
        <number>p.duration.rounds,
        <number>p.duration.turns,
        !isPassive,
      ),
      flags: foundry.utils.mergeObject(p.flags, {
        core: {
          statusId: isPassive ? undefined : p._id,
          //@ts-ignore
          overlay: p.overlay ? p.overlay : false, // MOD 4535992
        },
        isConvenient: true,
        //@ts-ignore
        convenientDescription: p.description ? i18n(p.description) : '',
        dae: EffectSupport._isEmptyObject(currentDae)
          ? { stackable: false, specialDuration: [], transfer: true }
          : currentDae,
      }),
      origin: origin ? origin : p.origin ? p.origin : '', // MOD 4535992
      transfer: p.transfer ?? false,
      //changes: p.changes, // MOD 4535992
      changes: p.changes,
    });
  }

  /**
   * Converts the effect data to an active effect data object
   *
   * @param {object} params - the params to use for conversion
   * @param {string} params.origin - the origin to add to the effect
   * @param {boolean} params.overlay - whether the effect is an overlay or not
   * @returns {object} The active effect data object for this effect
   */
  public static convertToActiveEffectData(effect: Effect): Record<string, unknown> {
    if (is_real_number(effect.seconds)) {
      effect.isTemporary = true;
    }
    if (is_real_number(effect.rounds)) {
      effect.isTemporary = true;
    }
    if (is_real_number(effect.turns)) {
      effect.isTemporary = true;
    }
    const isPassive = !effect.isTemporary;
    const myid = effect._id ? effect._id : effect.flags?.core?.statusId ? effect.flags.core.statusId : undefined;
    const myoverlay = effect.overlay ? effect.overlay : effect.flags?.core?.overlay ? effect.flags.core.overlay : false;
    const currentDae = EffectSupport._isEmptyObject(effect.dae) ? effect.flags.dae : effect.dae;
    return {
      id: myid,
      name: i18n(effect.name),
      label: i18n(effect.name),
      description: i18n(effect.description), // 4535992 this not make sense, but it doesn't hurt either
      icon: effect.icon,
      tint: effect.tint,
      duration: EffectSupport._getDurationData(effect.seconds, effect.rounds, effect.turns, effect.isTemporary),
      flags: foundry.utils.mergeObject(effect.flags, {
        core: {
          statusId: isPassive ? undefined : myid,
          overlay: myoverlay,
        },
        isConvenient: true,
        convenientDescription: i18n(effect.description),
        dae: EffectSupport._isEmptyObject(currentDae)
          ? isPassive
            ? { stackable: false, specialDuration: [], transfer: true }
            : {}
          : currentDae,
      }),
      origin: effect.origin ? effect.origin : 'None', // MOD 4535992
      transfer: isPassive ? false : effect.transfer,
      //changes: effect.changes, // MOD 4535992
      changes: EffectSupport._handleIntegrations(effect),
      // 4535992 these are not under data
      // isDisabled: effect.isDisabled ?? false,
      // isTemporary: effect.isTemporary ?? false,
      // isSuppressed: effect.isSuppressed ?? false,
    };
  }

  // static retrieveChangesOrderedByPriority(changesTmp: EffectChangeData[]) {
  //   // Organize non-disabled effects by their application priority
  //   const changes = <EffectChangeData[]>changesTmp.reduce((changes) => {
  //     return changes.map((c: EffectChangeData) => {
  //       const c2 = <EffectChangeData>duplicateExtended(c);
  //       // c2.effect = e;
  //       c2.priority = <number>c2.priority ?? c2.mode * 10;
  //       return c2;
  //     });
  //   }, []);
  //   changes.sort((a, b) => <number>a.priority - <number>b.priority);
  //   return changes;
  // }

  static retrieveChangesOrderedByPriorityFromAE(effectEntity: ActiveEffect) {
    // Organize non-disabled effects by their application priority
    const changes = <EffectChangeData[]>[effectEntity].reduce((changes, e: ActiveEffect) => {
      if (e.data.disabled) {
        return changes;
      }
      return changes.concat(
        //@ts-ignore
        (<EffectChangeData[]>e.data.changes).map((c: EffectChangeData) => {
          //@ts-ignore
          const c2 = <EffectChangeData>duplicateExtended(c);
          // c2.effect = e;
          c2.priority = <number>c2.priority ?? c2.mode * 10;
          return c2;
        }),
      );
    }, []);
    changes.sort((a, b) => <number>a.priority - <number>b.priority);
    return changes;
  }

  static prepareOriginForToken(tokenOrTokenId: Token | string): string {
    let token: Token;
    if (typeof tokenOrTokenId === 'string' || tokenOrTokenId instanceof String) {
      const tokens = <Token[]>canvas.tokens?.placeables;
      token = <Token>tokens.find((token) => token.id == <string>tokenOrTokenId);
    } else {
      token = tokenOrTokenId;
    }
    const sceneId = (token?.scene && token.scene.id) || canvas.scene?.id;
    // const origin = `Scene.${sceneId}.Token.${token.id}`;
    const origin = token.actor ? `Actor.${token.actor?.id}` : `Scene.${sceneId}.Token.${token.id}`;
    return origin;
  }

  static prepareOriginForActor(actorOrAcotrId: Actor | string): string {
    let actor: Actor;
    if (typeof actorOrAcotrId === 'string' || actorOrAcotrId instanceof String) {
      actor = <Actor>game.actors?.get(<string>actorOrAcotrId);
    } else {
      actor = actorOrAcotrId;
    }
    const origin = `Actor.${actor.id}`;
    return origin;
  }

  static _createAtlEffectKey(key) {
    let result = key;
    //@ts-ignore
    const version = (game.version ?? game.data.version).charAt(0);

    if (version == '9') {
      switch (key) {
        case 'ATL.preset':
          break;
        case 'ATL.brightSight':
          break;
        case 'ATL.dimSight':
          break;
        case 'ATL.height':
          break;
        case 'ATl.img':
          break;
        case 'ATL.mirrorX':
          break;
        case 'ATL.mirrorY':
          break;
        case 'ATL.rotation':
          break;
        case 'ATL.scale':
          break;
        case 'ATL.width':
          break;
        case 'ATL.dimLight':
          result = 'ATL.light.dim';
          break;
        case 'ATL.brightLight':
          result = 'ATL.light.bright';
          break;
        case 'ATL.lightAnimation':
          result = 'ATL.light.animation';
          break;
        case 'ATL.lightColor':
          result = 'ATL.light.color';
          break;
        case 'ATL.lightAlpha':
          result = 'ATL.light.alpha';
          break;
        case 'ATL.lightAngle':
          result = 'ATL.light.angle';
          break;
      }
    }
    return result;
  }

  static convertToATLEffect(
    //lockRotation: boolean,
    dimSight: number,
    brightSight: number,
    sightAngle: number,
    dimLight: number,
    brightLight: number,
    lightColor: string,
    lightAlpha: number,
    lightAngle: number,

    lightColoration: number | null = null,
    lightLuminosity: number | null = null,
    lightGradual: boolean | null = null,
    lightSaturation: number | null = null,
    lightContrast: number | null = null,
    lightShadows: number | null = null,

    lightAnimationType: string | null,
    lightAnimationSpeed: number | null,
    lightAnimationIntensity: number | null,
    lightAnimationReverse: boolean | null,

    // applyAsAtlEffect = false, // rimosso
    effectName: string | null = null,
    effectIcon: string | null = null,
    duration: number | null = null,

    // vision = false,
    // id: string | null = null,
    // name: string | null = null,
    height: number | null = null,
    width: number | null = null,
    scale: number | null = null,
  ) {
    const atlChanges: any = [];

    if (height && height > 0) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.height'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: height,
      });
    }
    if (width && width > 0) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.width'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: width,
      });
    }
    if (scale && scale > 0) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.scale'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: scale,
      });
    }
    if (dimSight && dimSight > 0) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.dimSight'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: dimSight,
      });
    }
    if (brightSight && brightSight > 0) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.brightSight'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: brightSight,
      });
    }
    if (dimLight && dimLight > 0) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.light.dim'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: dimLight,
      });
    }
    if (brightLight && brightLight > 0) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.light.bright'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: brightLight,
      });
    }
    if (lightAngle) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.light.angle'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: lightAngle,
      });
    }
    if (lightColor) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.light.color'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: lightColor,
      });
    }
    if (lightAlpha) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.light.alpha'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: lightAlpha,
      });
    }
    if (lightAnimationType && lightAnimationSpeed && lightAnimationIntensity && lightAnimationReverse) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.light.animation'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: `{"type": "${lightAnimationType}","speed": ${lightAnimationSpeed},"intensity": ${lightAnimationIntensity}, "reverse":${lightAnimationReverse}}`,
      });
    } else if (lightAnimationType && lightAnimationSpeed && lightAnimationIntensity) {
      atlChanges.push({
        key: EffectSupport._createAtlEffectKey('ATL.light.animation'),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: `{"type": "${lightAnimationType}","speed": ${lightAnimationSpeed},"intensity": ${lightAnimationIntensity}}`,
      });
    }
    const efffectAtlToApply = new Effect({
      // customId: id || <string>token.actor?.id,
      customId: undefined, //<string>token.actor?.id,
      name: <string>effectName,
      description: ``,
      // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
      transfer: true,
      seconds: duration != null ? <number>duration * 60 : undefined, // minutes to seconds
      atlChanges: atlChanges,
    });
    return efffectAtlToApply;
  }
}
