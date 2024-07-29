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
                .attr("x", x(significant.year) + 5)
                .attr("y", height - margin.bottom - 80)  // Adjust y position to appear lower on the graph
                .attr("width", 50)
                .attr("height", 50)
                .append("xhtml:div")
                .attr("class", "permanent-tooltip")
                .html(`Year: ${significant.year}<br>${significant.summary}<br>Avg Anomaly: ${yearData.avgAnomaly}`)
                .style("font-size", "9px")
                .style("background", "white")
                .style("border", "1px solid #ccc")
                .style("padding", "8px")
                .style("border-radius", "4px")
                .style("box-shadow", "0px 0px 5px rgba(0, 0, 0, 0.3)");
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
