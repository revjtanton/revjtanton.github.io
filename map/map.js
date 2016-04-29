  var map,
    geocoder = new google.maps.Geocoder(),
    tableid = '1ss0i5bEXCY6NTbLKKmQM0x5y5ula_OO4P1OUSRye',
    googleApiKey = "AIzaSyBseasV_1iDpsFtswxx1S-U9p11SYeT1cA";

  function initialize() {
    var mapOptions = {
      zoom: 5,
      center: new google.maps.LatLng(39.50, -98.35),
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    map = new google.maps.Map(document.getElementById('mapcanvas'), mapOptions);

    layer = new google.maps.FusionTablesLayer({
      query: {
        select: "col11\x3e\x3e1",
        from: tableid,
        where: "col8\x3e\x3e0 \x3d \x271\x27"
      },
      heatmap: { enabled: false },
      suppressInfoWindows: true,
      options: {
        styleId: 2,
        // templateId: 2
      },
      map: map
    });

    layer.enableMapTips({
      select: "'ZIPCODE'",
      from: tableid,
      geometryColumn: 'geometry',
      suppressMapTips: true,
      delay: 100,
      tolerance: 6,
      // googleApiKey: googleApiKey,
    });

    // google.maps.event.addListener(layer, 'mouseover', function(fEvent) {
    google.maps.event.addListener(layer, 'click', function(fEvent) {
      document.getElementById('info').innerHTML ='<div style="width: 100%; text-align: center;"><img src="spinner-small.gif" alt="Loading" /></div>';
      var row = fEvent.row;
      document.getElementById('address').value = row.ZIPCODE.value;
      getInfo(row.ZIPCODE.value);
    });
  }

  function codeAddress() {
    // document.getElementById('info').innerHTML = '';
    var address = document.getElementById("address").value;
    getInfo(address,true);
  }

  function getInfo(zip,searchFlag) {
    searchFlag = searchFlag || 0;
    var query = 'SELECT * FROM ' + tableid + ' WHERE ZIPCODE = ' + zip + ' ORDER BY DISPLAY DESC';

    $.get('https://www.googleapis.com/fusiontables/v2/query?sql=' + query + '&key=' + googleApiKey, function(data, status) {
      if(searchFlag == true) {
        var shout = true;
        for(var i = 0; i < data.rows.length; i++) {
          if(data.rows[i][8] == 1) shout = false;
        }

        if(shout == true) alert('The utility companies in your area do not currently have a data service to support benchmarking with Portfolio Manager. Please see the search result for your local providers.');

        gotoAddress(zip);
      }

      document.getElementById('info').innerHTML ='';
      formatInfo(data.rows);
    })
    .fail(function() {
      alert("There was a problem with your search.  Our tool is limited to covering postal and zip codes in the United States.  Please try again.");
    });
  }

  function gotoAddress(address) {
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(10);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }

  function formatInfo(output) {
    var html = '',
        good = Array(),
        bad = Array();

    for(var i = 0; i < output.length; i++) {
      output[i][8] == 1 ? good.push(output[i]) : bad.push(output[i]);
    }

    if(good.length > 0) {

      for(var i = 0; i < good.length; i++) {
        html += '<div class="good-utility">';
        if(good[i][8] == 1) {
          html += '<span class="utility-name"><strong>Utility Name:</strong> ' + good[i][4] + '</span>';

          html += '<strong>Fuel Type:</strong> ';
          if(good[i][9] == 1) {
            html += 'Electric';
            good[i][10] == 1 ? html+= ', ' : html+= ' ';
          }
          if(good[i][10] == 1) {
            html += 'Gas ';
            good[i][11] == 1 ? html+= ', ' : html+= ' ';
          }
          if(good[i][11] == 1) {
            html += 'Steam ';
          }
          html += '<br />';

          html += '<strong onmouseover="tooltip.pop(this, \'#datatype-tip\')">Data Type:</strong> ' + good[i][12] + '<br />';
          html += '<strong onmouseover="tooltip.pop(this, \'#aggre-tip\')">Aggregate Whole-Building Data:</strong> ' + good[i][13] + '<br />';
          html += '<strong onmouseover="tooltip.pop(this, \'#multifam-tip\')">Multifamily Included:</strong> ' + good[i][14] + '<br />';

          html += '<strong>Contact Info:</strong><ul>';
          if(good[i][15].length > 0) html += '<li><strong>Name:</strong> ' + good[i][15] +'</li>';
          if(good[i][16].length > 0) html += '<li><strong>Phone:</strong> ' + good[i][16] +'</li>';
          if(good[i][17].length > 0) html += '<li><strong>Email:</strong> <a href="mailto:' + good[i][17] + '">' + good[i][17] + '</a></li>';
          html += '</ul>';

          if(good[i][18].length > 0) html += '<strong>Web Address:</strong> Click <a href="' + good[i][18] + '" target="_blank">here</a> for more information.';
        }
        html += '</div>'


      }
    }

    if (bad.length > 0) {
      html += '<div class="naughty-utilities">'
      if (bad.length > 1) {
        html += 'The following utilities do not currently have a data service to support benchmarking with Portfolio Manager. ';
        html += '<ul>';
        for(var i = 0; i < bad.length; i++) {
          html += '<li><span class="utility-name"><strong>Utility Name</a>:</strong> ' + bad[i][4] + '</span></li>';
        }
        html += '</ul>';
        html += 'If you believe this would be a valuable service for them to offer you and other customers, please consider contacting them.';

      } else {
        // console.log(bad);
        html += '<strong>' + bad[0][4] + '</strong> does not currently have a data service to support benchmarking with Portfolio Manager. If you believe this would be a valuable service for them to offer you and other customers, please consider contacting them.';
      }
      // html += 'If you believe this would be a valuable service for them to offer you and other customers, please consider contacting them.';
      html += '</div>'
    }
    // console.log(good);
    // console.log(bad);

    document.getElementById('info').innerHTML = html;
$('#box').css('height', 'auto');
$('#box').css('height', $('.highlighted').outerHeight()+115);
  }

  function resetMap() {
    document.getElementById('info').innerHTML = '<small>Click an area on the map or search by zip to view utility information by area.</small>';
    document.getElementById('address').value = 'Enter Your Zip Code';
    map.setZoom(5);
    map.setCenter(new google.maps.LatLng(39.50, -98.35));

$('#box').css('height', 'auto');
$('#box').css('height', $('.highlighted').outerHeight()+115);
  }

  google.maps.event.addDomListener(window, 'load', initialize);
