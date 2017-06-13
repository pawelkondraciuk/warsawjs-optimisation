var createChartRect = Chartist.createChartRect;
Chartist.createChartRect = function (svg, options, fallbackPadding) {
  svg.height = function() {
    return svg._node.clientHeight;
  }
  svg.width = function() {
    return svg._node.clientWidth;
  }
  return createChartRect.apply(null, arguments);
};
