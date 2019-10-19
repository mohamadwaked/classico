importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-dispatch.v1.min.js");
importScripts("https://d3js.org/d3-quadtree.v1.min.js");
importScripts("https://d3js.org/d3-timer.v1.min.js");
importScripts("https://d3js.org/d3-force.v1.min.js");
importScripts("https://d3js.org/d3.v5.min.js");




onmessage = function(event) {

        var nodes = event.data.nodes
        //console.log(nodes[0])
        //links = event.data.links;


        ///////////////////////////////////////////////////////////////////////////
		/////////////////////////////////// Scales ////////////////////////////////
		///////////////////////////////////////////////////////////////////////////


        // Set the dimensions of the canvas / graph
		var margin = { top: 152, right: 50, bottom: 150, left: 50 },
            width = 1200 - margin.left - margin.right,
            height = 1000 - margin.top - margin.bottom;


        // time Scales
		var time_scale = d3.scaleLinear()
			.domain([1910, 2020])
			.range([height-250, 0+205]);


        // vote Scale
	    var circle_Scale = d3.scaleSqrt()
            .domain([0, 600000])
			.range([1, 14]);


        ///////////////////////////////////////////////////////////////////////////
		/////////////////////////////////// Forces ////////////////////////////////
		///////////////////////////////////////////////////////////////////////////


        //var f_center = d3.forceCenter().x(-100).y(-100)
        var f_body = d3.forceManyBody()   // default = -30
        .strength(-10)
        .theta(1)
        //.strength(d => -d.value/3)
        //.distanceMin(10)
        //.distanceMax(10)


        
        var f_collide = d3.forceCollide()
        .strength(1)
        .radius(d => (circle_Scale(d.numVotes)*1.3)+0.7)
        //.radius(8)



        var f_x = d3.forceX()
        .x(0)
        .strength(0.9)  // 0-1



        var f_y = d3.forceY()
        .y((d,i) => time_scale(d.year))
        .strength(1)  // 0-1


        ///////////////////////////////////////////////////////////////////////////
		///////////////////////////////// Simulation //////////////////////////////
		///////////////////////////////////////////////////////////////////////////
        
        var simulation = d3.forceSimulation(nodes)
        .force("f_x", f_x)
        .force("f_y", f_y)
        .force("body", f_body)
        .force("collide", f_collide)
        .stop();

        //n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()))
        
        for (var i = 0, n = 60; i < n; ++i) { // n = 50
        
        postMessage({type: "tick", progress: i / n});
        simulation.tick();

        }
        
        //postMessage({type: "end", nodes: nodes, links: links});
        postMessage({type: "end", nodes: nodes});

};