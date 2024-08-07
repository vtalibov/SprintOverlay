"use strict";
// map object to store data
const pathsToFiles = new Map();
let config;

function searchForStructure() {
  let searchInput = document.getElementById("searchInput");
  let filter = searchInput.value.toUpperCase(); // case-agnostic search
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
  config = await configuration();
  // document.location, since ajax request is done in browser and should use host resolutions
  const url = `${document.location.protocol}//${document.location.hostname}:${config.ssdbPortExposed}`
  const urlGetProjects = `${url}/get_projects`
  const urlGetProjectSeries = `${url}/get_project_series`;
  const urlGetStructuresInSeries = `${url}/get_project_structures_in_series`;
  
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

  async function getStructuresInSeries(series) {
    let response = await fetch(
      urlGetStructuresInSeries, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(series)
    });
    let structuresInSeries = await response.json();
    return structuresInSeries;
  }

  const MakeTable = {
    genColumnHeaders: function() {
      let thead = $('<thead>').append('<tr></tr>');
      config.tableSeriesColumnsHeaders.forEach(col => {
          let th = $('<th></th>').text(col.text);
          if (col.class) {
              th.addClass(col.class);
          }
          if (col.colspan) {
              th.attr('colspan', col.colspan);
          }
          thead.find('tr').append(th);
      });
      return thead;
    },
    genRow: function(ligand, index) {
      let colorPickerColor = '#C0C0C0';
      let structureRow = $('<tr></tr>');
      config.overlayInteractionElements.forEach(interElement => {
        let tableCell = $('<td>');
        if (interElement.elementType === 'structureLabel') {
          tableCell.text(ligand.Ligand);
          tableCell.attr('id', `${interElement.representation}${index}`)
        } else if (interElement.elementType === 'checkbox') {
          tableCell.append(createCheckbox(interElement.representation, index));
        } else if (interElement.elementType === 'colorpicker') {
          tableCell.append(createColorPicker(interElement.representation,
            colorPickerColor, index));
        }
        tableCell.addClass(interElement.class);
        structureRow.append(tableCell);
      });
      return structureRow;
    }
  };

  let projects = await getProjects();
  projects.forEach(project => {
    $('#projectSelect').append(`<option value="${project.Project}">${project.Project}</option>`);
  })

  $('#projectSelect').change(async function() {
    let selectedProject = $(this).val();
    $(this).hide();
    let globalIndex = 0;
    let seriesInProject = await getProjectSeries(selectedProject);
    // for...in loop here to use await.
    for (const series of seriesInProject) {
      // Create table for ligands in series
      let tableSeries = $('<table class="StructuresInSeriesTable"></table>');
      let tbody = $('<tbody></tbody>');
      let structuresInSeries = await getStructuresInSeries(series);
      structuresInSeries.forEach((structure) => {
        pathsToFiles.set(globalIndex, { protein: structure.PathToStructure, ligand: structure.PathToLigand });
        tbody.append(MakeTable.genRow(structure, globalIndex));
        globalIndex++;
      });
      tableSeries.append(MakeTable.genColumnHeaders(), tbody);
      let seriesTableHeader = $('<span class="series expanded"></span>');
      seriesTableHeader.click(function() {
        $(this).toggleClass('expanded');
        tableSeries.toggle();
      });
      seriesTableHeader.append(`<strong>${series.Series}</strong>`);
      $('#checkboxContainer').append(seriesTableHeader, tableSeries, '<br>');
      adjustColumnsWidth();
    };
    // timestamp
    let timeStamp = new Date();
    let accessDate = $('<p>').text(`accessed on ${timeStamp.toLocaleDateString()}, ${timeStamp.toLocaleTimeString()}`)
    // search textbox
    let searchInput = $("<input>", {
      type: "text",
      id: "searchInput",
      placeholder: "Structure ID1;StructureID2"
    });
    searchInput.on('keyup', searchForStructure);
    // overlay panel 
    $('#selectedInfo').append($('<h2>').text(selectedProject), accessDate, searchInput);
    $('#selectedInfo').show();
    // trigger
    $(document).trigger('contentReady');
  });
}

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
});

$(window).on('resize', function() {
  adjustColumnsWidth();
});