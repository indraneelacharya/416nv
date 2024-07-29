document.addEventListener("DOMContentLoaded", async function() {
    const data = [];
    
    // Load the data from the CSV file
    await d3.csv("data/temperatures_shrunk.csv", function(d) {
        const avgAnomaly = +d.Means;
        data.push({ year: +d.Year, avgAnomaly: avgAnomaly });
    });

    console.log("Data loaded:", data);

    const description1 = d3.select("#chart-container").append("div")
        .attr("id", "description1")
        .style("text-align", "center")
        .style("font-size", "16px")
        .style("margin-bottom", "10px")
        .html("<b>Global Temperature Anomalies Over Time</b><br>This chart shows the average temperature anomalies from 1880 to present, indicating how temperatures have deviated from the historical average.");

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
        .domain(d3.extent(data, d => d.avgAnomaly)).nice()
        .range([height - margin.bottom, margin.top]);

    const avgAnomalyExtent = d3.extent(data, d => d.avgAnomaly);

    const color = d3.scaleDiverging()
        .domain([avgAnomalyExtent[1], 0, avgAnomalyExtent[0]])
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

    // Calculate the line of best fit
    const xMean = d3.mean(data, d => d.year);
    const yMean = d3.mean(data, d => d.avgAnomaly);
    const numerator = d3.sum(data, d => (d.year - xMean) * (d.avgAnomaly - yMean));
    const denominator = d3.sum(data, d => (d.year - xMean) ** 2);
    const slope = numerator / denominator;
    const intercept = yMean - (slope * xMean);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(slope * d.year + intercept));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", line);

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
                .attr("cy", y(yearData.avgAnomaly))
                .attr("r", 4)
                .attr("fill", color(yearData.avgAnomaly))
                .attr("stroke", "#000")
                .attr("stroke-opacity", 0.2);

            svg.append("foreignObject")
                .attr("x", x(significant.year))
                .attr("y", 250)  // Adjust y position to appear lower on the graph
                .attr("width", 75)
                .attr("height", 150)
                .append("xhtml:div")
                .attr("class", "permanent-tooltip")
                .html(`Year: ${significant.year}<br>${significant.summary}`)
                .style("font-size", "12px")
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
        .attr("stroke-opacity", 0.2)
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.avgAnomaly))
        .attr("fill", d => color(d.avgAnomaly))
        .attr("r", 4)
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Year: ${d.year}<br>Avg Anomaly: ${d.avgAnomaly}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    console.log("Data points plotted");
});
