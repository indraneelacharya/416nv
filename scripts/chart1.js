charts.chart1 = function() {
  // Initialise layout variables
  const width = 928;
  const height = 600;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 40;

  // Parse date and value from the CSV data
  d3.csv('data/temperatures.csv', function(d) {
    return {
      date: new Date(d.Year, d.Month - 1, 1), // Assuming Year and Month columns exist in the CSV
      value: +d.Value // Assuming Value column exists in the CSV
    };
  }, function(error, data) {
    if (error) throw error;

    // Create scales
    const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([marginLeft, width - marginRight]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.value)).nice()
        .range([height - marginBottom, marginTop]);

    const max = d3.max(data, d => Math.abs(d.value));

    // Create a symmetric diverging color scale
    const color = d3.scaleSequential(d3.interpolateRdBu)
        .domain([max, -max]);

    // Create SVG container
    const svg = d3.select("#svg1")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .call(g => g.select(".domain").remove());

    // Add Y axis
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "+"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
          .clone()
            .attr("x2", width - marginRight - marginLeft)
            .attr("stroke-opacity", d => d === 0 ? 1 : 0.1))
        .call(g => g.append("text")
            .attr("fill", "#000")
            .attr("x", 5)
            .attr("y", marginTop)
            .attr("dy", "0.32em")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Anomaly (°C)"));

    // Add data points
    svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
      .selectAll("circle")
      .data(data)
      .enter().append("circle")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("fill", d => color(d.value))
        .attr("r", 2.5);
  });
};
