document.addEventListener("DOMContentLoaded", async function() {
    const data = [];
    
    // Load the data from the CSV file
    await d3.csv("data/temperatures_shrunk.csv", function(d) {
        const avgAnomaly = +d.Means;
        data.push({year: +d.Year, avgAnomaly: avgAnomaly});
    });

    console.log("Data loaded:", data);

    const width = 960;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.avgAnomaly)).nice()
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleSequential(d3.interpolateRdBu)
        .domain(d3.extent(data, d => -d.avgAnomaly));

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

    svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.avgAnomaly))
        .attr("fill", d => color(d.avgAnomaly))
        .attr("r", d => Math.abs(2));

    console.log("Data points plotted");
});
