document.addEventListener("DOMContentLoaded", function() {
    const width = 960;
    const height = 500;

    const svg = d3.select("#chart-container").append("svg")
        .attr("width", width)
        .attr("height", height);

    const points = [
        { x: width / 2, y: height / 2 - 50 },
        { x: width / 2 - 50, y: height / 2 + 50 },
        { x: width / 2 + 50, y: height / 2 + 50 }
    ];

    svg.append("polygon")
        .attr("points", points.map(p => `${p.x},${p.y}`).join(" "))
        .style("fill", "red");
    
});
