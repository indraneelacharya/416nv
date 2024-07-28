document.addEventListener("DOMContentLoaded", async function() {
    const data = [];
    
    // Load the data from the CSV file
    await d3.csv("data/temperatures.csv", function(d, i, columns) {
        for (let i = 1; i < 13; ++i) { // pivot longer
            data.push({date: new Date(Date.UTC(d.Year, i - 1, 1)), value: +d[columns[i]]});
        }
    });

    console.log("Data loaded:", data);

    const width = 928;
    const height = 600;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.value)).nice()
        .range([height - margin.bottom, margin.top]);

    const max = d3.max(data, d => Math.abs(d.value));

    // Create a symmetric diverging color scale.
    const color = d3.scaleSequential()
        .domain([max, -max])
        .interpolator(d3.interpolateRdBu);

    const svg = d3.select("#chart-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("display", "block")
        .style("margin", "0 auto");

    svg.append("rect")
        .attr("x", width / 2 - 50)
        .attr("y", height / 2 - 50)
        .attr("width", 100)
        .attr("height", 100)
        .style("fill", "green");

    console.log("SVG element created");

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .call(g => g.select(".domain").remove());

    console.log("X axis created");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, "+"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .clone()
            .attr("x2", width - margin.left - margin.right)
            .attr("stroke-opacity", d => d === 0 ? 1 : 0.1))
        .call(g => g.append("text")
            .attr("fill", "#000")
            .attr("x", 5)
            .attr("y", margin.top)
            .attr("dy", "0.32em")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Anomaly (°C)"));

    console.log("Y axis created");

    svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("fill", d => color(d.value))
        .attr("r", 2.5);

    console.log("Data points plotted");
});
