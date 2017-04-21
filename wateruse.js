/********************************************************************************
 * File: Wateruse.js
 *
 * Author: Stephanie Clement
 *
 * Pupose: Get/ Add Water Use Layers To Basemap Based On Current Restriction Level
 * In Place, Second Version Adding Refresh On Layer Change
 * 
 * Dependancies: Arcgis Js 4.3 Api Https://js.arcgis.com/4.3/
 *
 * Created On: April 20 2017
 *
 * Modified: 
 ********************************************************************************/

require([

    "esri/Map",
    "esri/views/MapView",

    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",

    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",

    "dojo/domReady!"
  ],
  function(

    Map, MapView,

    FeatureLayer, TileLayer,

    QueryTask, Query
  ) {
    var map = new Map({
      basemap: "osm"
    });
    //create a view for the map and center/zoom it in whistler
    var view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 16.5,
      center: [-122.929638, 50.159819]
    });

    /********************************************************************************
     * Get feature layer with information on what the current level is 
     ********************************************************************************/
    var waterUrl = "https://services1.arcgis.com/KsnB2VOAvO5LjdB4/ArcGIS/rest/services/wrl_colored/FeatureServer/0"; // Represents the REST endpoint for a layer 

    var queryTask = new QueryTask({
      url: waterUrl
    });

    //query water restriction level 
    var query = new Query();
    query.returnGeometry = false;
    query.outFields = ["water_restriction_level"];
    query.where = "water_restriction_level > = 0"; // return currently active water restriction level

    /********************************************************************************
     * Tiled Basemap with lots, buildings, roads, fire hydrants, etc.
     ********************************************************************************/
    var baseLayer = new TileLayer({
      url: "https://tiles.arcgis.com/tiles/KsnB2VOAvO5LjdB4/arcgis/rest/services/basemap/MapServer"
    });

    map.add(baseLayer);

    /********************************************************************************
     * Check to see if time or layer has changed every 5 minutes and update the layer
     * shown on map using setInterval function 
     ********************************************************************************/
    setInterval(function getLayers() {

      // When resolved, returns features and graphics that satisfy the query
      queryTask.execute(query).then(function(results) {
        var level = results.features[0].attributes.water_restriction_level;

        /********************************************************************************
         * Tiled Restrictions Layers 
         ********************************************************************************/
        var allon = new TileLayer({
          url: "https://tiles.arcgis.com/tiles/KsnB2VOAvO5LjdB4/arcgis/rest/services/NoRestrictions/MapServer",
          id: "waterlayer"
        });
        var even = new TileLayer({
          url: "https://tiles.arcgis.com/tiles/KsnB2VOAvO5LjdB4/arcgis/rest/services/EvenActive/MapServer",
          id: "waterlayer"
        });
        var odd = new TileLayer({
          url: "https://tiles.arcgis.com/tiles/KsnB2VOAvO5LjdB4/arcgis/rest/services/OddActive/MapServer",
          id: "waterlayer"
        });
        var alloff = new TileLayer({
          url: "https://tiles.arcgis.com/tiles/KsnB2VOAvO5LjdB4/arcgis/rest/services/Restricted/MapServer",
          id: "waterlayer"
        });

        /********************************************************************************
         * Date Objects 
         ********************************************************************************/
        var today = new Date();
        var hour = (new Date()).getHours();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var currentDay = days[today.getDay()];
        document.getElementById("demo").innerHTML = currentDay + ",  current level = " + level; // can delete this 

        /********************************************************************************
         * Based on active level chose feature layer to symbolize map with
         ********************************************************************************/
        var lvl;
        console.log("number of layers = " + map.layers.length);
        // if there are more than 1 layer on map remove it before adding a new one to avoid stacking
        if (map.layers.length > 1) {
          map.layers.remove(map.findLayerById("waterlayer"));
          console.log("removing layer");
        }

        //if level is set to 0 then no restrictions in place layer displayed
        if (level == 0) {
          lvl = allon;
        }

        // if restriction level is set to 1 
        if (level == 1) {

          // display even layer Thursdays, Sundays 4am - 9am, 7pm-10pm 
          if ((today.getDay() == 4 || today.getDay() == 0) && ((hour >= 4 && hour < 9) || ((hour >= 19 && hour < 22)))) {
            lvl = even;
          }

          // display odd layer Wednesdays, Saturdays 4am - 9am, 7pm-10pm
          else if ((today.getDay() == 3 || today.getDay() == 6) && ((hour >= 4 && hour < 9) || ((hour >= 19 && hour < 22)))) {
            lvl = odd;
          }
        }

        //if restriction level is set to 2 
        if (level == 2) {

          // display even layer thursdays 4am - 9am, 7pm-10pm 
          if ((today.getDay() == 4) && ((hour >= 4 && hour < 9) || ((hour >= 19 && hour < 22)))) {
            lvl = even;
          }

          // display odd layer Wednesdays 4am - 9am, 7pm-10pm
          else if ((today.getDay() == 3) && ((hour >= 4 && hour < 9) || ((hour >= 19 && hour < 22)))) {
            lvl = odd;
          }
        }

        //if level is set to 3 then all restrictions in place layer displayed
        else if (level == 3) {
          lvl = alloff;
        }

        //depending on value returned this will display the correct layer on the map 
        map.add(lvl);
      });
      return getLayers;
    }(), 300000);
  });