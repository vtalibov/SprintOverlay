const pdbFiles = [];

$(document).ready(function(){
  
  // generate random #hex code for a color
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

  // I cant' make it wokr with table interface well. Layout have to be moved to <div> arrays.
  // function createSwitcher(forRepresentation, index) {
  //   var switcher = $('<label>', {
  //     class: 'switch'
  //   });
  //   var checkbox = $('<input>', {
  //     type: 'checkbox',
  //     id: 'switcher' + forRepresentation + index
  //   })
  //   var slider =  $('<span>', {class: 'slider'});
  //   switcher.append(checkbox, slider);
  //   return switcher;
  // }
  // function to create colorpicker element; uses spectrum lib. pass string
  // value "forRepresentation" for the element ID, string with a hex code for
  // defaultColor
  function createColorPicker(forRepresentation, defaultColor, index) {
    let colorPickerDiv = $('<div>', {
      class: 'colorPicker'
    });
    let colorPickerInput = $('<input>', {
      type: 'text',
      value: defaultColor,
      id: 'colorpicker' + forRepresentation + index
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
      }
    );
    return colorPickerDiv;
  }
  // Fetch projects from Flask endpoint
  // TODO refactor it to use vanilla JS
  // change ssdbPortExposed to the port, exposed for SSDB app.
  // document.location, since ajax request is done in browser and should use host resolutions
  let ssdbPortExposed = 5000
  let url = document.location.protocol + "//" + document.location.hostname + ":" + ssdbPortExposed
  let urlGetProjects = url + "/get_projects"
  $.ajax({
      url: urlGetProjects,
      type: 'GET',
      success: function(response) {
          // Populate the select dropdown with projects
          // dot notation is used
          response.forEach(function(project) {
              $('#projectSelect').append('<option value="' + project.Project + '">' + project.Project + '</option>');
          });
      },
      error: function(xhr, status, error) {
          $('#selectedInfo').text('Error fetching data for the selected project:' + error);
          $('#selectedInfo').show();
          console.error('Error fetching projects:', error);
      }
  });
  // Remove ajax requests and put
  // everything below under $getJSON to read from local JSON file.
  // $.getJSON('output.json', function(jsonData) {
    // Event listener for when a project is selected
    $('#projectSelect').change(function() {
      let selectedProject = $(this).val();
      // make the selector to disappear and instead show project name
      $(this).hide()
      let overlayHeader = $('<h2>').text(selectedProject)
      $('#selectedInfo').append(overlayHeader);
      $('#selectedInfo').show();
      let urlGetProjectData = url + "/get_project_data"
      // Make AJAX request with selected project
        $.ajax({
          url: urlGetProjectData,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ project: selectedProject }), // Pass selected project as JSON data
          success: function(jsonData) {
            // add timestamp to the overlay header upon successful ajax request.
            timeStamp = new Date();
            let accessDate = $('<p>').text("accessed on " + timeStamp.toLocaleDateString() + ", " + timeStamp.toLocaleTimeString())
            $('#selectedInfo').append(accessDate);
            // Handle response from the server. 
            // Create object to store ligands by series
            let ligandsBySeries = {};
            // Organize ligands by series; populated the related dictionary.
            // TODO this can be done at JSON response on SSDB server side, since
            // the response set can be ordered.
            $.each(jsonData, function(index, entry) {
              if (!(entry.Series in ligandsBySeries)) {
                ligandsBySeries[entry.Series] = [];
              }
              ligandsBySeries[entry.Series].push(entry);
            });
            // Initialize global index counter; important for NGL api since in
            // ngl-scripts.js all PDB files are indexed as structures in loop below
            let globalIndex = 0;

            // Loop through each series
            $.each(ligandsBySeries, function(series, ligands) {
              // Sort ligands alphabetically by Ligand (ligandname) property
              // TODO this can be done at JSON response on SSDB server side, since
              // the response set can be ordered.
              ligands.sort(function (a, b) {
                return a.Ligand.localeCompare(b.Ligand);
              });
              // array to hold path to structures for current series
              const structurePathsBySeries = [];
              // Create plus button for series
              let seriesTableHeader = $('<span class="series expanded"></span>');
              // TODO rewrite without jQuery functions?
              seriesTableHeader.click(function() {
                  $(this).toggleClass('expanded');
                  tableSeries.toggle();
              });
              seriesTableHeader.append('<strong>' + series + '</strong>');
              $('#checkboxContainer').append(seriesTableHeader);

              // Create table for ligands in series
              let tableSeries = $('<table class="StructuresInSeriesTable"></table>');
              // Create column headers: R (ribbon), PL (Protein Licorice, two-columns),
              // LL (Ligand Licorice, two-columns), PS (Protein Surface, two-columns),
              // LS (Ligand Surface, two-columns), W (water), --- (interactions for hetero)
              let thead = $('<thead><tr><th>Structure</th><th>View</th><th>R</th><th class="colored" colspan="2">Prot L</th><th colspan="2">Lig L</th><th class="colored" colspan="2">Prot S</th><th colspan="2">Lig S</th><th>W</th><th>HB</th></tr></thead>');
              let tbody = $('<tbody></tbody>');

              // Loop through ligands in series
              $.each(ligands, function(index, ligand) {
                // generate 
                structurePathsBySeries.push(ligand.PathToStructure) 
                // Create elements for Series-Structure tables
                
                // Switcher must be not a checkbox but normal switcher, but the
                // layout have to be refactored to div containers, so less pain
                // with aligning.
                // TODO work on it 
                let switcherVisible = createCheckbox('Visible', globalIndex);
                let switcherVisbileCell = $('<td>').append(switcherVisible);
                // Ligand name
                let ligandID = $('<td>', {
                  class: 'ligand-table row-header',
                  id: 'textboxLigandID' + globalIndex
                }).text(ligand.Ligand);
                // checkbox to toggle ribbon representation
                let checkboxRibbon = createCheckbox('Ribbon', globalIndex);
                let checkboxRibbonCell = $('<td>').append(checkboxRibbon);
                // checkbox to toggle protein licorice representation
                let checkboxLicorice = createCheckbox('Licorice', globalIndex);
                let checkboxLicoriceCell = $('<td>', {class: 'colored'}).append(checkboxLicorice);
                // colorpicker for protein licorice representation
                let colorpickerLicorice = createColorPicker('Licorice', randomHexColorString, globalIndex);
                let colorpickerLicoriceCell = $('<td>', {class: 'colored'}).append(colorpickerLicorice);
                // checkbox to toggle ligand licorice representation
                let checkboxLigandLicorice = createCheckbox('LigandLicorice', globalIndex);
                let checkboxLigandLicoriceCell = $('<td>').append(checkboxLigandLicorice);
                // colorpicker for ligand licorice representation
                let colorpickerLigandLicorice =
                  createColorPicker('LigandLicorice', randomHexColorString, globalIndex);
                let colorpickerLigandLicoriceCell = $('<td>').append(colorpickerLigandLicorice);
                // checkbox to toggle surface representation
                let checkboxSurface = createCheckbox('Surface', globalIndex);
                let checkboxSurfaceCell = $('<td>', {class: 'colored'}).append(checkboxSurface);
                // colorpicker for protein surface
                let colorpickerSurface = createColorPicker('Surface', randomHexColorString, globalIndex);
                let colorpickerSurfaceCell = $('<td>', {class: 'colored'}).append(colorpickerSurface);
                // checkbox to toggle ligand surface representation
                let checkboxLigandSurface = createCheckbox('LigandSurface', globalIndex);
                let checkboxLigandSurfaceCell = $('<td>').append(checkboxLigandSurface);
                // colorpicker for Ligand Surface representation
                let colorpickerLigandSurface =
                  createColorPicker('LigandSurface', randomHexColorString, globalIndex);
                let colorpickerLigandSurfaceCell = $('<td>').append(colorpickerLigandSurface);
                // checkbox to toggle water representation
                let checkboxWater = createCheckbox('Water', globalIndex);
                let checkboxWaterCell = $('<td>').append(checkboxWater);
                // checkbox to toggle interactions for hetero
                let checkboxInteractions = createCheckbox('Interactions', globalIndex);
                let checkboxInteractionsCell = $('<td>').append(checkboxInteractions);
                // Append ligandID and checkboxCell to row
                // append elements to the row. Order:
                // Ligand, Ribbon, Protein Licorice, Protein Licorice color, Ligand Licorice, Ligand Licorice Color,
                // Protein Surface, Protein Surface Color, Ligand Surface, Ligand Surface Color, Waters
                // 'C' is a place holder for the corresponding color picking element.
                let row = $('<tr></tr>');
                row.append(ligandID, switcherVisbileCell, checkboxRibbonCell, checkboxLicoriceCell, colorpickerLicoriceCell,
                  checkboxLigandLicoriceCell, colorpickerLigandLicoriceCell, checkboxSurfaceCell, colorpickerSurfaceCell,
                  checkboxLigandSurfaceCell, colorpickerLigandSurfaceCell, checkboxWaterCell, checkboxInteractionsCell);
                // Append row to tbody
                tbody.append(row);
                // Increment index
                globalIndex++;
              });
              tableSeries.append(thead, tbody);
              $('#checkboxContainer').append(tableSeries);
              $('#checkboxContainer').append('<br>');
              // Toggle ligandContainer visibility on plus button click
              // push elements of structurePathsBySeries array
              // to the end of pdbFiles global array.
              // TODO check behaviour, ngl sometimes requres to index
              // structures correctly!
              pdbFiles.push(...structurePathsBySeries);
            });
            // to ensure that event listeners in other .js scripts run only after the
            // content is completely generated by jQuery.
            // Run related code within $(document).on('contentReady', function() {}
            $(document).trigger('contentReady');
          },
          error: function(xhr, status, error) {
            $('#selectedInfo').text('Error fetching data for the selected project:' + error);
            $('#selectedInfo').show();
            console.error('Error fetching data for the selected project:', error);
          }
      });
  });
});
