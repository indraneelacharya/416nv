document.addEventListener("DOMContentLoaded", async function() {
    const width = 960;
    const height = 600;

    const svg = d3.select("#my_dataviz")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .scale(130)
        .center([0, 20])
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const data = await d3.csv("data/game.csv");
    const temperatureMap = new Map(data.map(d => [d.CountryName, +d.Delta]));

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
        .domain([d3.max(data, d => +d.Delta),-5]); // Adjust the domain based on your data range

    const initialColor = "#487748"; // Very green

    const world = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");

    const tooltip = d3.select("#tooltip");

    const mouseOver = function(event, d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", 0.5);

        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");

        const country = d.properties.name;
        const variation = temperatureMap.get(country) || "No data";
        tooltip.classed("hidden", false)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        tooltip.select("#tooltip-country").text(country);
        // tooltip.select("#tooltip-variation").text(variation);
    };

    const mouseLeave = function() {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", 0.8);

        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "transparent");

        tooltip.classed("hidden", true);
    };

    svg.append("g")
        .selectAll("path")
        .data(world.features)
        .join("path")
        .attr("d", path)
        .attr("fill", initialColor)
        .attr("stroke", "transparent")
        .attr("class", "Country")
        .style("opacity", 0.8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("click", function(event, d) {
            const country = d.properties.name;
            const tempVar = temperatureMap.get(country);

            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", tempVar != null ? colorScale(tempVar) : initialColor);

            if (country === "Greenland") {
                alert("Game Over! You clicked on Greenland.");
            }
        });

    console.log("Map plotted");
});
