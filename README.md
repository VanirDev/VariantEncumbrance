![](https://img.shields.io/badge/Foundry-v0.8.9-blue)
![](https://img.shields.io/badge/D&D5e-v1.3.4-blue) 
![](https://img.shields.io/badge/Sky's%20Alternate%20Character%20Sheet-v1.5.2-red) 
![](https://img.shields.io/badge/Tidy5e%20Sheet-v0.4.10-red) 
![](https://img.shields.io/badge/Inventory+-v0.3.1-red) 
![](https://img.shields.io/badge/DAE-v0.2.34-red)
![](https://img.shields.io/badge/Foundry-v0.8.9-informational)

# Variant Encumbrance

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

#### Character Sheets compatibility

* D&D5e Default Character Sheet

* [Sky's Alternate 5th Edition Dungeons & Dragons Sheet](https://github.com/Sky-Captain-13/foundry/tree/master/alt5e) Seem to work
* [Tidy5e Sheet (Both light & dark themes)](https://github.com/sdenec/tidy5e-sheet) Seem to work
* [Compact DnDBeyond-like 5e Character Sheet](https://github.com/ElfFriend-DnD/foundryvtt-compactBeyond5eSheet) Active effect work, but there is no visual bar , the values of the weight are synchronized with the system core
* [DNDBeyond Character Sheet for 5E](https://github.com/jopeek/fvtt-dndbeyond-character-sheet) Active effect work, but there is no visual bar , the values of the weight are synchronized with the system core

#### Other Modules Compatability

* [Inventory +](https://github.com/syl3r86/inventory-plus)
* [Dynamic Active Effects](https://gitlab.com/tposney/dae)
* [DFreds Convenient Effects](https://github.com/DFreds/dfreds-convenient-effects/) version 1.8.5

## [Update Changelogs](./changelog.md)

<!--
<details>
  <summary>Click to Expand</summary>
</details>
-->

## Features

### Redesigned weight bar

![](https://i.imgur.com/jFflnje.png)
![](https://i.imgur.com/xruflPz.png)
![](https://i.imgur.com/Om7hK6o.png)
![](https://i.imgur.com/G5p8KV6.png)

The default character weight bar has received a lick of paint, giving labels for all four weight thresholds. These thresholds are also reconfigurable in the settings, and will update the bar to display the new proportions.

### Speed Reduction (Optional)

#### Effect-based Speed Reduction (0.2+)

![](https://i.imgur.com/ztcUqfU.png)
<a name="ActiveEffects"/>

#### Old Speed Reduction (Pre 0.1.5)

![](https://i.imgur.com/DCfGuUJ.png)

Your encumbrance status is automatically used to provide a modified speed value, taking your default character speed and modifying it by -10 and -20 for encumbered and heavily encumbered, and reducing to 0 when over encumbered. (For 0.1.5, the speed value must be separated by a space from its units).

### Character Size & Powerful Build (Optional)

<a name="sizeAndBuild"/>

Enabled by default, the module will modify your maximum carry weight according to your character's size, and whether you have the powerful build special trait. This feature can be disabled in the module settings. (Credit to [Eruestani](https://github.com/Eruestani) for implementing this).

### Item Weight Multipliers (Optional)

In the module settings, custom multipliers are available for unequipped, equipped, and proficiently equipped items. This was mainly added for my house rules, where equipped proficient items get a small weight reduction due to experience handling them, but this lends some flexibility to the system for anyone to use.

### Variant Encumbrance Flag

<a name="variantFlags"/>

Should you wish to integrate some of Variant Encumbrance's calculations into your own modules, there is now a flag which stores the actor's encumbrance tier, weight, and modified speed. Encumbrance tier is presented as 0, 1, 2, 3, as Unencumbered, Encumbered, Heavily Encumbered, Over Encumbered, respectively.

```javascript
VariantEncumbrance:
{
  burrow: 0,
  climb: 0,
  fly: 0,
  swim: 0,
  walk: 30,
  tier: 0,
  weight: 21.25
}
```

## License

This module is licensed using the MIT License, any adaptations must provide both credit and indication of changes made.

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

## Acknowledgements

Bootstrapped with League of Extraordinary FoundryVTT Developers  [foundry-vtt-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-types).

Mad props to the 'League of Extraordinary FoundryVTT Developers' community which helped me figure out a lot.
