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