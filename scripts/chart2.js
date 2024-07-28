document.addEventListener("DOMContentLoaded", async function() {
    const data = [];
    // Load the data from the CSV file
    await d3.csv("data/sea_levels.csv", function(d) {
        data.push({
            year: +d.Year,
            month: +d.Month,
            meanSeaLevel: +d.MeanSeaLevel,
            delta: +d.Delta
        });
    });

    console.log("Data loaded:", data);

    const width = 960;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year d.month / 12))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.meanSeaLevel)).nice()
        .range([height - margin.bottom, margin.top]);

    const meanSeaLevelExtent = d3.extent(data, d => d.meanSeaLevel);

    const color = d3.scaleDiverging()
        .domain([meanSeaLevelExtent[1], 0, meanSeaLevelExtent[0]])
        .interpolator(d3.interpolateRdBu);

    const svg = d3.select("#chart-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("display", "block")
        .style("margin", "0 auto");

    console.log("SVG element created");

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .call(g => g.select(".domain").remove());

    console.log("X axis created");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, "+"))
        .call(g => g.select(".domain").remove());

    console.log("Y axis created");

    const triangleUp = d3.symbol().type(d3.symbolTriangle).size(5);
    const triangleDown = d3.symbol().type(d3.symbolTriangle).size(5).angle(Math.PI);

    svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("d", d => d.delta >= 0 ? triangleUp() : triangleDown())
        .attr("transform", d => `translate(${x(d.year + d.month / 12)},${y(d.meanSeaLevel)})`)
        .attr("fill", d => color(d.meanSeaLevel));

    console.log("Data points plotted");
});
