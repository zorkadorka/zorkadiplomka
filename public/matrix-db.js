console.log("matrix comming");

var margin = {top: 20, right: 10, bottom: 10, left: 10},
    width = 300,
    height = 300;

var numrows = 50;
var numcols = 50;

var svgFlies = preparation("flies");
var svgPlayer = preparation("player");
var svgFlower = preparation("flower");

var max = 474
var jsons = [];
 
$.get( "/gameids", function( data ) {
    var select = $('<select/>',{
        'class':"selectpicker",
        'data-live-search':"true"
    });
    data.forEach(function(d){
        select
            .append('<option value=' + d.game_id + '>' + d.game_id + '</option>');
    });
        
    select.appendTo("#selectContainer").selectpicker('refresh');       
    select.on("change", function(){
        var selected =  $('.selectpicker option:selected').val();
        loadData(selected);
    });
});  

function loadData(game_id){
    $.get( "/data-db/"+game_id, function( data ) {
        
        data.forEach(function(d){
            
        });
            
        select.appendTo("#selectContainer").selectpicker('refresh');       
        select.on("change", function(){
            var selected =  $('.selectpicker option:selected').val();
            loadData(selected);
        });
    });  
}

function loadNext(){
    if (index < max-1){
        index++;
    }
    else{ 
        index = 0; 
    }
    loadFile(index);
    
    setTimeout(loadNext, frame);
}

function prepareData(positions){
    var matrix = new Array(numrows);
    for (var i = 0; i < numrows; i++) {
        matrix[i] = new Array(numcols);
        for (var j = 0; j < numcols; j++) {
            matrix[i][j] = positions[i][j];
        }
    }
    return matrix;
}

var x, y, colorMap;
function preparation(folder){
     var svg = d3.select("body").select("."+folder)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", margin.left + "px")
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);
    x = d3.scaleLinear()
        .domain([0,numcols])
        .range([0, width]);

    y = d3.scaleLinear()
        .domain([0,numrows])
        .range([0, height]);
       
    colorMap = d3.scaleLinear()
        .domain([0, 1])
        .range(["white", "black"]);   
    return svg;

}

function draw(matrix, svg){
    svg.selectAll(".row").remove();
    var rows = svg.selectAll(".row")
        .data(matrix);
    var row = rows
    .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });
    
    
    var cells = row.selectAll(".cell")
        .data(function(d) { return d; });
    cells.enter().append("rect")
        .attr("class", "cell")
        .attr("data", function(d,i){
            return d;
        })
        .attr("x", function(d, i) { 
            return x(i); 
        })
        .attr("width", x(1))
        .attr("height", y(1));
    
    /*row.append("line")
        .attr("x2", width);*/

    row.selectAll(".cell")
        .data(function(d, i) { return matrix[i]; })
        .style("fill", colorMap);
}

function receivedText(e){
    var matrix1 = prepareData(e.flyPositions);
    var matrix2 = prepareData(e.playerPosition);    
    var matrix3 = prepareData(e.flowerPosition);
    
    draw(matrix1, svgFlies);
    draw(matrix2, svgPlayer);
    draw(matrix3, svgFlower);
}
    
function loadFile(id) {
    $.get( "/data/"+id, function( data ) {
        receivedText(data);
    });   
}
