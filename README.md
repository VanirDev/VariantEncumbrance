# Variant Encumbrance

![Latest Release Download Count](https://img.shields.io/github/downloads/VanirDev/VariantEncumbrance/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fvariant-encumbrance-dnd5e&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=variant-encumbrance-dnd5e) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FVanirDev%2FVariantEncumbrance%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge)

![](https://img.shields.io/badge/D&D5e-v1.3.4-blue) 
![](https://img.shields.io/badge/Sky's%20Alternate%20Character%20Sheet-v1.5.2-red) 
![](https://img.shields.io/badge/Tidy5e%20Sheet-v0.4.10-red) 
![](https://img.shields.io/badge/Inventory+-v0.3.1-red) 
![](https://img.shields.io/badge/DAE-v0.2.34-red)
![](https://img.shields.io/badge/Foundry-v0.8.9-informational)

A visual modification to player character sheets to better display the effects of the [Encumbrance variant ruleset in the PHB](https://5thsrd.org/rules/abilities/strength/).
The effects of this module are currently purely visual, although restricting movement and applying the negative effects of encumbrance are intended for a future version.

For D&D5e 1.4.2 and newer the system supports a core implementation of this encumbrance rule. The module should be synchronized with the core functionality, but this module will permit more customised rules for your weight calculations/thresholds and the speed penalties are integrated with active effect.

## NOTE: If you are a javascript developer and not a typescript developer, you can just use the javascript files under the dist folder

## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:

`https://raw.githubusercontent.com/VanirDev/VariantEncumbrance/master/src/module.json`

4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

### libWrapper

This module uses the [libWrapper](https://github.com/ruipin/fvtt-lib-wrapper) library for wrapping core methods. It is a hard dependency and it is recommended for the best experience and compatibility with other modules.

### midi-qol

This module uses the [midi-qol](https://gitlab.com/tposney/midi-qol/-/tree/master). It is a optional dependency but it is recommended for the best experience and compatibility with other modules.

**NOTE: If "midiqol" is deactivated or not present, the active effects will apply only the speed reduction without the variations of advantage and disadvantage typical of the rule**

## Known Issue

- Due to the million variations of the various use cases that I have to take into account the most attentive players may notice a slowdown which is logical if you think I have to redo the checks and refresh the flags every time it is inserted, updated, deleted, revised , edited an object with weight. You need someone more Expert than me to handle this, but i still think to have done a good job with the handling of the use cases.
- Limitation on some character sheet, open a issue and i'll try to make a fix.
- Is not full synchronized with DAE in favor of the standard active effects mechanism. but you can still use dae on the active effect.
- I have not found the time to fully test for the vehicle sheet so any feedback is more than welcome, seem to work anyway

## Character Sheets compatibility

* D&D5e Default Character Sheet

* [Sky's Alternate 5th Edition Dungeons & Dragons Sheet](https://github.com/Sky-Captain-13/foundry/tree/master/alt5e) Seem to work
* [Tidy5e Sheet (Both light & dark themes)](https://github.com/sdenec/tidy5e-sheet) Seem to work
* [Compact DnDBeyond-like 5e Character Sheet](https://github.com/ElfFriend-DnD/foundryvtt-compactBeyond5eSheet) Active effect work, but there is no visual bar , the values of the weight are synchronized with the system core
* [DNDBeyond Character Sheet for 5E](https://github.com/jopeek/fvtt-dndbeyond-character-sheet) Active effect work, but there is no visual bar , the values of the weight are synchronized with the system core

## Other Modules Compatability

* [Inventory +](https://github.com/syl3r86/inventory-plus) version 0.3.5
* [Dynamic Active Effects](https://gitlab.com/tposney/dae)
* [DFreds Convenient Effects](https://github.com/DFreds/dfreds-convenient-effects/) version 1.8.5
* [Item Collection/Item Containers](https://foundryvtt.com/packages/itemcollection) version 1.8.13

### I highly recommend avoiding module Inventory Plus in favor of the module [Item Collection/Item Containers](https://foundryvtt.com/packages/itemcollection)

### Verified issues with some sheet for [Inventory +](https://github.com/syl3r86/inventory-plus) version 0.3.5, until is not updated i highly recommend to avoiding the use of this module.

<!--
<details>
  <summary>Click to Expand</summary>
</details>
-->

## Features

### Redesigned weight bar

![green](./wiki/green.png)
![orange](./wiki/orange.png)
![red](./wiki/red.png)
![yellowblack](./wiki/yellowblack.png)

The default character weight bar has received a lick of paint, giving labels for all four weight thresholds. These thresholds are also reconfigurable in the settings, and will update the bar to display the new proportions.

#### Effect-based Speed Reduction with Active Effects

![ae](./wiki/ae.png)

![ae2](./wiki/ae2.png)

Your encumbrance status is automatically used to provide a modified speed value, taking your default character speed and modifying it by -10 and -20 for encumbered and heavily encumbered, and reducing to 0 when over encumbered. (For 0.1.5, the speed value must be separated by a space from its units).

### Character Size & Powerful Build (Optional)

Enabled by default, the module will modify your maximum carry weight according to your character's size, and whether you have the powerful build special trait. This feature can be disabled in the module settings. (Credit to [Eruestani](https://github.com/Eruestani) for implementing this).

### Item Weight Multipliers (Optional)

In the module settings, custom multipliers are available for unequipped, equipped, and proficiently equipped items. This was mainly added for my house rules, where equipped proficient items get a small weight reduction due to experience handling them, but this lends some flexibility to the system for anyone to use.

### Buttons header sheet for enable/disable the features (Weight Claculation and Active Effects) actor by actor

Add new buttons on the header sheet of the actors for choose when to avoid to add the Active Effect or weight calculation. To much bad feed back on the automatization of the AE, i hope  with this to help the community to find the best soltuion for the single individual

| Symbol Button Header Sheet  | Description  |
|:----:|:----:|
|![weight-hanging-solid](./wiki/weight-hanging-solid.svg) | If you want to have the Varian Encumbrance Active Effects and Weight calculation features on your actor make sure to have the "weight" symbol on the header sheet (this is the default) |
|![balance-scale-right-solid](./wiki/balance-scale-right-solid.svg)| If you don't  want to have the Varian Encumbrance Active Effects feature on your actor make sure to have the "balance" symbol on the header sheet. ATTENTION the weight calculation feature is still active|
|![feather-solid](./wiki/feather-solid.svg)| If you don't  want to have the Varian Encumbrance Active Effects and Weight calculation features on your actor make sure to have the "feather" symbol on the header sheet. *The weight is not calculated anymore and remain frozen (unless the setting 'Use standard calculation weight of the dnd5e system' is set to true in that case the weight calculation rollback to the standard weight calculation of the system dnd5e)* |

Some preview:

![img1](./wiki/feature_header_weight_label_2.png)

![img2](./wiki/feature_header_weight_nolabel_2.png)

![img3](./wiki/feature_header_noae_label_2.png)

![img4](./wiki/feature_header_noae_nolabel_2.png)

![img5](./wiki/feature_header_light_label_2.png)

![img6](./wiki/feature_header_light_nolabel_2.png)


### Variant Encumbrance Flag

Should you wish to integrate some of Variant Encumbrance's calculations into your own modules, there is now a flag which stores the actor's encumbrance tier, weight, and modified speed. Encumbrance tier is presented as 0, 1, 2, 3, as Unencumbered, Encumbered, Heavily Encumbered, Over Encumbered, respectively.

```javascript
variant-encumbrance-dnd5e:
{
  burrow: 0,
  climb: 0,
  fly: 0,
  swim: 0,
  walk: 30,
  data: {
    totalWeight: 0,
    lightMax: 50,
    mediumMax: 100,
    heavyMax: 150,
    encumbranceTier: 0,
    speedDecrease: 0,
    unit 'lbs'
  },
  enabledae: true,
  enabledwe: true
}
```

# Settings

- **Unencumbered Strength Multiplier:** Multiplier used to calculate maximum carrying weight before being encumbered from the strength ability score.",

- **Unencumbered Strength Multiplier (Metric System):** Multiplier used to calculate maximum carrying weight before being encumbered from the strength ability score (Metric System).",

- **Encumbered Strength Multiplier:** Multiplier used to calculate maximum carrying weight before being heavily encumbered from the strength ability score.",

- **Encumbered Strength Multiplier (Metric System):** Multiplier used to calculate maximum carrying weight before being heavily encumbered from the strength ability score (Metric System).",

- **Heavily Encumbered (old Strength Multiplier):** Multiplier used to calculate maximum carrying weight from the strength ability score.",

- **Heavily Encumbered (old Strength Multiplier) (Metric System):** Multiplier used to calculate maximum carrying weight from the strength ability score (Metric System).",

- **Enable or disable the strength multiplier feature**: Enable or disable the strength multiplier feature.

- **Strength Multiplier:** Work only with strength multiplier feature enabled. Multiplier used to calculate maximum carrying weight from the strength ability score.",

- **Strength Multiplier (Metric System):** Multiplier used to calculate maximum carrying weight from the strength ability score (Metric System).",

- **Variant Encumbrance Speed Penalties:** Enable automatic speed penalties from carry weight.",

- **Unequipped Item Weight Multiplier:** Multiplier for items when not equipped.",

- **Equipped Item Weight Multiplier:** Multiplier for items when equipped, can be used to reduce effective weight for armour and weapons.",

- **Proficient Equipped Item Weight Multiplier:** Multiplier for proficient items when equipped, can be used to reduce effective weight for armour and weapons.",

- **Currency Per Weight Unit:** Define the number of coins required to equal 1 unit of weight.",

- **Currency Per Weight Unit (Metric System):** Define the number of coins required to equal 1 unit of weight (Metric System).",

- **Vehicle weights Weight Multiplier, lbs in an imperial ton:** Vehicle weights are an order of magnitude greater, Multiplier for vehicles.",

- **Vehicle weights Weight Multiplier, kg in a metric ton (Metric System):** Vehicle weights are an order of magnitude greater, Multiplier for vehicles (Metric System).",

- **Variant Encumbrance Size Modifiers:** Enable multipliers from creature size.",

- **Weight Units:** Units displayed in the encumbrance bar (just graphics).",

- **Weight Units (Metric System):** Units displayed in the encumbrance bar (just graphics) (Metric System).",

- **Lightly Encumbered Speed Decrease:** The number of speed units subtracted when lightly encumbered, default is 10.",

- **Encumbered Speed Decrease:** The number of speed units subtracted when heavily encumbered, default is 20.",

- **Enable pre check encumbrance tier:** I DON'T RECCOMENDED it, but does anyone seem to use this strange rule? If true the add/remove of the AE is launched only when there is a change on the value level of the tier so the refresh is ignored when add/remove/update item",

- **Enable/Disable the feature for applying the variant encumbrance active effects for specific actor:** If true add on the header sheet of the actor a button visible only to GM for enable/disable the active effects feature, by default the feature is disabled (the flag is false) for performance issues",

- **Remove label from buttons on the header character sheet:** Remove label from buttons on the header character sheet, Useful for little screen and mobile, by default is true",

- **Use standard calculation weight of the dnd5e system:** I DON'T RECCOMENDED it, but some people seem to lose their mind for 2s instead of 1s on the calculation weight ???, you will lose all the benefit from the others feature like Equipped, Unequipped, Proficient Equipped, Inventory +, Item container, ecc., but hey !! you got the 1 sec you miss..",

- **Use equipped/unequipped feature of the ItemCollection/Item Container module for the backpack**: I DON'T RECCOMENDED it, the weight calculation not 'make sense' anymore you must remember to many things, but you can now choose. Bags can be unequipped by players or GM, so that their reported weight drops to 0 in your inventory (only bags with a capacity other than 0 can be unequipped)

# Build

## Install all packages

```bash
npm install
```
## npm build scripts

### build

will build the code and copy all necessary assets into the dist folder and make a symlink to install the result into your foundry data; create a
`foundryconfig.json` file with your Foundry Data path.

```json
{
  "dataPath": "~/.local/share/FoundryVTT/"
}
```

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run-script build
```

### NOTE:

You don't need to build the `foundryconfig.json` file you can just copy the content of the `dist` folder on the module folder under `modules` of Foundry

### build:watch

`build:watch` will build and watch for changes, rebuilding automatically.

```bash
npm run-script build:watch
```

### clean

`clean` will remove all contents in the dist folder (but keeps the link from build:install).

```bash
npm run-script clean
```
### lint and lintfix

`lint` launch the eslint process based on the configuration [here](./.eslintrc)

```bash
npm run-script lint
```

`lintfix` launch the eslint process with the fix argument

```bash
npm run-script lintfix
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

### package

`package` generates a zip file containing the contents of the dist folder generated previously with the `build` command. Useful for those who want to manually load the module or want to create their own release

```bash
npm run-script package
```

## [Changelog](./changelog.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/VanirDev/VariantEncumbrance/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

This package is under an [MIT license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Acknowledgements

Bootstrapped with League of Extraordinary FoundryVTT Developers  [foundry-vtt-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-types).

Mad props to the 'League of Extraordinary FoundryVTT Developers' community which helped me figure out a lot.
