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

export class EncumbranceBulkData extends EncumbranceData{
  inventorySlot: number;
  minimumBulk: number;
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

export enum ENCUMBRANCE_TIERS {
  NONE = 0,
  LIGHT = 1,
  HEAVY = 2,
  MAX =  3
};

export const BULK_CATEGORY = {
  // Smaller than the palm of your hand. You can hold many of these in one hand. A negligible or trivial weight.
  TINY: <BulkData>{ category:'Tiny', bulk:0.2, size:'Tiny', weight:'Negligible', description: 'variant-encumbrance-dnd5e.label.bulk.category.tiny.description'},
  // Up to a handspan / 9 inches. Can be held comfortably with one hand. Up to 2 lbs. The weight of a loaf of bread or a bag of sugar.
  SMALL: <BulkData>{ category:'Small', bulk:1, size:'Short', weight:'Light', description: 'variant-encumbrance-dnd5e.label.bulk.category.small.description'},
  // Up to an arms-length / 2 feet long. Can be held with one hand. Up to 5 lbs. About as heavy as a few big bags of sugar.
  MEDIUM: <BulkData>{ category:'Medium', bulk:2, size:'Medium', weight:'Medium', description: 'variant-encumbrance-dnd5e.label.bulk.category.medium.description'},
  // Longer than an arm. Usually can be held with one hand, but us most comfortable with two. Up to 10 lbs. About as heavy as a cat or a sack of potatoes.
  LARGE: <BulkData>{ category:'Large', bulk:3, size:'Long', weight:'Heavy', description: 'variant-encumbrance-dnd5e.label.bulk.category.large.description'},
  // Longer than the height of an average person. Requires two hands to hold. Up to 35 lbs. About a quarter of the weight of an average person.
  X_LARGE: <BulkData>{ category:'X-Large', bulk:6, size:'Extra-long', weight:'Extra-heavy', description: 'variant-encumbrance-dnd5e.label.bulk.category.x-large.description'},
  // Longer than the height of two people. Requires two hands to hold. Up to 70 lbs. About half as heavy as an average person.
  XX_LARGE: <BulkData>{ category:'XX-Large', bulk:9, size:'Extensive', weight:'Leaden', description: 'variant-encumbrance-dnd5e.label.bulk.category.xx-large.description'},
}

export const BULK_CATEGORIES =  [ BULK_CATEGORY.TINY, BULK_CATEGORY.SMALL, BULK_CATEGORY.MEDIUM, BULK_CATEGORY.LARGE, BULK_CATEGORY.X_LARGE, BULK_CATEGORY.XX_LARGE ];

export class BulkData{
  category:string;
  bulk: number;
  size: string;
  weight: string;
  description: string;
}
