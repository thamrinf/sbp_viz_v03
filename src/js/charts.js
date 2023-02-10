var dimension, group, 
	leftBarChart;
// var mapColorRange = ['#F7B966', '#F5A233', '#F28B00'];
var mapColorRange = ['#F7B966', '#F6AE4D', '#F5A233', '#F3971A', '#F28B00'];

function drawRankingChart(data) {
	var margin = {top: 30, right: 40, bottom: 0, left: 14};
	var width = $('#rankingChart').width() + margin.left;
	var barColor = '#009EDB';
  	var barHeight = 8;
  	var barPadding = 45;
  	var height = (barHeight + barPadding) * (data.length+1);
  	var labelOffset = 8;

  	var total = d3.sum(data, function(d){ return d.value;});

	var maxVal = data[0].value; 
	//clone data
  	var dataPlus = [...data];
  	dataPlus.unshift({key: "Global", value: total });
  	maxVal = dataPlus[0].value; 

	var x = d3.scaleLinear()
	    .domain([0, maxVal])
	    .range([0, width - margin.left - margin.right]);

	  // set the ranges
	var y = d3.scaleBand().range([0, height]);
	  y.domain(data.map(function(d) { return d.value; }));

	var svg = d3.select('#rankingChart').append('svg')
				.attr('width', width)
				.attr('height', height)
				.append('g')
				.attr('transform', 'translate('+ margin.left + ',' + margin.top +')');

	// append bars
	bars = svg.selectAll('.bar')
		.data(dataPlus)
		.enter().append('g')
		.attr('class', function(d,i) {
			var className = (i==0) ? 'bar-container selected' : 'bar-container';
			return className;
		})
		.attr('transform', function(d, i) { return 'translate(' + 0 + ', ' + (i*(barHeight+barPadding)) + ')'; });

	bars.append('rect')
	    .attr('class', 'bar-button')
	    .attr('fill', '#FFF')
	    .attr('height', barHeight+barPadding)
	    .attr('width', width)
		.attr('transform', function(d, i) { return 'translate(-15,-30)'; })
		.on('mouseover', function(d) {
			$(this).parent().addClass('active');
		})
		.on('mouseout', function(d) {
			$(this).parent().removeClass('active');
		})
	    .on('click', function(d){
	    	updateViz(d.key);
	    	$('.bar-container').removeClass('selected');
			$(this).parent().addClass('selected');
	    });

	bars.append('rect')
	    .attr('class', 'bar')
	    .attr('fill', barColor)
	    .attr('height', barHeight)
	    .attr('x', 50)
	    .attr('width', function(d) {
	    	var w = x(d.value);
      		if (w<0) w = 0;
      		if(w == x(maxVal)) w -= 50;
      		return w;
	    });

	var noLogo = [];// ['Global', 'Ministry of Foreign Affairs Iceland','Emergency Services Academy Finland (Pelastusopoisto)'];
	bars.append('image')
		.attr('xlink:href', function(d){
			var file = 'assets/logo/'+d.key+'.png';
			noLogo.includes(d.key) ? file = 'assets/logo/generic.png' : '';
			return file; 
		})
		.attr('width', 40)
		.attr('height', 35)
		.attr('x', function(d) {
	      return 0;
	    })
	    .attr('y', function(d) { 
	    	return -labelOffset -14; 
	    });

	 // add min/max labels
	bars.append('text')
	    .attr('class', 'label-num')
	    .attr('x', function(d) {
	      return 200;
	    })
	    .attr('y', function(d) { return -labelOffset; })
	    .text(function (d) {
	      return d3.format(',')(d.value);
	    });

	bars.append('text')
	    .attr('class', 'label-num')
	    // .attr('text-anchor', 'start')
	    .attr('x', 50)
	    .attr('y', function(d) { return -labelOffset; })
	    .text(function (d) {
	    	var txt = d.key ;
	    	if(d.key.length >21){
	    		txt = text_truncate(txt, 21);
	    	}
	      return txt;
	    });
}

var donutLang, donutGender, donutLevel, donutStatus;
var colorArray = {
	pieLang: ['#206E80','#268592','#2A939E','#2FA4AA','#33B2B6','#38C1C2','#3DD0CE','#33B0CC'],
	pieGender: ['#90A19D','#ADB9B5','#C9D2CD','#E2E4E4'],
	pieLevel: ['#28A02C','#5EB861','#79C47B','#94CF95','#AFDBB0','#CAE7CA'],
	pieStatus: ['#1EBFB3', '#C7EFEC'],
};

function generatePieChart(data, bind) {
	var chart = c3.generate({
		bindto: '#'+bind,
		size: { height: 200},
		data: {
			columns: data,
			type: 'donut'
		},
		color: {
			pattern: colorArray[bind]
		},
		legend: {
			//hide: getLegendItemToHide(data)
			show: false
		}
	});

	return chart ;
}

function getLegendItemToHide(data) {
	var items = [];
	for (var i = data.length - 1; i > 1; i--) {
	 	items.push(data[i][0]);
	 } 
	 return items;
}

var barchartPosition,
	barchartOrg,
	barchartFunder;

var barchartTicks = {
	          	outer: false,
	          	multiline: false,
	          	fit: true,
	          };

function generateBarChart(data, bind) {
	var hauteur = (data[0].length > 5) ? 900 : 250;
	var funderTicks = {
			    outer: false,
	          	multiline: true,
	          	multilineMax: 1,
	          	fit: true,
			};
	var ticks = (bind == "barchartFunder") ? ticks = funderTicks : barchartTicks;
	var chart = c3.generate({
		bindto: '#'+bind,
		size: { height: hauteur },
		padding: {right: 10, left: 180},
	    data: {
	        x: 'x',
	        columns: data,
	        type: 'bar'
	    },
	    bar: {
	    	width: 10
	    },
	    color: {
	    	pattern: ['#009EDB']
	    },
	    axis: {
	        rotated : true,
	      x: {
	          type : 'category',
	          tick: ticks
	      },
	      y: {
	      	tick: {
	      		outer: false,
	      		format: d3.format('d'),
	      		count: 5
	      	}
	      } 
	    },
	    grid: {
	      	y: {
	      		show: true
	      	}
	    },
	    legend: {
	    	show: false
	    },
	    tooltip: {
	    	format: {
	    		value: function(value){
	    			return d3.format('d')(value)
	    		}
	    	}
	    }
	}); 
	return chart;

}//generateBarChart

function updateViz(filter) {
	if (filter == undefined || filter == "Global") {
		sbpFilteredData = sbpData;
	} else {
		sbpFilteredData = sbpData.filter(function(d){
		  return d[dataFilterBy] == filter ;
		});
	}

	var countries = [],
		dutyStations = [];
	sbpFilteredData.forEach( function(element, index) {
		countries.includes(element['ISO3 code']) ? '' : countries.push(element['ISO3 code']);
        dutyStations.includes(element['Duty Station']) ? '' : dutyStations.push(element['Duty Station']);
	});

	// update key figures
	// createKeyFigure("#keyfig", "Deployments", "deployments", deployments);
    d3.select('.deployments').text(sbpFilteredData.length);
    d3.select('.countries').text(countries.length);
    d3.select('.dutyStations').text(dutyStations.length);

	//update map
	choroplethMap();


	//update donuts 
	var langData = getFormattedDataByIndicator('Language Requirements');
	var genderData  = getFormattedDataByIndicator('Gender');
    var levelData  = getFormattedDataByIndicator('Grade');
    // var statusData  = getFormattedDataByIndicator('Met/Unmet');

	donutLang.load({columns: langData, unload: true });
	donutGender.load({columns: genderData, unload: true });
	donutLevel.load({columns: levelData, unload: true });
	// donutStatus.load({columns: statusData, unload: true });

	var positionData = getDataByIndicator('Functional');
	// var partnerData = getDataByIndicator('Partner/Organisation');
	var funderData = getDataByIndicator('Nationality');
	
	var hauteur = (funderData[0].length-1 > 5) ? 900: 250;

	if(positionData[0].length==2 && positionData[0][1]==""){
		$('#nochart').remove();
    	d3.select('#barchartPosition svg').attr('class', 'hidden');
		$('#barchartPosition').append('<div id="nochart">No chart to display</div>');

	} else {
		$('#nochart').remove();
		d3.select('#barchartPosition svg').classed('hidden', false);
		barchartPosition.load({columns: positionData, unload: true });
		barchartPosition.resize({height: hauteur });	

	}

	
	// barchartOrg.load({columns: partnerData, unload: true });
	// barchartOrg.resize({height: hauteur});
	barchartFunder.load({columns: funderData, unload: true });
	barchartFunder.resize({height: hauteur});
}	


function choroplethMap() {
	var data = d3.nest()
			.key(function(d){ return d['ISO3 code']; })
			.rollup(function(d){ return d.length; })
			.entries(sbpFilteredData).sort(sort_value);

	
	var legendTitle = "Number of Deployments";
	var select = $('#rankingSelect').val();

	if (select == "days") {
		var label = "ms_in_"+yearFilter;
		data = d3.nest()
			.key(function(d){ return d['ISO3 code']; })
			// .rollup(function(v) { return d3.sum(v, function(d) { return d['Total Days']; }); })
			.rollup(function(v) { return d3.sum(v, function(d){ return Number(d[label]); })})
			.entries(sbpFilteredData).sort(sort_value);

		// legendTitle = "Number of Deployments (Days)";
	}

	var max = data[0].value;

	var mapScale = d3.scaleQuantize()
			.domain([0, max])
			.range(mapColorRange);
    
    mapsvg.selectAll('path').each( function(element, index) {
        d3.select(this).transition().duration(500).attr('fill', function(d){
            var filtered = data.filter(pt => pt.key== d.properties.ISO_A3);
            var num = (filtered.length != 0) ? filtered[0].value : null ;
            var clr = (num == null) ? '#F2F2EF' : mapScale(num);
            return clr;
        });
    });

    // var legend = d3.legendColor()
    //   .labelFormat(d3.format(',.0f'))
    //   .title(legendTitle)
    //   .cells(mapColorRange.length)
    //   .scale(mapScale);


    // d3.select('#legend').remove();

    // var div = d3.select('#map');
    // var svg = div.append('svg')
    // 	.attr('id', 'legend')
    //   	.attr('height','115px');
    //   	//.attr("transform", "translate(5, -80)");
    
    // svg.append('g')
    //   .attr('class', 'scale')
    //   .call(legend);

} //choroplethMap

