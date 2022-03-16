export class VariantEncumbranceItemData {
  _id: string;
  weight: number;
  quantity: number;
  totalWeight: number;
  proficient: boolean;
  equipped: boolean;
  type: string;
  // invPlusCategoryId: string;
  flags: any;
  itemCollectionWeightless: boolean;
}

// export class VariantEncumbranceEffectData {
//     multiply: number[];
//     add: number[];
// }

export class EncumbranceDnd5e {
  value: number;
  max: number;
  pct: number;
  encumbered?: boolean; //Vehicle not have this
}

export class EncumbranceData {
  totalWeight: number;
  totalWeightToDisplay: number;
  lightMax: number;
  mediumMax: number;
  heavyMax: number;
  // totalMax:number;
  encumbranceTier: number;
  speedDecrease: number;
  unit: string;
}

export class EncumbranceBulkData {
  totalWeight: number;
  totalWeightToDisplay: number;
  lightMax: number;
  mediumMax: number;
  heavyMax: number;
  // totalMax:number;
  encumbranceTier: number;
  speedDecrease: number;
  unit: string;
}

export enum EncumbranceFlags {
  // TIER = 'tier',
  // WEIGHT = 'weight',
  BURROW = 'burrow',
  CLIMB = 'climb',
  FLY = 'fly',
  SWIM = 'swim',
  WALK = 'walk',
  DATA = 'data',
  ENABLED_AE = 'enabledae',
  ENABLED_WE = 'enabledwe',
  // UNIT = 'unit',
  // System bulk
  BULK = 'bulk',
  ENABLED_AE_BULK = 'enabledaebulk',
  ENABLED_WE_BULK = 'enabledwebulk',
}

// export class EncumbranceFlagData {
//   tier: number;
//   weight: number;
//   burrow: number;
//   climb: number;
//   fly: number;
//   swim: number;
//   walk: number;
// }

export enum EncumbranceMode {
  ADD = 'add',
  DELETE = 'delete',
  UPDATE = 'update',
}

export enum EncumbranceActorType {
  CHARACTER = 'character', // Player Character
  NPC = 'NPC', // Non-Player Character
  VEHICLE = 'vehicle', // Vehicle
}

export const ENCUMBRANCE_TIERS = {
  NONE: 0,
  LIGHT: 1,
  HEAVY: 2,
  MAX: 3,
};
