import type { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import type Effect from './effect';

export interface EffectInterfaceApi {
  initialize(moduleName: string): void;

  toggleEffect(
    effectName: string,
    overlay: boolean,
    uuids: string[],
    withSocket?: boolean,
  ): Promise<boolean | undefined>;

  hasEffectApplied(effectName: string, uuid: string, withSocket?: boolean): boolean;

  removeEffect(effectName: string, uuid: string, withSocket?: boolean): Promise<ActiveEffect | undefined>;

  addEffect(
    effectName: string,
    effectData: Effect,
    uuid: string,
    origin: string,
    overlay: boolean,
    metadata: any,
    withSocket?: boolean,
  ): Promise<ActiveEffect | undefined>;

  addEffectWith(
    effectData: Effect,
    uuid: string,
    origin: string,
    overlay: boolean,
    metadata: any,
    withSocket?: boolean,
  ): Promise<ActiveEffect | undefined>;

  // ============================================================
  // Additional feature for retrocompatibility
  // ============================================================

  // ====================================================================
  // ACTOR MANAGEMENT
  // ====================================================================

  hasEffectAppliedOnActor(effectName: string, uuid: string, includeDisabled: boolean, withSocket?: boolean): boolean;

  hasEffectAppliedFromIdOnActor(
    effectId: string,
    uuid: string,
    includeDisabled: boolean,
    withSocket?: boolean,
  ): boolean;

  removeEffectOnActor(effectName: string, uuid: string, withSocket?: boolean): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnActor(effectId: string, uuid: string, withSocket?: boolean): Promise<ActiveEffect | undefined>;

  addEffectOnActor(
    effectName: string,
    uuid: string,
    effect: Effect,
    withSocket?: boolean,
  ): Promise<ActiveEffect | undefined>;

  toggleEffectFromIdOnActor(
    effectId: string,
    uuid: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    withSocket?: boolean,
  ): Promise<boolean | undefined>;

  addActiveEffectOnActor(
    uuid: string,
    activeEffectData: ActiveEffectData,
    withSocket?: boolean,
  ): Promise<ActiveEffect | undefined>;

  findEffectByNameOnActor(effectName: string, uuid: string, withSocket?: boolean): Promise<ActiveEffect | undefined>;

  // ====================================================================
  // TOKEN MANAGEMENT
  // ====================================================================

  hasEffectAppliedOnToken(effectName: string, uuid: string, includeDisabled: boolean, withSocket?: boolean): boolean;

  hasEffectAppliedFromIdOnToken(
    effectId: string,
    uuid: string,
    includeDisabled: boolean,
    withSocket?: boolean,
  ): boolean;

  removeEffectOnToken(effectName: string, uuid: string, withSocket?: boolean): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnToken(effectId: string, uuid: string, withSocket?: boolean): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnTokenMultiple(
    effectIds: string[],
    uuid: string,
    withSocket?: boolean,
  ): Promise<ActiveEffect | undefined>;

  addEffectOnToken(
    effectName: string,
    uuid: string,
    effect: Effect,
    withSocket?: boolean,
  ): Promise<ActiveEffect | undefined>;

  toggleEffectFromIdOnToken(
    effectId: string,
    uuid: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    withSocket?: boolean,
  ): Promise<boolean | undefined>;

  toggleEffectFromDataOnToken(
    effect: Effect,
    uuid: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    withSocket?: boolean,
  ): Promise<boolean | undefined>;

  addActiveEffectOnToken(
    uuid: string,
    activeEffectData: ActiveEffectData,
    withSocket?: boolean,
  ): Promise<ActiveEffect | undefined>;

  findEffectByNameOnToken(effectName: string, uuid: string, withSocket?: boolean): Promise<ActiveEffect | undefined>;

  updateEffectFromIdOnToken(
    effectId: string,
    uuid: string,
    origin: string,
    overlay: boolean,
    effectUpdated: Effect,
    withSocket?: boolean,
  ): Promise<boolean | undefined>;

  updateEffectFromNameOnToken(
    effectName: string,
    uuid: string,
    origin: string,
    overlay: boolean,
    effectUpdated: Effect,
    withSocket?: boolean,
  ): Promise<boolean | undefined>;

  updateActiveEffectFromIdOnToken(
    effectId: string,
    uuid: string,
    origin: string,
    overlay: boolean,
    effectUpdated: ActiveEffectData,
    withSocket?: boolean,
  ): Promise<boolean | undefined>;

  updateActiveEffectFromNameOnToken(
    effectName: string,
    uuid: string,
    origin: string,
    overlay: boolean,
    effectUpdated: ActiveEffectData,
    withSocket?: boolean,
  ): Promise<boolean | undefined>;

  // ==================================================================

  onManageActiveEffectFromEffectId(
    effectActions: {
      create: 'create';
      edit: 'edit';
      delete: 'delete';
      toogle: 'toggle';
      update: 'update';
    },
    owner: Actor | Item,
    effectId: string,
    alwaysDelete?: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    isTemporary?: boolean,
    isDisabled?: boolean,
    withSocket?: boolean,
  ): Promise<Item | ActiveEffect | boolean | undefined>;

  onManageActiveEffectFromEffect(
    effectActions: {
      create: 'create';
      edit: 'edit';
      delete: 'delete';
      toogle: 'toggle';
      update: 'update';
    },
    owner: Actor | Item,
    effect: Effect,
    alwaysDelete?: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    isTemporary?: boolean,
    isDisabled?: boolean,
    withSocket?: boolean,
  ): Promise<Item | ActiveEffect | boolean | undefined>;

  onManageActiveEffectFromActiveEffect(
    effectActions: {
      create: 'create';
      edit: 'edit';
      delete: 'delete';
      toogle: 'toggle';
      update: 'update';
    },
    owner: Actor | Item,
    activeEffect: ActiveEffect | null | undefined,
    alwaysDelete?: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    isTemporary?: boolean,
    isDisabled?: boolean,
    withSocket?: boolean,
  ): Promise<Item | ActiveEffect | boolean | undefined>;
}
