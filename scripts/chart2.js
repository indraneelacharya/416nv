document.addEventListener("DOMContentLoaded", async function() {
    const data = [];
    // Load the data from the CSV file
    await d3.csv("data/sea_levels.csv", function(d) {
        data.push({
            year: +d.Year,
            meanSeaLevel: +d.MeanSeaLevel,
            delta: +d.Delta
        });
    });

    console.log("Data loaded:", data);

    const significantYears = [
        { year: 1856, summary: "Eunice Newton Foote hypothesizes Greenhouse Effect." },
        { year: 1969, summary: "First coupled ocean-atmosphere general circulation model." },
        { year: 1985, summary: "NOAA deploys TAO buoy array for ENSO predictions." },
        { year: 1998, summary: "Michael Mann publishes 'hockey stick' climate graph." }
    ];

    const width = 960;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
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

    const triangle = d3.symbol().type(d3.symbolTriangle).size(50);
    const r = d => d.delta >= 0 ? 0 : 180;

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Draw significant year lines and permanent tooltips
    significantYears.forEach(significant => {
        const yearData = data.find(d => d.year === significant.year);
        if (yearData) {
            svg.append("line")
                .attr("x1", x(significant.year))
                .attr("x2", x(significant.year))
                .attr("y1", margin.top)
                .attr("y2", height - margin.bottom)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4");

            svg.append("circle")
                .attr("cx", x(significant.year))
                .attr("cy", y(yearData.meanSeaLevel))
                .attr("r", 4)
                .attr("fill", color(yearData.meanSeaLevel))
                .attr("stroke", "#000")
                .attr("stroke-opacity", 0.2);

            svg.append("foreignObject")
                .attr("x", x(significant.year))
                .attr("y", 250)  // Adjust y position to appear lower on the graph
                .attr("width", 80)
                .attr("height", 100)
                .append("xhtml:div")
                .attr("class", "permanent-tooltip")
                .html(`Year: ${significant.year}<br>${significant.summary}<br>Mean Sea Level: ${yearData.meanSeaLevel}`)
                .style("font-size", "9px")
                .style("background", "white")
                .style("border", "1px solid #ccc")
                .style("padding", "8px")
                .style("border-radius", "4px")
                .style("box-shadow", "0px 0px 5px rgba(0, 0, 0, 0.3)")
                .style("transform-origin", "left top");
        }
    });

    svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.5)
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("d", triangle)
        .attr("transform", d => `translate(${x(d.year)},${y(d.meanSeaLevel)}) rotate(${r(d)})`)
        .attr("fill", d => color(d.meanSeaLevel));

    console.log("Data points plotted");
});
