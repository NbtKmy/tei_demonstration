
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
    return new Promise((resolve,reject) => {
        let inputs = document.querySelector('#file').files;
        
        
        var features_arr = [];
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];

            // feature-obj for geoJson
            let feature = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: []
                },
                properties: {
                }
            };

            let f = {};
            var markers = L.markerClusterGroup();
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
                    feature.properties.sender = res_sent.textContent;
                    f.sender = res_sent.textContent;
                    res_sent = sent_corr.iterateNext();
                }
            
                let res_geo = sent_geo.iterateNext();
                let arr;
                while (res_geo) {
                    text_content += "Ort : " + res_geo.textContent + "<br/>";
                    arr = res_geo.textContent.split(' ').map(Number);
                    let arr2 = [arr[1], arr[0]];
                    feature.geometry.coordinates = arr2;
                    f.coordinates = arr;
                    res_geo = sent_geo.iterateNext();
                }
            
                let res_date = sent_date.iterateNext();
                while (res_date) {
                    text_content += "Datum : " + res_date.textContent + "<br/>";
                    feature.properties.date = res_date.textContent;
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
                if (feature.properties.sender == 'Whitman, Walt'){
                    marker._icon.classList.add("huechange");
                }
                marker.bindPopup(text_content);
                markers.addLayer(marker);
                feature.properties.text = text_content;
                f.text = text_content;
                features_arr.push(f);
            }, true);
            reader.readAsText(input, 'UTF-8');
        }
        map.addLayer(markers);
        resolve(features_arr);
    })
}

///////////////////////////////////////
/// Render geoJson layer on the map ///
///////////////////////////////////////

function makeSeries(data) { 
    var columns = data.map(function(item) { 
      return { 
        x: new Date( 
          +item.date.slice(3, 7), 
          +item.date.slice(1, 2) * 3 - 3, 
          1 
        ).getTime(), 
        y: item.revenue, 
        name: item.date 
      }; 
    }); 
    return [ 
      { name: 'Revenue', points: columns }
    ]; 
  } 

function renderChart(features_arr){
    return new Promise(function (resolve, reject) {
        console.log(features_arr);
        let cpArr = features_arr.json();
        console.log(cpArr);
        var f = cpArr[0];
        console.log(f);
        features_arr.forEach(obj => {
            console.log(obj);
        });
        resolve();
    });
}
    /*
    chart = renderChart(makeSeries(features_arr)); 


    JSC.Chart("chartDiv", {
        series: [
          {
            points: [{ x: "A", y: 10 }, { x: "B", y: 5 }]
          }
        ]
      });
      */


////////////
/// Main ///
////////////

document.querySelector("#file").addEventListener('change', function(e) {
    if (window.File) {
        teiParser()
        .then(res => {
            console.log(res);
            console.log(res[0]);
            //const jsonPromise = JSON.parse(res);
            
        })
    }
}, true);


