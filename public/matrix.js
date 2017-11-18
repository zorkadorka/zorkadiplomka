console.log("matrix comming");

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 800,
    height = 800;

var numrows = 50;
var numcols = 50;
var autoplay = true;
var svgMatrix1 = preparation("state1");
var svgMatrix2 = preparation("state2");
var actionLabel = $('span.action');
var rewardLabel = $('span.reward');

var x = d3.scaleLinear()
    .domain([0,numcols])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0,numrows])
    .range([0, height]);

var colorMap = d3.scaleOrdinal()
    .domain(['0', '10', '11', '12', '13', '20', '21', '22', '23', '30', '31', '32', '33'])
    .range(["white", 
    "rgba(0,255,0,0.25)","rgba(0,255,0,0.5)","rgba(0,255,0,0.75)","rgba(0,255,0,1)",
     "rgba(255,0,0,0.25)","rgba(255,0,0,0.5)","rgba(255,0,0,0.75)","rgba(255,0,0,1)", 
    "rgba(0,0,255,0.25)","rgba(0,0,255,0.5)","rgba(0,0,255,0.75)","rgba(0,0,255,1)"]);   

    
var index = 0;
var gameId, min, max;
var allData;
function getMinMax(game_id){
    $.get( "/query/select min(id) as mn, max(id) as mx from \"RL\".experiences where game_id = '" + game_id+"'", 
    function( data ) {
        min = parseInt(data[0].mn)+50;
        max = data[0].mx;
        index = min;
        $('.play-btn').removeClass("disabled");
        $('#id').removeAttr('disabled');
        loadFile(index,game_id);
    });
}

function next(){
    if (index < max-1){
        index++;
    }
    else{ 
        index = max; 
    }
    loadFile(index, gameId);      
}
    
function prev(){
    if (index > 0){
        index--;
    }
    else{ 
        index = 0; 
    }
    loadFile(index, gameId);      
}
function play(){
    autoplay = true;
    next();        
}
function load(){
    var id = parseInt($("#id")[0].value);
    id = id < min ? min : id;
    id = id > max ? max : id;
    
    index = --id;
    next();
}
function stop(){
    autoplay = false;
}
function loadFile(id, game) {
    $.get( "/query/Select old_state, action, new_state, reward " +
        'from "RL".experiences where game_id = \''+ game+'\' and id = ' + id , function(data){
        allData  = data;
        $("#id")[0].value = id;
        makeGraph(game);
    });   
}
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
    
    return svg;

}
$.get( "/gameids/0", function( data ) {
    var select = $('<select/>',{
        'class':"selectpicker",
        'data-live-search':"true"
    });
    data.forEach(function(d){
        select.append('<option value=' + d.game_id + '>' + d.game_id + '</option>');
    });
        
    select.appendTo("#selectContainer").selectpicker('refresh');       
    select.on("change", function(){
        $('.play-btn').addClass("disabled");
        $('#id').attr('disabled','');
        var selected =  $('.selectpicker option:selected').val();
        gameId = selected;
        getMinMax(selected);
    });
});  

function makeGraph(game_id){
    receivedData(allData);
    function receivedData(e){
        var matrix ='00000000000000000000000000000000000000000000000000'.split('');// new Array(numrows);
        matrix = prepareData(JSON.parse(e[0].old_state)[0],
            JSON.parse(e[0].old_state)[4], JSON.parse(e[0].old_state)[8], '0', matrix);
        matrix = prepareData(JSON.parse(e[0].old_state)[1],
            JSON.parse(e[0].old_state)[5], JSON.parse(e[0].old_state)[9], '1', matrix);
        matrix = prepareData(JSON.parse(e[0].old_state)[2],
            JSON.parse(e[0].old_state)[6], JSON.parse(e[0].old_state)[10], '2', matrix);
        matrix = prepareData(JSON.parse(e[0].old_state)[3],
            JSON.parse(e[0].old_state)[7], JSON.parse(e[0].old_state)[11], '3', matrix);
            
        draw(matrix, svgMatrix1);
        
        var matrix2 ='00000000000000000000000000000000000000000000000000'.split('');// new Array(numrows);
        matrix2 = prepareData(JSON.parse(e[0].new_state)[0],
            JSON.parse(e[0].new_state)[4], JSON.parse(e[0].new_state)[8], '0', matrix2);
        matrix2 = prepareData(JSON.parse(e[0].new_state)[1],
            JSON.parse(e[0].new_state)[5], JSON.parse(e[0].new_state)[9], '1', matrix2);
        matrix2 = prepareData(JSON.parse(e[0].new_state)[2],
            JSON.parse(e[0].new_state)[6], JSON.parse(e[0].new_state)[10], '2', matrix2);
        matrix2 = prepareData(JSON.parse(e[0].new_state)[3],
            JSON.parse(e[0].new_state)[7], JSON.parse(e[0].new_state)[11], '3', matrix2);
            
        draw(matrix2, svgMatrix2);
        printLabel();
        
        if(autoplay){
            next();
        }
    }
    function printLabel(){
        actionLabel.text(allData[0].action);
        rewardLabel.text(allData[0].reward);
    }
    function prepareData(m1, m2, m3, per, matrix){
        for (var i = 0; i < numrows; i++) {
            if(matrix[i])
            if(matrix[i] == '0'){
                matrix[i] ='00000000000000000000000000000000000000000000000000'.split('');// new Array(numcols);
            }
            for (var j = 0; j < numcols; j++) {
                if(m1[i][j] == 1){
                    matrix[i][j] = '1'+per;
                }
                else if(m2[i][j] == 1){
                    matrix[i][j] = '2'+per;
                }
                else if(m3[i][j] == 1){
                    matrix[i][j] = '3'+per;
                }
            }
        }
        return matrix;
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

    
}