document.addEventListener("DOMContentLoaded", async function() {
    const width = 960;
    const height = 600;

    const svg = d3.select("#my_dataviz")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .scale(130)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const temperatureData = await d3.csv("data/temperature_variations.csv");
    const historicalData = await d3.csv("data/historical_temperatures.csv");
    const temperatureMap = new Map(temperatureData.map(d => [d.country, +d.temperature_variation]));
    const historicalMap = new Map();

    historicalData.forEach(d => {
        if (!historicalMap.has(d.country)) {
            historicalMap.set(d.country, []);
        }
        historicalMap.get(d.country).push({ year: +d.year, temperature: +d.temperature });
    });

    const color = d3.scaleSequential(d3.interpolateRdBu)
        .domain([0, 50]); // Adjust the domain based on your data range

    const world = await d3.json("data/world-110m.json");
    const countries = topojson.feature(world, world.objects.countries).features;

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
        tooltip.select("#tooltip-variation").text(variation);

        const historicalTemps = historicalMap.get(country);
        if (historicalTemps) {
            const graphWidth = 200;
            const graphHeight = 100;
            const xScale = d3.scaleLinear()
                .domain(d3.extent(historicalTemps, d => d.year))
                .range([0, graphWidth]);
            const yScale = d3.scaleLinear()
                .domain(d3.extent(historicalTemps, d => d.temperature))
                .range([graphHeight, 0]);

            const line = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.temperature));

            const tooltipGraph = tooltip.select("#tooltip-graph").html("");

            const svgGraph = tooltipGraph.append("svg")
                .attr("width", graphWidth)
                .attr("height", graphHeight);

            svgGraph.append("path")
                .datum(historicalTemps)
                .attr("d", line)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5);
        }
    };

    const mouseLeave = function(d) {
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
        .data(countries)
        .join("path")
        .attr("d", path)
        .attr("fill", d => {
            const tempVar = temperatureMap.get(d.properties.name);
            return tempVar != null ? color(tempVar) : "#ccc";
        })
        .attr("stroke", "transparent")
        .attr("class", "Country")
        .style("opacity", 0.8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("click", function(event, d) {
            if (d.properties.name === "Greenland") {
                alert("Game Over! You hovered over Greenland.");
            }
        });

    console.log("Map plotted");
});
