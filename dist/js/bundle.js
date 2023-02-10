// window.$ = window.jQuery = require('jquery');
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


function hxlProxyToJSON(input){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

text_truncate = function(str, length, ending) {
    if (length == null) {
      length = 100;
    }
    if (ending == null) {
      ending = '...';
    }
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }
};

function createKeyFigure(target, title, className, value) {
  var targetDiv = $(target);
  //<p class='date small'><span>"+ date +"</span></p>
  return targetDiv.append("<div class='key-figure col-4'><div class='inner'><h3>"+ title +"</h3><div class='num " + className + "'>"+ numFormat(value) +"</div></div></div></div>");
}


function getFormattedDataByIndicator(indicator) {
    var data = [];
    var dataByInd = d3.nest()
        .key(function(d){ return d[indicator];})
        .rollup(function(d) { return d.length; })
        .entries(sbpFilteredData).sort(sort_value);

    var total = d3.sum(dataByInd, function(d){ return d.value ;});
    dataByInd.forEach( function(element, index) {
        var pct = (element.value/total)*100 ;
        data.push([element.key, pct]);
    });

   return data; 

}

function loadImg(url, done){
    var xhr = new XMLHttpRequest();
    xhr.onload = function () { return done(this.status) }
    xhr.open('HEAD', url, true);
    xhr.send();
}

function imageExists (url) {
    var test = true;
    loadImg(url, function(status){
        if (status == 404) test = false;
    });

    return test;
}

function getDataByIndicator(indicator) {
    var dataX = ['x'],
        dataY = [];
    var dataByInd = d3.nest()
        .key(function(d){ return d[indicator];})
        .rollup(function(d) { return d.length; })
        .entries(sbpFilteredData).sort(sort_value);

    dataByInd.forEach( function(element, index) {
        if(element.key != "n/a"){
            dataX.push(element.key);
            dataY.push(element.value);
        }
    });
    
    dataY.unshift('value');
   return [dataX, dataY]; 

}

var sort_value = function (d1, d2) {
    if (d1.value > d2.value) return -1;
    if (d1.value < d2.value) return 1;
    return 0;
}
var numFormat = d3.format(',');
var percentFormat = d3.format('.0%');
const DATA_URL = 'https://proxy.hxlstandard.org/api/data-preview.json?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F15Y2BzrOHy_8Vh1BvO1FuotowdtFQHOUtedguzLGdhQA%2Fedit%23gid%3D306007431&format=csv&force=on';
 //const DATA_URL ='https://proxy.hxlstandard.org/api/data-preview.json?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F15Y2BzrOHy_8Vh1BvO1FuotowdtFQHOUtedguzLGdhQA%2Fedit%23gid%3D306007431&format=csv';
// const DATA_URL = 'https://proxy.hxlstandard.org/api/data-preview.json?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1exDoZsA8UQx-U5YGSS4zxivfPIOUf8-ts2CbavV7Mvg%2Fedit%23gid%3D484816643&sheet=1&format=csv';
let isMobile = $(window).width()<600? true : false;
let geoDataURL = 'data/worldmap.json';

let geomData, 
    sbp,
    sbpData,
    sbpFilteredData;

let dataByAgencies, 
    dataByRoster;

let dataFilterBy = 'Organization'; 

let countries = [],
    dutyStations = [];


let mapCountryColor = '#FFBB8E';'#FFAD6E';'#FF9949';'#FF8823';'#FF7600';

let zoom, g, mapsvg, markerScale;

let yearFilter ; //$('#yearSelect').val();

$( document ).ready(function() {


  function getData() {

    Promise.all([
      d3.json(geoDataURL),
      d3.csv(DATA_URL)
    ]).then(function(data){
      geomData = topojson.feature(data[0], data[0].objects.geom);
      var monthColLabel = "ms_in_"+yearFilter;
      data[1].forEach( function(element, index) {
        (element[monthColLabel] == "na") ? element[monthColLabel] = 0 : '';
      });
      sbp = data[1];
      generateYearSelect();
      sbpData = sbp.filter(function(d){ 
        return (d['Deployment Year Started']==yearFilter && d['Met/Unmet']=='Met'); 
      });
      // console.log(sbpData);
      sbpFilteredData = sbpData;

      sbpFilteredData.forEach( function(element, index) {
        countries.includes(element['ISO3 code']) ? '' : countries.push(element['ISO3 code']);
        dutyStations.includes(element['Duty Station']) ? '' : dutyStations.push(element['Duty Station']);
      });

  
      dataByAgencies = d3.nest()
        .key(function(d){ return d['Organization']; })
        .rollup(function(d) { return d.length; })
        .entries(sbpFilteredData).sort(sort_value);


      dataByRoster = d3.nest()
        .key(function(d){ return d['Partner/Organisation']; })
        .rollup(function(d) { return d.length; })
        .entries(sbpFilteredData).sort(sort_value);

      
      initDisplay();
      initMap();
      drawRankingChart(dataByAgencies);
      noteOnYear();
 
      //remove loader and show vis
      $('.loader').hide();
      $('main, footer').css('opacity', 1);
    });
  } //getData

  function initDisplay() {
  // key figures
    var deployments = d3.sum(dataByAgencies, function(d){ return d.value;});
    createKeyFigure("#keyfig", "Deployments", "deployments", deployments);
    createKeyFigure("#keyfig", "Countries", "countries", countries.length-1);
    createKeyFigure("#keyfig", "Duty Stations", "dutyStations", dutyStations.length-1);
 
    // donut charts
    var langData = getFormattedDataByIndicator('Language Requirements');
    var genderData  = getFormattedDataByIndicator('Gender');
    var levelData  = getFormattedDataByIndicator('Grade');
    // var statusData = getFormattedDataByIndicator('Met/Unmet');


    var pieLangTitle = 'Language Requirements',
        pieGenderTitle = 'Deployments by Gender',
        pieLevelTitle = 'Deployments by Level',
        pieStatusTitle = 'Deployments Status';

    $('#piecharts').append('<div class="pie col-4"><div><h3 class="header">'+pieLangTitle+'</h3><div id="pieLang"></div></div>');
    $('#piecharts').append('<div class="pie col-4"><div><h3 class="header">'+pieGenderTitle+'</h3><div id="pieGender"></div></div>');
    $('#piecharts').append('<div class="pie col-4"><div><h3 class="header">'+pieLevelTitle+'</h3><div id="pieLevel"></div></div>');
    // $('#piecharts').append('<div class="pie col-3"><div><h3 class="header">'+pieStatusTitle+'</h3><div id="pieStatus"></div></div>');

    donutLang = generatePieChart(langData, 'pieLang');
    donutGender = generatePieChart(genderData, 'pieGender');
    donutLevel = generatePieChart(levelData, 'pieLevel');
    // donutStatus = generatePieChart(statusData, 'pieStatus');

    // bar chart

    var positionData = getDataByIndicator('Functional');
    //var partnerData = getDataByIndicator('Partner/Organisation');
    var funderData = getDataByIndicator('Nationality');

    var barchartPositionTitle = 'Deployments by Function',
        barchartOrgTitle = 'Deployments by Partner Organization',
        barchartFunderTitle = 'Deployments by Nationality';

    $('#barcharts').append('<div class="barchart col-6"><div><h3 class="header">'+barchartPositionTitle+'</h3><div id="barchartPosition"></div></div>');
    // $('#barcharts').append('<div class="barchart col-6"><div><h3 class="header">'+barchartOrgTitle+'</h3><div id="barchartOrg"></div></div>');
    $('#barcharts').append('<div class="barchart col-6"><div><h3 class="header">'+barchartFunderTitle+'</h3><div id="barchartFunder"></div></div>');

    barchartPosition = generateBarChart(positionData, 'barchartPosition');
    //barchartOrg = generateBarChart(partnerData, 'barchartOrg');
    barchartFunder = generateBarChart(funderData, 'barchartFunder');
  } //initDisplay


  function drawMap(){
    var width = $('#map').width();//viewportWidth;
    var height = 400;//(isMobile) ? viewportHeight * .5 : viewportHeight;
    var mapScale = width/5.5;//(isMobile) ? width/3.5 : width/5.5;
    var mapCenter = [25, 8];//(isMobile) ? [10, 30] : [75, 8];


    var projection = d3.geoMercator()
      .center(mapCenter)
      .scale(mapScale)
      .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    mapsvg = d3.select('#map')
               .append('svg')
               .attr("width", width)
               .attr("height", height);
               // .call(zoom)
               // .on("wheel.zoom", null)
               // .on("dblclick.zoom", null);

    mapsvg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%");

    //tooltip
    var maptip = d3.select('#map').append('div').attr('class', 'd3-tip map-tip hidden');

    //draw map
    g = mapsvg.append("g").attr('id', 'pays')
        .selectAll("path")
        .data(geomData.features)
        .enter()
          .append("path")
          .attr("class", "map-regions")
          .attr("id", function(d) {
            return d.properties.ISO_A3;
          })
          .attr("d", path);
          // .attr("fill", function(d){
          //   var color = '#F2F2EF';
          //   countries.includes(d.properties.ISO_A3) ? color = mapCountryColor : '';
          //   return color;
          // });
    
    //fill
    choroplethMap();

    var tipPays = d3.select('#pays').selectAll('path') 
          .on("mousemove", function(d){ 
            var select = $('#rankingSelect').val();
            var countryData = sbpFilteredData.filter(c => c['ISO3 code'] == d.properties.ISO_A3);
            if (countryData.length != 0) {
              var orgs = [];
              countryData.forEach( function(element, index) {
                orgs.includes(element['Organization']) ? '' : orgs.push(element['Organization']);
              });
              
              var content = '<h4>' + d.properties.NAME_LONG + '</h4>';

              if (select =="days") {
                var label = "ms_in_"+yearFilter;
                var dataByMetric = d3.nest()
                    .key(function(d){ return d['ISO3 code']; })
                    // .rollup(function(v) { return d3.sum(v, function(d) { return d['Total Days']; }); })
                    .rollup(function(v) { return d3.sum(v, function(d){ return Number(d[label]); })})
                    .entries(countryData);
                content += 'Deployments (months): ' + numFormat(dataByMetric[0].value) + '<br/>';
              } else {
                content += 'Deployments: ' + numFormat(countryData.length) + '<br/>';
              }

              var gender = d3.nest()
                  .key(function(d){ return d['Gender']; })
                  .rollup(function(d){ return d.length; })
                  .entries(countryData).sort(sort_value);

              content += 'UN agencies: ' + numFormat(orgs.length)+ '<br/>';
              //gender
              content += 'Gender: <ul>';
              var total = d3.sum(gender, function(d){ return d.value; });
              gender.forEach( function(element, index) {
                var pct = ((element.value/total)*100).toFixed(0) ;
                content += '<li>'+element.key + ': ' + pct + '%' + '</li>';
              });
              content += '</ul>';
              showMapTooltip(d, maptip, content);
            }

          })
          .on("mouseout", function(d) { 
            hideMapTooltip(maptip); 
          });
  }

  var date_sort = function (d1, d2) {
    if (d1 < d2) return 1;
    if (d1 > d2) return -1;
    return 0;
  }

  function generateYearSelect() {
    var dateRanges = [];
    sbp.forEach(element => {
      dateRanges.includes(element['Deployment Year Started']) ? '' : dateRanges.push(element['Deployment Year Started']);
    });
    var arr = [] ;
    dateRanges.forEach(element => {
      element >= "2018" ? arr.push(element) : null;
    });
    arr.sort(date_sort);
    var options = '';
    for (let i = 0; i < arr.length; i++) {
      i == 0 ? options += '<option value="' + arr[i] + '" selected>' + arr[i] + '</option>' :
        options += '<option value="' + arr[i] + '">' + arr[i] + '</option>';
    }
    yearFilter = arr[0];
    $('#yearSelect').html(options);
    console.log(options);
  }//generateYearSelect


  /*********************/
  /*** MAP FUNCTIONS ***/
  /*********************/

  function initMap(){
    setTimeout(function() {
      drawMap();
    }, 100);
  }
var partialDataYears = ["2018", "2021"];
function noteOnYear () {
  if (partialDataYears.includes(yearFilter)) {
    $('header h1 span').text("");
  } else {
    $('header h1 span').text("");
  }
}

function zoomed (argument) {
  console.log("zoomed")
}

  function showMapTooltip(d, maptip, text){
    var mouse = d3.mouse(mapsvg.node()).map( function(d) { return parseInt(d); } );
    maptip
        .classed('hidden', false)
        .attr('style', 'left:'+(mouse[0]+20)+'px;top:'+(mouse[1]+20)+'px')
        .html(text)
  }

  function hideMapTooltip(maptip) {
      maptip.classed('hidden', true) 
  }

  //

$("input[name='agencies']").change(function() {
  if(this.checked) {
      $("input[name='roster']").prop('checked', false);
      dataFilterBy = 'Organization';
      d3.select('#rankingChart').select('svg').remove();
      drawRankingChart(dataByAgencies);

      // reset select to default
      var select = $('#rankingSelect').val();
      select != 'months' ? $('#rankingSelect').val('months') : '';

      updateViz();
  }
});

$("input[name='roster']").change(function() {
  if(this.checked) {
      $("input[name='agencies']").prop('checked', false);
      dataFilterBy = 'Partner/Organisation';
      d3.select('#rankingChart').select('svg').remove();
      drawRankingChart(dataByRoster);
      

      // reset select to default
      var select = $('#rankingSelect').val();
      select != 'months' ? $('#rankingSelect').val('months') : '';

      updateViz();
  }
});

$('#rankingSelect').on('change', function(e){
  var select = $('#rankingSelect').val();
  var data = (dataFilterBy == 'Organization') ? dataByAgencies : dataByRoster ; 
  
  if (select == "days") {
    var label = "ms_in_"+yearFilter;
    data = d3.nest()
        .key(function(d){ return d[dataFilterBy]; })
        // .rollup(function(v) { return d3.sum(v, function(d){ return Number(d['Total Days']);})})
        .rollup(function(v) { return d3.sum(v, function(d){ return Number(d[label]); })})
        .entries(sbpData).sort(sort_value);
  }
  d3.select('#rankingChart').select('svg').remove();
  drawRankingChart(data);
  updateViz();
});

$('#yearSelect').on('change', function(e){
  var newYear = $('#yearSelect').val();
  if (newYear != yearFilter) {
    yearFilter = newYear;
    noteOnYear();
    sbpData = sbp.filter(function(d){ return (d['Deployment Year Started']==yearFilter && d['Met/Unmet']=='Met');  });
    sbpFilteredData = sbpData;
    //console.log(sbpData)
    dataByAgencies = d3.nest()
      .key(function(d){ return d['Organization']; })
      .rollup(function(d) { return d.length; })
      .entries(sbpFilteredData).sort(sort_value);

    dataByRoster = d3.nest()
      .key(function(d){ return d['Partner/Organisation']; })
      .rollup(function(d) { return d.length; })
      .entries(sbpFilteredData).sort(sort_value);

    // reset select to default
    var select = $('#rankingSelect').val();
    select != 'months' ? $('#rankingSelect').val('months') : '';
    $("input[name='agencies']").prop('checked', true);
    $("input[name='roster']").prop('checked', false);

    d3.select('#rankingChart').select('svg').remove();
    drawRankingChart(dataByAgencies);
    updateViz();
  }
});

  function initTracking() {
    //initialize mixpanel
    let MIXPANEL_TOKEN = '';
    mixpanel.init(MIXPANEL_TOKEN);
    mixpanel.track('page view', {
      'page title': document.title,
      'page type': 'datavis'
    });
  }

  getData();
  //initTracking();
});