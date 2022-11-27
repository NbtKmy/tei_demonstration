
/////////////////
/// Get a Map ///
/////////////////

var map = L.map('map').setView([29.954722, -90.075], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


///////////////////////////
/// Get local TEI files ///
///////////////////////////



function teiParser(){
        let inputs = document.querySelector('#file').files;
        
        var features_arr = [];
        var markers = L.markerClusterGroup();
        
        //console.log(inputs.length);
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];

            let f = {};
            
            const reader = new FileReader();
            reader.addEventListener('load', function (e){
                let res_test = reader.result;
                const teiData = new window.DOMParser().parseFromString(res_test, "text/xml");
            
                let sent_corr = teiData.evaluate('//tei:correspAction[@type="sent"]//tei:persName', teiData, prefix => prefix === 'tei' ? 'http://www.tei-c.org/ns/1.0' : null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                let sent_geo = teiData.evaluate('//tei:correspAction[@type="sent"]//tei:geo', teiData, prefix => prefix === 'tei' ? 'http://www.tei-c.org/ns/1.0' : null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                let sent_date = teiData.evaluate('//tei:correspAction[@type="sent"]//tei:date/@when', teiData, prefix => prefix === 'tei' ? 'http://www.tei-c.org/ns/1.0' : null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                let opener_text = teiData.evaluate('//tei:opener//tei:salute', teiData, prefix => prefix === 'tei' ? 'http://www.tei-c.org/ns/1.0' : null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                let letter_text = teiData.evaluate('//tei:body//tei:p', teiData, prefix => prefix === 'tei' ? 'http://www.tei-c.org/ns/1.0' : null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null); 
                let closer_text = teiData.evaluate('//tei:closer//tei:salute', teiData, prefix => prefix === 'tei' ? 'http://www.tei-c.org/ns/1.0' : null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            
                let text_content = '';
                
                let res_sent = sent_corr.iterateNext();
                while (res_sent) {
                    text_content += "Sender : " + res_sent.textContent + "<br/>";
                    f.sender = res_sent.textContent;
                    res_sent = sent_corr.iterateNext();
                }
            
                let res_geo = sent_geo.iterateNext();
                let arr;
                while (res_geo) {
                    text_content += "Ort : " + res_geo.textContent + "<br/>";
                    arr = res_geo.textContent.split(' ').map(Number);
                    let arr2 = [arr[1], arr[0]];
                    f.coordinates = arr;
                    res_geo = sent_geo.iterateNext();
                }
            
                let res_date = sent_date.iterateNext();
                while (res_date) {
                    text_content += "Datum : " + res_date.textContent + "<br/>";
                    f.date = res_date.textContent;
                    res_date = sent_date.iterateNext();
                }
            
                let res1_text = opener_text.iterateNext();
                while (res1_text) {
                    text_content += res1_text.textContent + "<br/>";
                    res1_text = opener_text.iterateNext();
                }
            
                let res2_text = letter_text.iterateNext();
                while (res2_text) {
                    text_content += res2_text.textContent + "<br/>";
                    res2_text = letter_text.iterateNext();
                }
            
                let res3_text = closer_text.iterateNext();
                while (res3_text) {
                    text_content += res3_text.textContent + "<br/>";
                    res3_text = closer_text.iterateNext();
                }

                let marker = L.marker(arr).addTo(map);
                if (f.sender == 'Whitman, Walt'){
                    marker._icon.classList.add("huechange");
                }
                marker.bindPopup(text_content);
                markers.addLayer(marker);
                f.text = text_content;
                features_arr.push(f);
                
                if (i == inputs.length - 1){
                    //console.log(inputs.length);
                    renderChart(makeSeries(features_arr));
                }
                
            }, true);
            reader.readAsText(input, 'UTF-8');
            
        }
        map.addLayer(markers);
    
}

//////////////////////
/// Create a chart ///
//////////////////////


function x(arr1, arr2, arr3){

    for (let j = 0 ; j < arr1.length ; j++){
        let obj = {};
        let year = arr1[j].date.slice(0,4);
        let testNum = arr2.indexOf(year);
        console.log(year, testNum);
        if ( testNum == -1){
            arr2.push(year);
            obj.date = year;
            obj.value = 1;
            arr3.push(obj);
        } else {
            arr3[testNum].value += 1;
        }
    }
    return arr3;
}

function makeSeries(arr) { 
    let return_arr1 = [];
    let temp1 = [];
    console.log(arr.length);
    let dataForSeries = x(arr, temp1, return_arr1); 
    console.log(dataForSeries);
    let columns = dataForSeries.map(function(item) { 
      return { 
        x: new Date(item.date, 0, 1).getTime(), 
        y: item.value, 
        name: item.date 
      }; 
    }); 
    return [ 
      { name: 'Letters', points: columns }
    ]; 
  } 

  function renderChart(series) { 
    return JSC.chart('chartDiv', { 
      debug: true, 
      type: 'column solid', 
      xAxis: { 
        scale_type: 'time'
      }, 
      title_label_text: 
        'Letters from and to Whitmann', 
      defaultSeries: { 
        line_width: 2, 
        defaultPoint: { 
          tooltip: '%name<br><b>%yValue</b>', 
          marker_visible: false, 
          outline_width: 0 
        } 
      }, 
      series: series 
    }); 
  } 


////////////
/// Main ///
////////////

document.querySelector("#file").addEventListener('change', function(e) {
    if (window.File) {
        teiParser();
    }
}, true);


