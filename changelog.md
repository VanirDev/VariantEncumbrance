### 0.9.9-10

- Better integration with inventory-plus
- Add new homebrew rule feature: Do Not increase weight by quantity for no ammunition item

### 0.9.8

- Add the none on the bulk data

### 0.9.7

- Add API Method calculateBulkOnActorWithItems

### 0.9.6

- Add API Method calculateWeightOnActorWithItems

### 0.9.5

- Add on apiithe method 'convertLbToBulk'
- Bugg fix with inventory plus integration

### 0.9.4

- Better model data for recover encumbranc einformation in other modules (for the integration with inventory plus)
### 0.9.3

- Add some API method for retrieve the weight with all the filters applied

### 0.9.2

- Some bug fix for bulk system

### 0.9.1

- Little html and css fix

### 0.9.0

- BIG UPDATE: Clean up everything and integration with the long waited system bulk variant for dnd5e

### 0.8.5

- Avoid reset of the socket handler

### 0.8.4 [BREAKING CHANGE]

- Big update of the manager effect
- Bug fix for the metric system: Add support for metric ssystem on active effect (convert 10ft to 3mt and 20 ft to 6 mt)
- Bug fix for the metric system: Add module setting 'lightWeightDecreaseMetric'
- Bug fix for the metric system: Add module settings 'heavyWeightDecreaseMetric'

### 0.8.3

- Bug fix for the metric system: fail to calculate with modules setting 'enable Varian Encumbrance Weight On Actor Flag'
- Bug fix for the metric system: Replace standard metric weight steps from 2.3/4.5/6.8 to 2.5/5/7.5 

### 0.8.2

- Add new Feature: Fake the metric system calculation, but we using the imperial one under the hood
- Add new module setting 'Fake the metric system calculation, but we using the imperial one'

### 0.8.1

- Some small bug fix

### 0.8.0 [BREAKING CHANGES]

- Update typescript
- Abbandoned 0.8.X developing
- Update design pattern of the project and integration with socketlib
- Update effect handler
- Bug fix overburdened not applied
- Remove check of dae because DAE has some strange bug ??? (to ask to tim posney about it )
- Update the labels and module settings

### 0.7.8

- bug fix [Encumbrance movement penalty is doubled when DAE is enabled](https://github.com/VanirDev/VariantEncumbrance/issues/59)

### 0.7.7

- Bug fix 
- Remove dynamic effects for longstrider and encumbrance movement

### 0.7.6

- Add check for verify if at least a gm is connected

### 0.7.5

- Ad more check for sokcet when using the popout module for fix [[BUG] Throwing Errors When Used with Pop Out and Item Containers](https://github.com/VanirDev/VariantEncumbrance/issues/56)
- Fix a error on the workflow avoid to return null seem to stop the weight calculation

### 0.7.4

- Add some check for fix [[BUG] Throwing Errors When Used with Pop Out and Item Containers](https://github.com/VanirDev/VariantEncumbrance/issues/56) and [[BUG] Additional Error When Used with Pop Out and Item Containers](https://github.com/VanirDev/VariantEncumbrance/issues/57)

### 0.7.3

- Add `item.flags` to the checking for the inventory + module during the weight calculation, from the issue [Inherent weight miscalculation in Inventory + module](https://github.com/VanirDev/VariantEncumbrance/issues/43), very special ty to @aprusik for pointed that out.

### 0.7.2

- Clean up and update typescript

### 0.7.1

- Update README table of settings
- Rename label 'useVarianEncumbranceWithSpecificActorType' to 'useVarianEncumbranceWithSpecificType'
- change configuration 'useVarianEncumbranceWithSpecificType' from false to true

### Update 0.7.0

- Add new effect-handler, preparation to foundryvtt 9

### Update 0.6.14

- Add [CHANGELOGS & CONFLICTS](https://github.com/theripper93/libChangelogs) hooks for better management of the conflicts

### Update 0.6.13

- Little performance add check if sheet is rendered avoid to recalculate for compatibility with others modules

### Update 0.6.12

- Add try catch for module compatibility on the mergeObject method during the update of a item

### Update 0.6.11

- Just add color to the header sheet button inspired from [Actor Link Indicator for Foundry VTT](https://github.com/saif-ellafi/foundryvtt-actor-link-indicator)

### Update 0.6.10

- change the default value of setting 'useStrengthMultiplier' to 'false' for bad feedback on the feature
- Bug fix [Max weight values now many times larger than they should be](https://github.com/VanirDev/VariantEncumbrance/issues/54)

### Update 0.6.9

- Better integration with [Inventory +](https://github.com/syl3r86/inventory-plus)
- Add a module settings for the integration with the equipped/unequipped feature of the [Item Collection/Item Containers](https://foundryvtt.com/packages/itemcollection) module
- Bug fix straneg behavior on the hook render actor need a mrge object for set up the correct values of the flags
- Integration with [DragonFlagon Quality of Life, Vehicle Cargo Capacity Unit Feature](https://github.com/flamewave000/dragonflagon-fvtt/blob/master/df-qol/README.md#vehicle-cargo-capacity-unit)
- Add new settings 'useStrengthMultiplier'
- Add new settings 'useVarianEncumbranceWithSpecificType'
- Many big fix

### Update 0.6.8

- Bug fix [[BUG]](https://github.com/VanirDev/VariantEncumbrance/issues/52), forgot to add check for module 'DFreds Convenient Effects'
- Add removAE for empty label but with the flag correct

### Update 0.6.7

- Change origin string on add effect from 'actorEntity.id' to `Actor.${actorEntity.data._id}` for strange buf of retrocomaptibility

### Update 0.6.6 [THE ANGRY PATCH AND ALSO BREAKING CHANGES]

- Add stupid feature for some people want ot save 1s on the 2s i need for the weight calculation for manage all the settings and  integration with external module....
- Add new integration with dfred convenient effects for print on chat external custom effects
- Add 3 configuration instead of 2 on header sheet of the actor... checkout the readme for details...
- Add setting for rollback to the standard dnd5e system calculation weight for save 1s on thewieght calculation...
- Full integration metric system, "Viva l'italia"
- Add feature new button state for this request ???? [Button to calculate the weight of items](https://github.com/VanirDev/VariantEncumbrance/issues/51)
- Bug fix error for the vehicle character sheet
- Bug fix some strange behavior with Item Container module when equip/uneqipped the bakcpack item

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
