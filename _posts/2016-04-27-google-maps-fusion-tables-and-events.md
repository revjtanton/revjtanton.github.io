---
layout: post
title:  "Google Maps, Fusion Tables, and complicated results."
permalink: /javascript/google-maps-fusion-tables-and-complicated-results/
date:   2016-04-27 10:30:00
categories: javascript
tags: [google, google maps, google fusion tables, jquery]
---
Have you ever used Google Fusion Tables with Google Maps Javascript API?  It all works incredibly well together, and it's generally a very easy thing.  Things get slightly more complicated when you want to add event listeners to the data layer you're adding to your map with Fusion Tables, and when more than one thing can be true for an area of the map.  The following is how I worked through that problem:

First thing's first: you're going to need some included files.

{% highlight javascript %}
<script type="text/javascript" src="https://maps.google.com/maps/api/js?v=3"></script>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/javascript" src="fusiontips.js"></script>
{% endhighlight %}

Wait, what was that last one?!  It was [fusiontips](https://github.com/derekeder/fusiontips "Github").  The link there goes to the Github repo of the forked code from Google Code to facilitate events on FT layers.  To use that code, just go grab it and include it.

After that it's fairly straight forward to setup your Google Map part.

{% highlight javascript %}
  var map,
    geocoder = new google.maps.Geocoder(),
    tableid = 'your-table-id',
    googleApiKey = "your-api-key";

  function initialize() {
    var mapOptions = {
      zoom: 5,
      center: new google.maps.LatLng(39.50, -98.35), //The centerish of the US
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    map = new google.maps.Map(document.getElementById('mapcanvas'), mapOptions);
{% endhighlight %}

Up until here it's all pretty easy.  We're establishing some stuff, declaring stuff, and using my Googled best center of the US lat/long coordinates.  Now we'll add the Fusion Table layer the old fashioned way, and import some styling that was set on that layer in the Fusion Tables UI:

{% highlight javascript %}
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
{% endhighlight %}

Note that I set *suppressInfoWindows: true* there.  this is so the default tool-tips don't come up when you click on the map.  I want supreme customization of how the data is interacted with, and Google's default actions won't cut it.  In this particular case I want to be able to have more than one value for an area on the map, and the areas are defined by a zip code.  The table I'm using includes the geometry for every zip code in the US, and it contains data about what companies operate in that zip code.  More than one company can operate in a zip code at any one time, so we're using the Fusion Table layer to define the geometry through Google Maps API, but we're going to use a separate call to the table to get the info about what's in that geometry.  We're going to use a click to generate that separate call, and we're using the previously mentioned fusiontips to listen for that event.  In the example from fusiontips you can use a mouseover event too, but I wanted a click.  I'll leave in the mouseover code in a comment to show it can be used that way too.

{% highlight javascript %}
    layer.enableMapTips({
      select: "'ZIPCODE'",
      from: tableid,
      geometryColumn: 'geometry',
      suppressMapTips: true,
      delay: 100,
      tolerance: 6,
      googleApiKey: googleApiKey,
    });

    // google.maps.event.addListener(layer, 'mouseover', function(fEvent) {
    google.maps.event.addListener(layer, 'click', function(fEvent) {
      getInfo(fEvent.row.ZIPCODE.value);
    });
  }
{% endhighlight %}

You'll see there that we added an event listener defined by the layer which extended enableMapTips from fusiontips.  This is really the key to all of it.  This code means that the fEvent argument passed from the click or hover event contains the information from the layer that we described in that *layer.enableMapTips* definition.  In this case I'm passing only the ZIPCODE so that I can do a secondary search on the ZIPCODE later.  

You may notice that at this point we're kinda querying the same data set 3 times to get this to work.  There may be a more efficient way to do this, but I wasn't able to get it working cleaner as of this writing.  We have an initial map building query to define the territories to be drawn.  This is being done via the Google Maps API, and it is done to *show* the areas we mean to display.  The second query defines the clickable or hover areas.  This is simply done to give us control over what happens with the onclick event on an area.  The third interaction is to get specific data, even where more than one result exists, and display it.  That looks like this:  

{% highlight javascript %}
  function getInfo(zip) {
    var query = 'SELECT * FROM ' + tableid + ' WHERE ZIPCODE = ' + zip;

    $.get('https://www.googleapis.com/fusiontables/v2/query?sql=' + query + '&key=' + googleApiKey, function(data, status) {
      formatInfo(data.rows);
    });
  }

  function formatInfo(output) {
    var html = '<ul>';

    for(var i = 0; i < output.length; i++) {
      if(output[i][0] == 1) html += '<li><strong>Company Name:</strong> ' + output[i][1] + '</li>';
    }

    html += '</ul>'

    document.getElementById('info').innerHTML = html;
  }

  google.maps.event.addDomListener(window, 'load', initialize);
{% endhighlight %}

In the step before this one there was a call to getInfo().  This bit of code shows that getInfo is a $.get on the same data set.  This is so we can limit our result set, and work with more than one return.  By default on a Fusion Table layer Google will only show the top result on an area.  This is the main problem we're overcoming with all of this: the ability to control an event and show more than one item in a result set.  

The callback on getInfo points to formatInfo and all that does is take the response from the GET request to Fusion Tables and iterates over the results, outputting each line item into an li, and then dumps that HTML into a div in the body of your page called *info*.  You can do whatever you want with that div from there.  

And there you have it!  A way to work with a multiline result set from a Fusion Table query in Google Maps!  Here's a full code example:

{% highlight html %}
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>Google Maps and Fusion Tables Test</title>
    <style>
      #mapcanvas {
        height: 100px;
        margin: 0px;
        padding: 300px;
      }

      #map-container {
        position: relative;
      }
    </style>
    <script type="text/javascript" src="https://maps.google.com/maps/api/js?v=3"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script type="text/javascript" src="fusiontips.js"></script>
    <script>
      var map,
        geocoder = new google.maps.Geocoder(),
        tableid = 'your-table-id',
        googleApiKey = "your-api-key";

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
          googleApiKey: googleApiKey,
        });

        // google.maps.event.addListener(layer, 'mouseover', function(fEvent) {
        google.maps.event.addListener(layer, 'click', function(fEvent) {
          getInfo(fEvent.row.ZIPCODE.value);
        });
      }

      function getInfo(zip,searchFlag) {
        var query = 'SELECT * FROM ' + tableid + ' WHERE ZIPCODE = ' + zip;

        $.get('https://www.googleapis.com/fusiontables/v2/query?sql=' + query + '&key=' + googleApiKey, function(data, status) {
          formatInfo(data.rows);
        });
      }

      function formatInfo(output) {
        var html = '<ul>';

        for(var i = 0; i < output.length; i++) {
          if(output[i][0] == 1) html += '<li><strong>Company Name:</strong> ' + output[i][1] + '</li>';
        }
        html += '</ul>'

        document.getElementById('info').innerHTML = html;
      }

      google.maps.event.addDomListener(window, 'load', initialize);
    </script>
  </head>
  <body>
    <div id="map-container">
      <div id="mapcanvas"></div>
    </div>
    <div id="info"></div>
  </body>
</html>
{% endhighlight %}
