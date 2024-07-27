charts.chart1 = function() {
  // Initialise layout variables
  const margin = {top: 50, right: 20, bottom: 50, left: 60};
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3.select("#svg1")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add a circle in the middle of the SVG
  svg.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", 50)
      .attr("fill", "steelblue");
};
