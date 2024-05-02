import {
  loadStructure, toggleLicorice, licoriceColor,
  toggleRibbon, toggleLigandLicorice, toggleWater,
  ligandSurfaceColor, ligandLicoriceColor,
  toggleLigandSurface, toggleSurface,
  surfaceColor, toggleInteractions,
} from './ngl-functions.js';
import { components } from './ngl-main.js';
// function to add listeners to the checkboxes for the components[index]
// structure. each checkbox upon the interaction checks if the structure is
// already loaded, and if not, does so.

function checkIfNoRepresentations(index) {
    return components[index].reprList.length === 0;
}

// function to access status of switcherVisible. Pass after each
// addRepresentation listener.
function switcherVisibleStatus(switcherVisible, index) {
  if (checkIfNoRepresentations(index)) {
    switcherVisible.disabled = true;
    switcherVisible.checked = false;
    components[index].setVisibility(true);
  } else if (switcherVisible.disabled == true) {
    switcherVisible.disabled = false;
    switcherVisible.checked = true;
  }
}

export function addRepresentationListeners(index) {
  let rowHeaderLigandID = `textboxLigandID${index}`;
  let rowHeaderLigand = document.getElementById(rowHeaderLigandID);
  rowHeaderLigand.addEventListener("click", function () {
    if (components[index]) {
    components[index].autoView("INH", 1000);
    };
  })
  // checkboxes
  let switcherVisibleID = `checkboxVisible${index}`;
  let switcherVisible = document.getElementById(switcherVisibleID);
  switcherVisible.disabled = true;
  switcherVisible.addEventListener("change", function () {
    if (switcherVisible.checked == true) {
      components[index].setVisibility(true)
    } else {
      components[index].setVisibility(false)
    }
  });
  let checkboxRibbonID = `checkboxRibbon${index}`;
  let checkboxRibbon = document.getElementById(checkboxRibbonID);
  checkboxRibbon.addEventListener("change", async function () {
    await loadStructure(index);
    toggleRibbon(index);
    switcherVisibleStatus(switcherVisible, index)
  });
  let checkboxLicoriceID = `checkboxLicorice${index}`;
  let checkboxLicorice = document.getElementById(checkboxLicoriceID);
  checkboxLicorice.addEventListener("change", async function () {
    await loadStructure(index);
    toggleLicorice(index);
    switcherVisibleStatus(switcherVisible, index)
  });
  let checkboxLigandLicoriceID = `checkboxLigandLicorice${index}`;
  let checkboxLigandLicorice = document.getElementById(checkboxLigandLicoriceID);
  checkboxLigandLicorice.addEventListener("change", async function () {
    await loadStructure(index);
    toggleLigandLicorice(index);
    // Set of conditional statements below controls representation of
    // interactions; the corresponding checkbox is active only when the ligand
    // licorice representation is on; interaction representation will be removed
    // whenever ligand licorice is off, but if was appended and not explicitly
    // unchecked, comes back when the licorice representation is toggled again. 
    if (checkboxLigandLicorice.checked) {
      checkboxInteractions.disabled = false;
      if (checkboxInteractions.checked == true) {
        toggleInteractions(index);
      }
    } else {
      checkboxInteractions.disabled = true;
      if (checkboxInteractions.checked == true) {
        toggleInteractions(index);
      }
    }
    switcherVisibleStatus(switcherVisible, index);
  });
  let checkboxSurfaceID = `checkboxSurface${index}`;
  let checkboxSurface = document.getElementById(checkboxSurfaceID);
  checkboxSurface.addEventListener("change", async function () {
    await loadStructure(index);
    toggleSurface(index);
    switcherVisibleStatus(switcherVisible, index)
  });
  let checkboxLigandSurfaceID = `checkboxLigandSurface${index}`;
  let checkboxLigandSurface = document.getElementById(checkboxLigandSurfaceID);
  checkboxLigandSurface.addEventListener("change", async function () {
    await loadStructure(index);
    toggleLigandSurface(index);
    switcherVisibleStatus(switcherVisible, index);
  });
  let checkboxWaterID = `checkboxWater${index}`;
  let checkboxWater = document.getElementById(checkboxWaterID);
  checkboxWater.addEventListener("change", async function () {
    await loadStructure(index);
    toggleWater(index);
    switcherVisibleStatus(switcherVisible, index);
  });
  let checkboxInteractionsID = `checkboxInteractions${index}`;
  let checkboxInteractions = document.getElementById(checkboxInteractionsID);
  // see eEventListener for checkboxLigandLicorice
  checkboxInteractions.disabled = true;
  checkboxInteractions.addEventListener("change", async function () {
    // No structure load, since this checkbox is related to
    // checkboxLigandLicorice
    toggleInteractions(index);
  });
  // Color listeners since the change in surface (or any other color) must be
  // responsive both when the corresponding representation is present and not,
  // there is a separate function colorpickerValue(representation,index) to read
  // the current color value.
  let colorpickerLicoriceID = 'colorpickerLicorice' + (index);
  let colorpickerLicorice = document.getElementById(colorpickerLicoriceID);
  colorpickerLicorice.addEventListener("change", function() {
    licoriceColor(index)
  });
  let colorpickerLigandLicoriceID = 'colorpickerLigandLicorice' + (index);
  let colorpickerLigandLicorice = document.getElementById(colorpickerLigandLicoriceID);
  colorpickerLigandLicorice.addEventListener("change", function() {
    ligandLicoriceColor(index)
  });
  let colorpickerSurfaceID = 'colorpickerSurface' + (index);
  let colorpickerSurface = document.getElementById(colorpickerSurfaceID);
  colorpickerSurface.addEventListener("change", function() {
    surfaceColor(index)
  });
  let colorpickerLigandSurfaceID = 'colorpickerLigandSurface' + (index);
  let colorpickerLigandSurface = document.getElementById(colorpickerLigandSurfaceID);
  colorpickerLigandSurface.addEventListener("change", function() {
  ligandSurfaceColor(index)
  });
}