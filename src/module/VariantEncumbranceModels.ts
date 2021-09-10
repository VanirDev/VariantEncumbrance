export class VariantEncumbranceItemData {
  _id: string;
  weight: number;
  quantity: number;
  totalWeight: number;
  proficient: boolean;
  equipped: boolean;
  type: string;
  invPlusCategoryId: string;
  flags: any;
}

// export class VariantEncumbranceEffectData {
//     multiply: number[];
//     add: number[];
// }

export class EncumbranceData {
  totalWeight: number;
  lightMax: number;
  mediumMax: number;
  heavyMax: number;
  encumbranceTier: number;
  speedDecrease: number;
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
