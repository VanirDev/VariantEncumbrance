export class VariantEncumbranceItemData {
}
// export class VariantEncumbranceEffectData {
//     multiply: number[];
//     add: number[];
// }
export class EncumbranceData {
}
export var EncumbranceFlags;
(function (EncumbranceFlags) {
    // TIER = 'tier',
    // WEIGHT = 'weight',
    EncumbranceFlags["BURROW"] = "burrow";
    EncumbranceFlags["CLIMB"] = "climb";
    EncumbranceFlags["FLY"] = "fly";
    EncumbranceFlags["SWIM"] = "swim";
    EncumbranceFlags["WALK"] = "walk";
    EncumbranceFlags["DATA"] = "data";
})(EncumbranceFlags || (EncumbranceFlags = {}));
// export class EncumbranceFlagData {
//   tier: number;
//   weight: number;
//   burrow: number;
//   climb: number;
//   fly: number;
//   swim: number;
//   walk: number;
// }
export var EncumbranceMode;
(function (EncumbranceMode) {
    EncumbranceMode["ADD"] = "add";
    EncumbranceMode["DELETE"] = "delete";
    EncumbranceMode["UPDATE"] = "update";
})(EncumbranceMode || (EncumbranceMode = {}));
