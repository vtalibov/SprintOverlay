// extra gui elements in ngl viewport

function createElement(name, properties, style) {
  let el = document.createElement(name);
  Object.assign(el, properties);
  Object.assign(el.style, style);
  return el;
}

/// extra interface components in the viewport
function addElement(el, stage) {
  Object.assign(el.style, {
    position: "absolute",
    zIndex: 10
  });
  stage.viewer.container.appendChild(el);
}

export function nglInit() {
  let stage = new NGL.Stage("viewport");
  // stage parameters here.
  stage.setParameters({
    sampleLevel: -1, // no sampling; of 0 - sampling only when moving, makes contour surfaces flicker.
  });
  let pocketRadiusSlider = createElement(
    "input",
    {
      type: "range",
      value: 4,
      min: 3,
      max: 10,
      step: 1
    },
    { top: "40px", left: "28px" }
  );
  
  addElement(pocketRadiusSlider, stage);
  addElement(
    createElement(
      "span",
      {
        innerText: "Pocket radius, 3-10 Å"
      },
      { top: "20px", left: "24px", color: "grey" }
    )
  , stage);
  
  // to nglviewport, add checkbox to hide right column and go full-screen
  let overlayCheckbox = createElement(
    "input",
    {
      type: "checkbox",
      checked: true,
      onchange: function (e) {
        let rightColumn = $('.right');
        if (rightColumn.is(":hidden")) {
          rightColumn.show();
        } else {
          rightColumn.hide();
        }
        stage.handleResize();
      }
    },
    { top: "80px", left: "41px" }
  );

  addElement(overlayCheckbox, stage);
  addElement(
    createElement(
      "span",
      {
        innerText: "Overlay panel"
      },
      { top: "71px", left: "56px", color: "grey" }
    )
  , stage);

  // to nglviewport, add checkbox to hide right column and go full-screen
  let backgroundCheckbox = createElement(
    "input",
    {
      type: "checkbox",
      checked: true,
      onchange: function (e) {
        if (this.checked == true) {
          stage.setParameters({ backgroundColor: 'black'});
        } else {
          stage.setParameters({ backgroundColor: 'white'});
        }
      }
    },
    { top: "110px", left: "41px" }
  );

  addElement(backgroundCheckbox, stage);
  addElement(
    createElement(
      "span",
      {
        innerText: "Dark mode"
      },
      { top: "101px", left: "56px", color: "grey" }
    ), stage);

  return { stage, pocketRadiusSlider };
}