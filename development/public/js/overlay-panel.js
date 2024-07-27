"use strict";
const pdbFiles = [];

function searchForStructure() {
  let structureInput = document.getElementById("structureInput");
  let filter = structureInput.value.toUpperCase(); // case-agnostic search
  // if several labels are submitted, separated by semicolon.
  let filterSet = filter.split(';');
  let tablesStructuresInSeries = document.querySelectorAll('.StructuresInSeriesTable');
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
  return `#${randomHex.padStart(6, '0')}`;
}

function createCheckbox(forRepresentation, index) {
  let checkbox = $('<input>', {
    type: 'checkbox',
    id: `checkbox${forRepresentation}${index}`
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
  // Initialize the color picker on the created input element Would be a simple
  // pallete.
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

async function configuration() {
  let response = await fetch('js/config.json');
  let config = await response.json();
  let tableSeriesColumnsHeaders = config.tableSeriesColumnsHeaders;
  let overlayInteractionElements = config.overlayInteractionElements;
  let ssdbPortExposed = config.ssdbPortExposed;
  return {tableSeriesColumnsHeaders, 
    overlayInteractionElements,
    ssdbPortExposed};
  }

async function onLoadFunction() {
  let config = await configuration();
  // document.location, since ajax request is done in browser and should use host resolutions
  let url = `${document.location.protocol}//${document.location.hostname}:${config.ssdbPortExposed}`
  let urlGetProjects = `${url}/get_projects`
  let urlGetProjectSeries = `${url}/get_project_series`;
  let urlGetStructuresInSeries = `${url}/get_project_structures_in_series`;
  
  async function getProjects() {
    let response = await fetch(urlGetProjects, {method: 'GET'});
    let projects = await response.json()
    return projects
  }

  async function getProjectSeries(selectedProject) {
    let response = await fetch(
      urlGetProjectSeries, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ Project: selectedProject })
    });
    let seriesInProject = await response.json();
    return seriesInProject;
  }

  let projects = await getProjects();
  projects.forEach(project => {
    $('#projectSelect').append(`<option value="${project.Project}">${project.Project}</option>`);
  })

  $('#projectSelect').change(async function() {
    let selectedProject = $(this).val();
    // To make the selector disappear and instead show header with a project name
    $(this).hide();
    let overlayHeader = $('<h2>').text(selectedProject)
    $('#selectedInfo').append(overlayHeader);
    $('#selectedInfo').show();
    let globalIndex = 0;
    let seriesInProject = await getProjectSeries(selectedProject);
    seriesInProject.forEach((series) => {
      let seriesTableHeader = $('<span class="series expanded"></span>');
      seriesTableHeader.click(function() {
        $(this).toggleClass('expanded');
        tableSeries.toggle();
      });
      seriesTableHeader.append(`<strong>${series.Series}</strong>`);
      // Create table for ligands in series
      let tableSeries = $('<table class="StructuresInSeriesTable"></table>');
      let thead = $('<thead>').append('<tr>');
      config.tableSeriesColumnsHeaders.forEach(col => {
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
            config.overlayInteractionElements.forEach(interElement => {
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
          // TODO right now, executed multiple times
        },
        error: function(xhr, status, error) {
          $('#selectedInfo').text('Error fetching data for the selected project: ' + error);
          $('#selectedInfo').show();
          console.error('Error fetching series in project:', error);
        }
        });
    });
    // stamp for the db access; right now does not corresponded to the last
    // interacrtion with db
    let timeStamp = new Date();
    let accessDate = $('<p>').text(`accessed on ${timeStamp.toLocaleDateString()}, ${timeStamp.toLocaleTimeString()}`)
    $('#selectedInfo').append(accessDate);
    // search textbox
    let structureInput = $("<input>", {
      type: "text",
      id: "structureInput",
      placeholder: "Structure ID1;StructureID2"
    });
    structureInput.on('keyup', searchForStructure);
    $('#selectedInfo').append(structureInput);
    // TODO
    // this timeout is ultrastupid, fix things later
    setTimeout(function () {
      $(document).trigger('contentReady');
    }, 2000);
  });
}

// scaling-related functions
function adjustColumnsWidth() {
  let table = $('table.StructuresInSeriesTable');
  let leftColumn = $('.left');
  let rightColumn = $('.right');
  if (table.length && rightColumn.length) {
      let rightColumnWidth = table.outerWidth() + 40;
      let leftColumnWidth = $('.container').width() - rightColumnWidth;
      rightColumn.width(rightColumnWidth);
      leftColumn.width(leftColumnWidth);
  }
}

$(document).ready(function() {
  onLoadFunction();
  // Set up the listener before triggering the event
  $(document).on('contentReady', function() {
    console.log('content is ready');
  });
  // Trigger the event after setting up the listener
});
$(window).on('resize', function() {
  adjustColumnsWidth();
});