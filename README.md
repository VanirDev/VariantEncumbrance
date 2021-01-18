![](https://img.shields.io/badge/Foundry-v0.7.9-blue) ![](https://img.shields.io/badge/D&D5e-v1.2.2-blue) ![](https://img.shields.io/badge/Sky's%20Alternate%20Character%20Sheet-v1.5.2-red) ![](https://img.shields.io/badge/Tidy5e%20Sheet-v0.4.10-red) ![](https://img.shields.io/badge/Inventory+-v0.3.1-red) ![](https://img.shields.io/badge/DAE-v0.2.34-red)

# Variant Encumbrance

A visual modification to player character sheets to better display the effects of the [Encumbrance variant ruleset in the PHB](https://5thsrd.org/rules/abilities/strength/).
The effects of this module are currently purely visual, although restricting movement and applying the negative effects of encumbrance are intended for a future version.

### Compatability

Version 0.3 has been designed to run with FoundryVTT v0.7.9 and the D&D5e v1.2.2 system. As this module heavily relies on modifying character sheets, it has been built with compatability for the following character sheet modules. Other sheets may work, but have not been tested. Support has now been added for Inventory+ and all of its features.

#### Character Sheets

* D&D5e Default Character Sheet

* [Sky's Alternate 5th Edition Dungeons & Dragons Sheet](https://github.com/Sky-Captain-13/foundry/tree/master/alt5e)
* [Tidy5e Sheet (Both light & dark themes)](https://github.com/sdenec/tidy5e-sheet)

#### Other Modules

* [Inventory +](https://github.com/syl3r86/inventory-plus)
* [Dynamic Active Effects](https://gitlab.com/tposney/dae)

## Update Changelogs

<details>
  <summary>Click to Expand</summary>
  
  ### Update 0.3.2
  
  * Bugfixes for inventory+ support
  * Added support for Dynamic Active Effects

  ### Update 0.3

  * Complete support for the Inventory+ mod
  * Major bugfixes for the effects-based system involving unwanted stacked effects, and permission errors. Major thanks to [Paul Lessing](https://github.com/paullessing) for his contributions here.
  * Support for custom units and speed decreases in the module settings.
  * Improved weight calculation to support active effects that affect the data.attributes.encumbrance.value value.

  ### Update 0.2

  * [Reworked weight reduction to use the new Active Effects system.](#ActiveEffects)
  * Refactored weight calculations to happen on inventory update, instead of only re-calculating weight when opening the character sheet.

  ### Update 0.1.5
  
  * Added weight multiplier for unequipped items
  
  ### Update 0.1.4
  
  * Support for Tidy5e dark theme character sheet
  * [Improved weight calculations to support creature size and powerful build](#sizeAndBuild)
  * [Added flags to support 3rd party module integration](#variantFlags)
</details>

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
    speed: 30,
    tier: 0,
    weight: 21.25
}
```

## Installation

1. Open the "Add-On Modules" tab inside the FoundryVTT setup section.
2. Click "Install Module" and paste this link into the "Manifest URL" box: https://raw.githubusercontent.com/VanirDev/VariantEncumbrance/master/dist/module.json
3. Click "Install", and once the module has finished installing enable the module in "Manage Modules" in the "Game Settings" tab.

## License

This module is licensed using the Creative Commons Attributions International License, any adaptations must provide both credit and indication of changes made.

