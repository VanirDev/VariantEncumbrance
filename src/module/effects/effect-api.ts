import type { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import type Effect from './effect';
import type { EffectInterfaceApi } from './effect-interface-api';

export interface ActiveEffectManagerLibApi {
  effectInterface: EffectInterfaceApi;

  get _defaultStatusEffectNames();

  get statusEffectNames(): string[];

  addStatusEffect(name: string): Promise<void>;

  removeStatusEffect(name: string): Promise<void>;

  resetStatusEffects(): Promise<void>;

  isStatusEffect(name: string): Promise<void>;

  // ======================
  // Effect Management
  // ======================

  removeEffectArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  toggleEffectArr(...inAttributes: any[]): Promise<boolean | undefined>;

  addEffectArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  hasEffectAppliedArr(...inAttributes: any[]): Promise<boolean>;

  hasEffectAppliedOnActorArr(...inAttributes: any[]): Promise<boolean>;

  hasEffectAppliedFromIdOnActorArr(...inAttributes: any[]): Promise<boolean>;

  addEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  removeEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  toggleEffectFromIdOnActorArr(...inAttributes: any[]): Promise<boolean | undefined>;

  findEffectByNameOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  hasEffectAppliedOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

  hasEffectAppliedFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

  addEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  removeEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnTokenMultipleArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  toggleEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

  toggleEffectFromDataOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

  findEffectByNameOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  addActiveEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

  updateEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

  updateEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

  updateActiveEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

  updateActiveEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

  onManageActiveEffectFromEffectIdArr(...inAttributes: any[]): Promise<Item | ActiveEffect | boolean | undefined>;

  onManageActiveEffectFromEffectArr(...inAttributes: any[]): Promise<Item | ActiveEffect | boolean | undefined>;

  onManageActiveEffectFromActiveEffectArr(...inAttributes: any[]): Promise<Item | ActiveEffect | boolean | undefined>;

  // ======================
  // Effect Actor Management
  // ======================

  addEffectOnActor(
    actorId: string,
    effectName: string,
    effect: Effect,
  ): Promise<Item | ActiveEffect | boolean | undefined>;

  findEffectByNameOnActor(actorId: string, effectName: string): Promise<ActiveEffect | undefined>;

  hasEffectAppliedOnActor(actorId: string, effectName: string, includeDisabled: boolean): Promise<boolean | undefined>;

  hasEffectAppliedFromIdOnActor(
    actorId: string,
    effectId: string,
    includeDisabled: boolean,
  ): Promise<boolean | undefined>;

  toggleEffectFromIdOnActor(
    actorId: string,
    effectId: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ): Promise<boolean | undefined>;

  addActiveEffectOnActor(actorId: string, activeEffectData: ActiveEffectData): Promise<ActiveEffect | undefined>;

  removeEffectOnActor(actorId: string, effectName: string): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnActor(actorId: string, effectId: string): Promise<ActiveEffect | undefined>;

  // ======================
  // Effect Token Management
  // ======================

  addEffectOnToken(tokenId: string, effectName: string, effect: Effect): Promise<ActiveEffect | undefined>;

  findEffectByNameOnToken(tokenId: string, effectName: string): Promise<ActiveEffect | undefined>;

  hasEffectAppliedOnToken(tokenId: string, effectName: string, includeDisabled: boolean): Promise<boolean | undefined>;

  hasEffectAppliedFromIdOnToken(
    tokenId: string,
    effectId: string,
    includeDisabled: boolean,
  ): Promise<boolean | undefined>;

  toggleEffectFromIdOnToken(
    tokenId: string,
    effectId: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ): Promise<boolean | undefined>;

  toggleEffectFromDataOnToken(
    tokenId: string,
    effect: Effect,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ): Promise<boolean | undefined>;

  addActiveEffectOnToken(tokenId: string, activeEffectData: ActiveEffectData): Promise<ActiveEffect | undefined>;

  removeEffectOnToken(tokenId: string, effectName: string): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnToken(tokenId: string, effectId: string): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnTokenMultiple(tokenId: string, effectIds: string[]): Promise<ActiveEffect | undefined>;

  updateEffectFromIdOnToken(
    tokenId: string,
    effectId: string,
    origin: string,
    overlay: boolean,
    effectUpdated: Effect,
  ): Promise<boolean | undefined>;

  updateEffectFromNameOnToken(
    tokenId: string,
    effectName: string,
    origin: string,
    overlay: boolean,
    effectUpdated: Effect,
  ): Promise<boolean | undefined>;

  updateActiveEffectFromIdOnToken(
    tokenId: string,
    effectId: string,
    origin: string,
    overlay: boolean,
    effectUpdated: ActiveEffectData,
  ): Promise<boolean | undefined>;

  updateActiveEffectFromNameOnToken(
    tokenId: string,
    effectName: string,
    origin: string,
    overlay: boolean,
    effectUpdated: ActiveEffectData,
  ): Promise<boolean | undefined>;

  // ======================
  // Effect Generic Management
  // ======================

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
  ): Promise<Item | ActiveEffect | boolean | undefined>;
}
