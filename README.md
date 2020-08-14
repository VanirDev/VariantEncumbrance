![](https://img.shields.io/badge/Foundry-v0.6.5-blue) ![](https://img.shields.io/badge/D&D5e-v0.94-blue) ![](https://img.shields.io/badge/Sky's%20Alternate%20Character%20Sheet-v1.3.4-red) ![](https://img.shields.io/badge/Tidy5e%20Sheet-v0.2.17-red)

# Variant Encumbrance

A visual modification to player character sheets to better display the effects of the [Encumbrance variant ruleset in the PHB](https://5thsrd.org/rules/abilities/strength/).
The effects of this module are currently purely visual, although restricting movement and applying the negative effects of encumbrance are intended for a future version.

##### Compatability

Version 0.1.1 has been designed to run with FoundryVTT v0.6.5 and the D&D5e v0.94 system. As this module heavily relies on modifying character sheets, it has been built with compatability for the following character sheet modules. Other sheets may work, but have not been tested.

* D&D5e Default Character Sheet

* [Sky's Alternate 5th Edition Dungeons & Dragons Sheet](https://github.com/Sky-Captain-13/foundry/tree/master/alt5e)
* [Tidy5e Sheet](https://github.com/sdenec/tidy5e-sheet)

## Features

#### Redesigned weight bar

![](https://i.imgur.com/jFflnje.png)
![](https://i.imgur.com/xruflPz.png)
![](https://i.imgur.com/Om7hK6o.png)
![](https://i.imgur.com/G5p8KV6.png)

The default character weight bar has received a lick of paint, giving labels for all four weight thresholds. These thresholds are also reconfigurable in the settings, and will update the bar to display the new proportions.

#### Speed Reduction (Optional)

![](https://i.imgur.com/DCfGuUJ.png)

Your encumbrance status is automatically used to provide a modified speed value, taking your default character speed and modifying it by -10 and -20 for encumbered and heavily encumbered, and reducing to 0 when over encumbered.

#### Equipped Item Weight Reduction (Optional)

In the module setting, custom multipliers are available for equipped items, and equipped proficient items. This was mainly added for my house rules, where equipped proficient items get a small weight reduction due to experience handling them.

## Installation

1. Open the "Add-On Modules" tab inside the FoundryVTT setup section.
2. Click "Install Module" and paste this link into the "Manifest URL" box: https://raw.githubusercontent.com/VanirDev/VariantEncumbrance/master/dist/module.json
3. Click "Install", and once the module has finished installing enable the module in "Manage Modules" in the "Game Settings" tab.

## License

This module is licensed using the Creative Commons Attributions International License, any adaptations must provide both credit and indication of changes made.

