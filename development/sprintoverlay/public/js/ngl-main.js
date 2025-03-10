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


    //Button to clean upp all representations. Simulation a mouse click in ticked checkBoxes, smart Vladimir!
    let clearButton = document.getElementById("clearButtonId"); 
    clearButton.addEventListener("click", function() {
      $("td input[type='checkbox']:checked").each(function() {
        let checkboxId = $(this).attr("id"); // Get checkbox ID
        document.getElementById(checkboxId).click()
        // $(this).prop("checked", false); // Uncheck the checkbox
      });
    });

    
    for (let index of pathsToFiles.keys()) {
    addRepresentationListeners(index);
    };
    // to make pocket radius slider on viewport work for existed representations    
    pocketRadiusSlider.oninput = function (e) {
      components.forEach((component, index) => {
      if (component.surfaceRepresentation) {
        // parse as integer, otherwise string
        var pocketRadius = parseInt(e.target.value, 10);
        component.surfaceRepresentation.setParameters({filterSele: expandedSelectionLigand(index, "/1 or INH", pocketRadius, true)}); 
      }
      });
    };
  });
});
