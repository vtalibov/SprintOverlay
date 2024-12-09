"use strict";
// map object to store data
const pathsToFiles = new Map();
let config;
// to make it selectedProject exportable; exists only for legacy reasons of
// concatinating path to structures on client side

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
  let ssdbAPI = config.ssdbAPI;
  let ligandStructurePreview = config.ligandStructurePreview;
  return {tableSeriesColumnsHeaders, 
    overlayInteractionElements,
    ssdbAPI, ligandStructurePreview};
  }

async function onLoadFunction() {
  config = await configuration();
  // change ssdbAPI in config.json to '/api' if ssdb is deployed with reverse
  // proxy.
  const apiBaseURL = `${document.location.protocol}//${document.location.hostname}:${document.location.port}${config.ssdbAPI}`
  console.log(apiBaseURL);
  const urlGetProjects = `${apiBaseURL}/get_projects`
  const urlGetProjectSeries = `${apiBaseURL}/get_project_series`;
  const urlGetStructuresInSeries = `${apiBaseURL}/get_project_structures_in_series`;
  const urlGetLigandSmiles = `${apiBaseURL}/get_ligand_sformula`;
  
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

  async function getLigandSmiles(ligand) {
    let response = await fetch(
      urlGetLigandSmiles, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(ligand)
    });
    let smiles = await response.json();
    return smiles;
  }

  function sFormulaPreview(ligand) {
    return {
      show: function(event) {
        getLigandSmiles(ligand)
          .then(result => {
            if (result[0].SMILES) {
              $('#sformula').find('h2').text(result[0].Ligand);
              let sd = new SmiDrawer({ bondThickness: 2, bondSpacing: 8 });
              sd.draw(result[0].SMILES, '#svgFormula', 'gruvbox-dark')
            }
          })
          .catch(error => {
            console.error(`Error fetching SMILES, ${error}`);
          })
      }, 
      clean: function(event) {
        $('#sformula').find('h2').empty();
        $('#svgFormula').empty()
      }
    };
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
      // structural formula of the ligand, optional, see config.json
      if (config.ligandStructurePreview === true) {
        structureRow.on('mouseenter', sFormulaPreview(ligand).show);
        structureRow.on('mouseleave', sFormulaPreview(ligand).clean);
      };
      return structureRow;
    }
  };

  let projects = await getProjects();
  projects.forEach(project => {
    $('#projectSelect').append(`<option value="${project.Project}">${project.Project}</option>`);
  })

  $('#projectSelect').change(async function() {
    // test
    console.log(performance.now())
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
        pathsToFiles.set(globalIndex, { project: structure.Project, protein: structure.PathToProtein, ligand: structure.PathToLigand });
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
      // simulate clicks so all tables are started collapsed; not elegant #TODO
      seriesTableHeader.click()
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
    // test
    console.log(performance.now())
  });
}

function adjustColumnsWidth() {
  let tables = $('table.StructuresInSeriesTable');
  let leftColumn = $('.left');
  let rightColumn = $('.right');
  if (tables.length && rightColumn.length) {
    let tableWidth = 0;
    // resize using the widest series table
    $.each(tables, function(index,element) {
      let $element = $(element);
      if ( $element.outerWidth() > tableWidth ) {
        tableWidth = $element.outerWidth();
      }
    });
    let rightColumnWidth = tableWidth + 40;
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