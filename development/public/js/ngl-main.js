// Functions, variables and other things written for embedded NGL.
// Initial listener to start everything after the Document Object Model is ready.
import { nglInit } from './ngl-gui.js';
import { expandedSelectionLigand } from './ngl-functions.js';
import { addRepresentationListeners } from './ngl-eventListeners.js';
let components = [];
export {components};
$(document).ready(function(){
  // initialize NGL stage and interface elemenets within the viewport
  let {stage, pocketRadiusSlider} = nglInit();
  // export stage and pocketRadiusSlider globally
  window.stage = stage;
  window.pocketRadiusSlider = pocketRadiusSlider;
  // event to handle Windows resizing
  $(window).on('resize', function() {
    stage.handleResize();
  });
  
  // create listeners only after jQuery is done generating right-hand panel 
  $(document).on('contentReady', function() {
    pdbFiles.forEach((file, index) => {
    addRepresentationListeners(index);
    });
    // to make pocket radius slider on viewport work for existed representations    
    pocketRadiusSlider.oninput = function (e) {
      components.forEach((component, index) => {
      if (component.surfaceRepresentation) {
        // parse as integer, otherwise string
        var pocketRadius = parseInt(e.target.value, 10);
        component.surfaceRepresentation.setParameters({filterSele: expandedSelectionLigand(index, "INH", pocketRadius, true)}); 
      }
      });
    };
  });
});
