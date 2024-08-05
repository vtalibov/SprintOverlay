import {components} from './ngl-main.js';

const colorpickersColors = [
  '#00FF00', // green
  '#FFFF00', // yellow
  '#FFFFFF', // white
  '#FA8072', // salmon
  '#00FFFF', // cyan
  '#FF00FF', // purple
  '#FFBF00', // orange
  '#9FE2BF', // olive
  '#C0C0C0', // silver
  '#CCCCFF'  // light purple
];

function randomHexColorString() {
  let randomHex = Math.floor(Math.random() * 0xFFFFFE).toString(16);
  return `#${randomHex.padStart(5, '0')}`;
}

function assignColorpickersColor(index) {
  let colorpickerColor;
  // count only defined elemenets of sparse array
  let numLoaded = components.filter(component => component !== undefined).length; 
  if (numLoaded < colorpickersColors.length) {
    colorpickerColor = colorpickersColors[numLoaded];
  } else {
    colorpickerColor = randomHexColorString();
  }
  let colorPickers = config.overlayInteractionElements.filter(
  element => element.elementType === "colorpicker");
  colorPickers.forEach(element => {
    $(`#colorpicker${element.representation}${index}`).spectrum("set", colorpickerColor);
  });
}

export async function loadStructure(index) {
  try {
    // check if the structure is already loaded
    if (!components[index]) {
      assignColorpickersColor(index);
      // two structures are concatenated, cf
      // https://github.com/nglviewer/ngl/blob/master/examples/scripts/test/concat.js and
      // https://nglviewer.org/ngl/?script=test/concat
      // to address protein or ligand structures for in selection algebra, use mode expressions:
      // /0 - protein, /1 - ligand
      let ligandStructure;
      let proteinStructure;
      // conditional below to handle non-split cases
      if (!pathsToFiles.get(index).ligand) {
        ligandStructure = await stage.loadFile('decoy.pdb', { defaultRepresentation: false });
      } else {
        ligandStructure = await stage.loadFile(pathsToFiles.get(index).ligand, { defaultRepresentation: false });
      };
      if (!pathsToFiles.get(index).protein) {
        proteinStructure = await stage.loadFile('decoy.pdb', { defaultRepresentation: false });
      } else {
        proteinStructure = await stage.loadFile(pathsToFiles.get(index).protein, { defaultRepresentation: false });
      };
      let concatStructure = NGL.concatStructures(
        'concat',
        proteinStructure.structure.getView(new NGL.Selection('')),
        ligandStructure.structure.getView(new NGL.Selection(''))
      );
      components[index] = stage.addComponentFromObject(concatStructure);
    }
  } catch (error) {
    console.error("Error loading files:", error);
  }
}

function colorpickerValue(representation, index) {
  let colorpickerID = `colorpicker${representation}${index}`;
  let colorpicker = document.getElementById(colorpickerID);
  return colorpicker.value;
}
// function to define selections for ligands/pockets. Used for selections in
// toggleSurface and toggleInteractions. selection - string for the selection,
// according to NGL selection algebra; pocketRadius - expanded selection in Å
// around the selection, pocket - boolean "true" or "false" to exclude
// selection atoms from the expanded selection and expand expanded selection
// to the groups (use true when pass to toggleSurface).
export function expandedSelectionLigand(index, selection, pocketRadius, pocket) {
  let structure = components[index].structure;
  if (typeof pocket === 'boolean') {
    let selectionString = "";
    // select atoms within pocketRadius from the selection
    let withinSelectionAtoms = structure.getAtomSetWithinSelection(
      new NGL.Selection(selection, pocketRadius),
      pocketRadius);
    if (pocket) {
      // add to the selection atoms from the same group (e.g. other atoms of a residue)
      let withinSelectionAtoms2 = structure.getAtomSetWithinGroup(withinSelectionAtoms);
      // convert selected atoms to a string, so it can be passed as a sele
      // argument in corresponding functions. Atoms from the ligand are removed here.
      selectionString = `${withinSelectionAtoms2.toSeleString()} and (not ${selection})`;
      console.log(selectionString);
    } else {
      selectionString = withinSelectionAtoms.toSeleString()
    }
    return selectionString;
  } else {
      throw new Error("Invalid pocket argument type. Expected boolean.");
  }
}
// Function to toggle ribbon representation. 
//Other toggleRepresentation(index) are similar and are not commented.
export function toggleRibbon(index) {
  // to check if components exist, since the corresponding checkbox event
  // handler loads the structure on first interaction
  if (components[index]) {
      // Check if the component already has a representation
      let hasRepresentation = components[index].ribbonRepresentation;
      if (hasRepresentation) {
          // If a representation exists, remove it
          components[index].removeRepresentation(components[index].ribbonRepresentation);
          // null, otherwise, {else} won't work after the second interaction
          // with the checkbox.
          components[index].ribbonRepresentation = null;
      } else {
          components[index].ribbonRepresentation = components[index].addRepresentation("cartoon",
          {color: colorpickerValue('Licorice', index)});
      }
    }
}

// Function to toggle protein licorice representation
export function toggleLicorice(index) {
    if (components[index]) {
      let hasRepresentation = components[index].licoriceRepresentation;
      if (hasRepresentation) {
          components[index].removeRepresentation(components[index].licoriceRepresentation);
          components[index].licoriceRepresentation = null;
      } else {
          components[index].licoriceRepresentation = components[index].addRepresentation("line",
          {sele: "not hetero and not apolarh and /0", linewidth: 3, colorValue: colorpickerValue('Licorice', index) });
      }
    }
}
// Function to toggle ligand licorice representation
export function toggleLigandLicorice(index) {
    if (components[index]) {
      let hasRepresentation = components[index].ligandLicoriceRepresentation;
      if (hasRepresentation) {
          components[index].removeRepresentation(components[index].ligandLicoriceRepresentation);
          components[index].ligandLicoriceRepresentation = null;
      } else {
          components[index].ligandLicoriceRepresentation = components[index].addRepresentation("licorice",
          {
            sele: "(/1 and not apolarh) or (INH and not apolarh) or (hetero and not apolarh) and (not water or ion)",
            multipleBond: "offset",
            colorValue: colorpickerValue('LigandLicorice', index)
          });
      }
    }
}
// Function to toggle water representation
export function toggleWater(index) {
    if (components[index]) {
        let hasRepresentation = components[index].waterRepresentation;
        if (hasRepresentation) {
            components[index].removeRepresentation(components[index].waterRepresentation);
            components[index].waterRepresentation = null;
        } else {
            components[index].waterRepresentation = components[index].addRepresentation( "licorice", { sele: "water or ion" });
        }
    }
}
// function to change protein licorice color with general the colorpickerValue function
// checks first if [component](index) exists, so the colorpicker event Listener
// does not trigger non-critical error that a component is undefined.
export function licoriceColor(index) {
  if (components[index]) {
    let selectedColor = colorpickerValue("Licorice", index);
    if (components[index].licoriceRepresentation) {
      components[index].licoriceRepresentation.setParameters({ colorValue: selectedColor});
    }
    if (components[index].ribbonRepresentation) {
      components[index].ribbonRepresentation.setParameters({ colorValue: selectedColor});
    }
  }
}
// function to change protein licorice color with general colorpickerValue function
export function ligandLicoriceColor(index) {
  if (components[index]) {
    let selectedColor = colorpickerValue("LigandLicorice", index);
      if (components[index].ligandLicoriceRepresentation) {
    components[index].ligandLicoriceRepresentation.setParameters({ colorValue: selectedColor});
    }
  }
}
// function to change ligand surface color
export function ligandSurfaceColor(index) {
  if (components[index]) {
    let selectedColor = colorpickerValue("LigandSurface", index);
    if (components[index].ligandSurfaceRepresentation) {
    components[index].ligandSurfaceRepresentation.setParameters({ color: selectedColor});
    }
  }
}
// Function to toggle ligand surface representation
export function toggleLigandSurface(index) {
  if (components[index]) {
    let hasRepresentation = components[index].ligandSurfaceRepresentation;
    if (hasRepresentation) {
      components[index].removeRepresentation(components[index].ligandSurfaceRepresentation);
      components[index].ligandSurfaceRepresentation = null;
    } else {
      components[index].ligandSurfaceRepresentation = components[index].addRepresentation("surface",
      { sele: "(/1 or INH) and not ion", surfaceType: "av", contour: true,
      color: colorpickerValue("LigandSurface", index) });
    }
  }
}
// Function to toggle protein surface representation.
// Surface is filtered around the selection of group-based atomSets in proximity
// to the ligands, see expandedSelectionLigand function, pocket case.
export function toggleSurface(index) {
  if (components[index]) {
    let hasRepresentation = components[index].surfaceRepresentation;
    if (hasRepresentation) {
      components[index].removeRepresentation(components[index].surfaceRepresentation);
      components[index].surfaceRepresentation = null;
    } else {
      let pocketRadius = parseInt(pocketRadiusSlider.value, 10);
      components[index].surfaceRepresentation = components[index].addRepresentation("surface", {
        sele: "not hetero", filterSele: expandedSelectionLigand(index, "/1 or INH", pocketRadius, true),
        contour: true, surfaceType: "av", lazy: true, probeRadius: 1.4, scaleFactor: 1.6,
        color: colorpickerValue("Surface", index) });
      }
    }
}
// function to change surface color with general colorpickerValue function
export function surfaceColor(index) {
  if (components[index]) {
    let selectedColor = colorpickerValue("Surface", index);
    if (components[index].surfaceRepresentation) {
      components[index].surfaceRepresentation.setParameters({ color: selectedColor});
    }
  }
}
// Show interaction network for ligands; see expandedSelectionLigand function,
// pocket false case
// TODO work on it actively
export function toggleInteractions(index) {
  if (components[index]) {
    let hasRepresentation = components[index].interactionsRepresentation;
    if (hasRepresentation) {
      components[index].removeRepresentation(components[index].interactionsRepresentation);
      components[index].interactionsRepresentation = null;
    } else {
      components[index].interactionsRepresentation = components[index].addRepresentation( "contact",
      { diffuse: "#FFFFFF", // adjust to change color of contacts; can't do it via standart API; very dimm
        radiusSize: 0.08,
        ionicInteraction: false, // NGL does not recognize charged moieties that well. E.g. amides are considered to be amines
        refineSaltBridges: false, // this and above - to render salt bridges as normal h-bonds.
        // talk to Katarina/Adrian regarding constrains below. Consult with documentation.
        maxHbondDist: 3.25,
        maxHbondDonPlaneAngle: 40,
        maxHalogenBondDist: 4,
        masterModelIndex: 0,
        sele: expandedSelectionLigand(index, "/1 or INH", 4, false),
        filterSele: "/1 or INH"
      });
    }
  }
}