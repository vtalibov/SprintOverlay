$(document).ready(function() {
  // width is adjusted on the basis of StructuresInSeriesTable element.
  function adjustColumnSizes() {
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

  $(document).on('contentReady', function() {
    adjustColumnSizes();
  });

  $(window).on('resize', function() {
    adjustColumnSizes();
  });
});