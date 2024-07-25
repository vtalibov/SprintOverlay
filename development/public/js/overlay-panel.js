"use strict";
const pdbFiles = [];
// Two arrays below configure the ligand-in-series tables and
// interactive elements of the overlay pane.
let tableSeriesColumnsHeaders = [
  { text: "Structure", class: "", colspan: "" },
  { text: "View", class: "", colspan: "" },
  { text: "R", class: "", colspan: "" },
  { text: "Prot L", class: "colored", colspan: "2" },
  { text: "Lig L", class: "", colspan: "2" },
  { text: "Prot S", class: "colored", colspan: "2" },
  { text: "Lig S", class: "", colspan: "2" },
  { text: "W", class: "", colspan: "" },
  { text: "HB", class: "", colspan: "" }
];
let overlayInteractionElements = [
  // for structure search to work, structureLabel must be the first column
  { representation: "textboxLigandID", elementType: "structureLabel", class: "ligand-table row-header" },
  { representation: "Visible", elementType: "checkbox", class: "" },
  { representation: "Ribbon", elementType: "checkbox", class: "" },
  { representation: "Licorice", elementType: "checkbox", class: "colored" },
  { representation: "Licorice", elementType: "colorpicker", class: "colored" },
  { representation: "LigandLicorice", elementType: "checkbox", class: "" },
  { representation: "LigandLicorice", elementType: "colorpicker", class: "" },
  { representation: "Surface", elementType: "checkbox", class: "colored" },
  { representation: "Surface", elementType: "colorpicker", class: "colored" },
  { representation: "LigandSurface", elementType: "checkbox", class: "" },
  { representation: "LigandSurface", elementType: "colorpicker", class: "" },
  { representation: "Water", elementType: "checkbox", class: "" },
  { representation: "Interactions", elementType: "checkbox", class: "" }
];
//SSDB adress
let ssdbPortExposed = 5000
let url = `${document.location.protocol}//${document.location.hostname}:${ssdbPortExposed}`

function searchForStructure() {
  let structureInput = document.getElementById("structureInput");
  let filter = structureInput.value.toUpperCase(); // case-agnostic search
  // if several labels are submitted, separated by semicolon.
  let filterSet = filter.split(';');
  let tablesStructuresInSeries = document.querySelectorAll('.StructuresInSeriesTable');
  console.log(tablesStructuresInSeries)
  tablesStructuresInSeries.forEach(table => {
    let tr = table.getElementsByTagName('tr');
    let i;
    let structureLabel;
    for (i = 0; i < tr.length; i++) {
      let td = tr[i].getElementsByTagName('td')[0];
      if (td) {
        structureLabel = td.innerText.toUpperCase();
        // lambda function below to check for multiple matches
        if (filterSet.some(searchFor => structureLabel.indexOf(searchFor) > -1) 
          || filter == "") {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  });
}

// TODO
// define a dictionary with default colors and use them instead
function randomHexColorString() {
  let randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  return '#' + randomHex.padStart(6, '0');
}

function createCheckbox(forRepresentation, index) {
  let checkbox = $('<input>', {
      type: 'checkbox',
      id: 'checkbox' + forRepresentation + index
  });
  return checkbox;
}

function createColorPicker(forRepresentation, defaultColor, index) {
  let colorPickerDiv = $('<div>', {
    class: 'colorPicker'
  });
  let colorPickerInput = $('<input>', {
    type: 'text',
    value: defaultColor,
    id: `colorpicker${forRepresentation}${index}`
  });
  colorPickerDiv.append(colorPickerInput);
  // Initialize the color picker on the created input element
  // Would be a simple pallete.
  colorPickerInput.spectrum({
    type: "color",
    showPalette: false,
    showPaletteOnly: true,
    hideAfterPaletteSelect: true,
    showAlpha: false,
    showButtons: false,
    allowEmpty: false
  });
  return colorPickerDiv;
}
function onLoadFunction() {
  // function to filter tables StructuresInSeriesTable by ligands.

  // Fetch projects from Flask endpoint
  // change ssdbPortExposed to the port, exposed for SSDB app.
  // document.location, since ajax request is done in browser and should use host resolutions
  let urlGetProjects = `${url}/get_projects`
  
  $.ajax({
    url: urlGetProjects,
    type: 'GET',
    success: function(response) {
      // Populate the select dropdown with projects
      // dot notation is used
      response.forEach(function(project) {
        $('#projectSelect').append(`<option value="${project.Project}">${project.Project}</option>`);
      });
    },
    error: function(xhr, status, error) {
      $('#selectedInfo').text(`Error fetching data for the selected project: ${error}`);
      $('#selectedInfo').show();
    }
  });

  $('#projectSelect').change(function() {
    let selectedProject = $(this).val();
    // To make the selector disappear and instead show header with a project name
    $(this).hide();
    let overlayHeader = $('<h2>').text(selectedProject)
    $('#selectedInfo').append(overlayHeader);
    $('#selectedInfo').show();

    let urlGetProjectSeries = `${url}/get_project_series`;
    let urlGetStructuresInSeries = `${url}/get_project_structures_in_series`;

    $.ajax({
      url: urlGetProjectSeries,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ Project: selectedProject }), // Pass selected project as JSON data
      success: function(seriesInProject) {
        let globalIndex = 0;
        seriesInProject.forEach((series) => {
          let seriesTableHeader = $('<span class="series expanded"></span>');
          seriesTableHeader.click(function() {
            $(this).toggleClass('expanded');
            tableSeries.toggle();
          });
          seriesTableHeader.append('<strong>' + series.Series + '</strong>');
          // Create table for ligands in series
          let tableSeries = $('<table class="StructuresInSeriesTable"></table>');
          let thead = $('<thead>').append('<tr>');
          tableSeriesColumnsHeaders.forEach(col => {
            let th = $('<th>').text(col.text);
            if (col.class) {
              th.addClass(col.class);
            }
            if (col.colspan) {
              th.attr('colspan', col.colspan);
            }
            thead.find('tr').append(th);
          });
          let tbody = $('<tbody></tbody>');
          $.ajax({
            url: urlGetStructuresInSeries,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(series), // Pass series as JSON data
            success: function(ligands) {
              ligands.forEach((ligand) => {
                pdbFiles.push(ligand.PathToStructure)
                let ligandRow = $('<tr></tr>');
                overlayInteractionElements.forEach(interElement => {
                  let tableCell = $('<td>');
                  if (interElement.elementType === 'structureLabel') {
                    tableCell.text(ligand.Ligand);
                    tableCell.attr('id', interElement.representation + globalIndex)
                  } else if (interElement.elementType === 'checkbox') {
                    tableCell.append(createCheckbox(interElement.representation, globalIndex));
                  } else if (interElement.elementType === 'colorpicker') {
                    tableCell.append(createColorPicker(interElement.representation,
                      randomHexColorString, globalIndex));
                  }
                  tableCell.addClass(interElement.class);
                  ligandRow.append(tableCell);
                });
                tbody.append(ligandRow);
                globalIndex++;
                tableSeries.append(thead, tbody);
              });
              $('#checkboxContainer').append(seriesTableHeader);
              $('#checkboxContainer').append(tableSeries);
              $('#checkboxContainer').append('<br>');
            },
            error: function(xhr, status, error) {
              $('#selectedInfo').text('Error fetching data for the selected project: ' + error);
              $('#selectedInfo').show();
              console.error('Error fetching series in project:', error);
            }
          });
        });
      },
      error: function(xhr, status, error) {
        $('#selectedInfo').text('Error fetching data for the selected project:' + error);
        $('#selectedInfo').show();
        console.error('Error fetching series in project:', error);
      }
    });
    // TODO
    // this timeout is ultrastupid, fix things later
    let timeStamp = new Date();
    let accessDate = $('<p>').text(`accessed on ${timeStamp.toLocaleDateString()}, ${timeStamp.toLocaleTimeString()}`)
    setTimeout(function () {
      $('#selectedInfo').append(accessDate);
      // add search box for ligands
      let structureInput = $("<input>", {
        type: "text",
        id: "structureInput",
        placeholder: "Structure ID1;StructureID2"
      });
      structureInput.on('keyup', searchForStructure);
      $('#selectedInfo').append(structureInput);
      // to ensure that event listeners in other .js scripts run only after the
      // content is completely generated by jQuery.
      // Run related code within $(document).on('contentReady', function() {}
      $(document).trigger('contentReady');
    }, 2000);
  });
}

$(document).ready(function() {
  onLoadFunction();

  // Set up the listener before triggering the event
  $(document).on('contentReady', function() {
    console.log('content is ready');
  });

  // Trigger the event after setting up the listener
});