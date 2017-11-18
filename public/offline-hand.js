$.get( "/gameids/1", function( data ) {
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
        make_graph(selected);
    });
    var selected =  $('.selectpicker option:selected').val();
    make_graph(selected);
});  

function make_graph(game_id){
    $.get( "/hand/"+game_id, function( data ) {
    buildGraph(prepareData(data), 
        "#graph-hand", "Differences of actions");
    });
}

function prepareData(data){
    var result = [];
    var akt = {
        action: -1, count : -1
    };
    data.forEach(function(d,i){
        /*if(akt.action == d.action){
            akt.count++;
        }else{*/
            if(akt.action != -1){
                akt.diff = Math.abs(akt.action - d.action);
                result.push(akt.diff);
            }
            akt = {
                action: d.action,
                count: 1                
            }
        //}        
    });
    return result;
}
    
function buildGraph(data, id, yText){
    var m = [30, 10, 10, 50]; // margins
    var w = 1000 - m[1] - m[3]; // width
    var h = 400 - m[0] - m[2]; // height
    
    var min = d3.min(data);    
    var max = d3.max(data);
    
    var x = d3.scaleLinear().domain([0, data.length]).range([0, w]);
    var y = d3.scaleLinear().domain([min, max]).range([h, 0]);
    
    var line = d3.line()
        .x(function(d,i) { 
            return x(i); 
        })
        .y(function(d) { 
            return y(d); 
        });
        d3.select(id).selectAll("svg").remove();
        
        var graph = d3.select(id).append("svg")
                .attr("width", w + m[1] + m[3])
                .attr("height", h + m[0] + m[2])
            .append("g")
                .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        // create yAxis
        var xAxis = d3.axisBottom().scale(x).tickSize(-h).ticks(20);
        var g = graph.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + h + ")")
                .call(xAxis);
                

        var yAxisLeft = d3.axisLeft().scale(y);
        graph.selectAll("dot")
            .data(data)
        .enter().append("circle")
            .attr("r", 0.7)
            .attr("cx", function(d,i) { return x(i); })
            .attr("cy", function(d) { return y(d); });
        graph.append("g")
                .attr("class", "y axis")
                .call(yAxisLeft)
                .append("g")
                .attr("transform", "translate(0,-25)")
                .append("text")
                .attr("fill", "#000")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text(yText);              

            graph.append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 0.5)
        .attr("d", line(data));
}