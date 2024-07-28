document.addEventListener("DOMContentLoaded", function() {
    const width = 960;
    const height = 500;

    const svg = d3.select("#chart-container").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("rect")
        .attr("x", width / 2 - 50)
        .attr("y", height / 2 - 50)
        .attr("width", 100)
        .attr("height", 100)
        .style("fill", "green");
});
