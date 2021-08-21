export class VariantEncumbranceItemData {
  _id: string;
  weight: number;
  quantity: number;
  totalWeight: number;
  proficient: boolean;
  equipped: boolean;
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
