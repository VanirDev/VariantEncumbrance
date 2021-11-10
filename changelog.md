### Update 0.6.5

- Bug fix "wrong" check for the weight value of the encumbrance tier (ty to gambet)
- try to fix the bug [Variant Encumbrance module issues](https://www.reddit.com/r/FoundryVTT/comments/qpyuv6/variant_encumbrance_module_issues/)
- Add new checks for remove Active Effects for strange feedback from the users
- Add new buttons on the header sheet of the actor for choose when to avoid to add the Active Effect
- Added a feature solution for [Provide alternative weight trigger method](https://github.com/VanirDev/VariantEncumbrance/issues/49)
- Update readme.md and wiki
-  try to fix a possible incompatibility/bug with module [Illandril's Inventory Sorter (5e)](https://github.com/illandril/FoundryVTT-inventory-sorter) (ty to gambet)

### Update 0.6.4 [BREAKING CHANGES]

- Clean up of the code
- Write a new and better workflow for calculate the weight
- Try to fix again (Bug fix [[BUG] Item Containers weight calculation with backpacks becomes reverse of intended](https://github.com/VanirDev/VariantEncumbrance/issues/47)) 

### Update 0.6.3

- Add custom currency weight calculation to the items of the item container backpack
- Try to fix again (Bug fix [[BUG] Item Containers weight calculation with backpacks becomes reverse of intended](https://github.com/VanirDev/VariantEncumbrance/issues/47))

### Update 0.6.2

- Bug fix wrong addition of active effect during the load of the world
- Add isConvinient flag to all the active effects for use the new midi qol integration

### Update 0.6.1

- Solve module incompatibility with [Item Collection/Item Containers](https://foundryvtt.com/packages/itemcollection)
- Bug fix [[BUG] Item Containers weight calculation with backpacks becomes reverse of intended](https://github.com/VanirDev/VariantEncumbrance/issues/47)

### Update 0.6.0

- Some bug fix and performance

### Update 0.5.28

- Remove await from add and remove Effect function for avoid some socket exception
- Add i18 internazionalization

### Update 0.5.22-27

- Big, Very Big Bug fix and many module collision
- Bug fix active effects add in loop during the initialization
- Better checker for remove and addition of Active Effects
- Remove await from remove Effect function
### Update 0.5.21

- Added integration for Vehicle
- Try to fix again [Inherent weight miscalculation in Inventory + module](https://github.com/VanirDev/VariantEncumbrance/issues/43)
- Revert bug fix for the drag and drop use case

### Update 0.5.20

- Add github workflow for generation with new release on github
- Try to fix again [Inherent weight miscalculation in Inventory + module](https://github.com/VanirDev/VariantEncumbrance/issues/43)
- Refactor the code and add some clean on the code
- Remove the dist

### Update 0.5.19

- Bug fix [Inherent weight miscalculation in Inventory + module](https://github.com/VanirDev/VariantEncumbrance/issues/43)
- Bug fix [Module eliminates calculation of coin weight](https://github.com/VanirDev/VariantEncumbrance/issues/44)

### Update 0.5.18

- Try to solve again [compatibility with Inventory + mod](https://github.com/VanirDev/VariantEncumbrance/issues/42)

### Update 0.5.17

- Add additional check for the property flags for use case with inventory plus

### Update 0.5.16

- Small fixes for avoid warning

### Update 0.5.15

- Little bug fix for inventory plus flags not present

### Update 0.5.14

- Finally solved [compatibility with Inventory + mod](https://github.com/VanirDev/VariantEncumbrance/issues/42)

### Update 0.5.13

- Bug fix add hook for intercept create of module inventory+
- 
### Update 0.5.12

- Bug fix add hook for intercept update of module inventory+

### Update 0.5.11 Gambet performance

- Some performance on the code
- Update the flags (remove redundant info)
- bug fix any time you equip an item, it seems to flash the whole inventory list
- bug fix weight is undefined for some strange use case
- bug fix solved "Nan/Nan" for item with weight undefined
- big bug fix on active effect been removed (stupid,stupid,stupid)

### Update 0.5.10

- Bug fix , when update the strentgh of the character the value of the weight carried doesn't update right away

### Update 0.5.9 I'm so Soorrry

- Bug fix when try to delete a item

### Update 0.5.8 I'm Soorrry

- Bunch of bug fix (ty gambet)
- Clean up some code
- Little performance

### Update 0.5.7

- Bug fix for remove effect before the item is check twice for a strange use case

### Update 0.5.6

- Bug fix DnD beyond Character sheet

### Update 0.5.5

- Some other bug fixing

### Update 0.5.4

- Many, Many Bug fixing and use case

### Update 0.5.3

- Bug fix on the new module id

### Update 0.5.2

- Bug fix module.json

### Update 0.5.1

- Add check for dndbeyond character sheet

### Update 0.5.0

- change module if from "VariantEncumbrance" to "variant-encumbrance-dnd5e" for future management of foundry
- partial integration for character sheet "compact-beyond-5e-sheet"

### Update 0.4.6

- Add check for "feat" and "spell" type for a more performance update of the sheet

### Update 0.4.5

- Revert url repository form p4535992 to VanirDev and fix the module.json
### Update 0.4.4

- Some minor bug fix,
- Applied prettier

### Update 0.4.3

- Bug fix make sure to remove active effect if you rename the active effect
### Update 0.4.2

- Add more i18n support

### Update 0.4.1

- BUg fixing euiped and unequiped listener

### Update 0.4.0

- Bug fix compatibility with inventory + module
- Bug fix unequipped mutliplier set 0 still get weight and broke encumbrance calculation

### Update 0.3.9

- Stupid , Stupid bug
- Clean up code
- Add check for active effect present when ecumerance leevel not change

### Update 0.3.8

- Add implementation with the core foundry 0.8.8 and D&D5e 1.4.2 for encumbrance rule

### Update 0.3.7

- Many bug fix and updates
- Finally integration with Active effects for encumbrance
  
### Update 0.3.6

- Many bug fix and updates

### Update 0.3.5

- Converted to typescript (because i iike it better than javascript) and some bug fix
  
### Update 0.3.4

* Update for 0.8.8
* Add internazionalization
* Add fix from [hmqgg fork](https://github.com/hmqgg/VariantEncumbrance/commit/27004558654bbd28eeb419c35d8f88093fbb7605)
* Add optional use of the module midi (if the module is installed or not) request from tgp (unkwnon discord name)
* Minor bug fix
  
### Update 0.3.3
  
* Bugfixes for foundryvtt 0.8.6
* Setup npm for better build the project in the future
  
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
