/********************************************************************************
 * File: parking.js
 *
 * Author: Stephanie Clement
 *
 * Pupose: Get/ add parking use layer to basemap based on season
 * 
 * Dependancies: ArcGIS JS 4.3 API https://js.arcgis.com/4.3/
 *
 * Created On: April 20 2017
 *
 * Modified: 
 ********************************************************************************/
require( [ "esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/layers/TileLayer", "dojo/domReady!" ], function( Map, MapView, FeatureLayer, TileLayer ) {
  var map = new Map( {
    basemap: "osm"
  });
  //create a view for the map and center/zoom it in whistler
  var view = new MapView( {
    container: "viewDiv",
    map: map,
    zoom: 16.5,
    center: [ -122.929638, 50.159819 ]
  });

  /********************************************************************************
   * Tiled Basemap Layer 
   ********************************************************************************/
  var baseLayer = new TileLayer( {
    url: "https://tiles.arcgis.com/tiles/KsnB2VOAvO5LjdB4/arcgis/rest/services/basemap/MapServer"
  });
  map.add( baseLayer );
  var lyr = new TileLayer( {
    url: "https://tiles.arcgis.com/tiles/KsnB2VOAvO5LjdB4/arcgis/rest/services/ParkingTile/MapServer",
    id: "parking"
  });

  /********************************************************************************
   * Date Objects 
   ********************************************************************************/
  // no parking seasonal date --> new Date("Nov 1, 2016 16:59:00");
  // no parking seasonal date --> new Date("Mar 31, 2016 16:59:00");
  // no parking end of seasonal date --> new Date("April 1, 2016 16:59:00");
  var today = new Date();
  var hour = today.getHours();

  /********************************************************************************
   * Check to see if time or layer has changed every 5 minutes and update the layer
   * shown on map using setInterval function
   ********************************************************************************/
  setInterval( function getLyr() {
    // if there are more than 1 layer on map remove it before adding a new one to avoid stacking
    if ( map.layers.length > 1 ) {
      map.layers.remove( map.findLayerById( "parking" ) );
      console.log( "removing layer" );
    }

    /********************************************************************************
     * Based on season choose whether or not to display feature layer
     ********************************************************************************/
    // if it is currently snowing season dont display layer between nov and march
    // 10 is November, 3 is March, January begins on 0
    if ( ( today.getMonth() >= 10 ) || ( today.getMonth() < 3 ) ) {
      // if time of day between 9 and 5 alert          
      if ( ( hour >= 9 ) && ( hour < 17 ) ) {
        console.log( "No Parking Currently for Snow Clearing Purposes" );
      } else {
        map.add( lyr );
      }
    }

    // else no no seasonal restrictions display parking layer 
    else {
      map.add( lyr );
    }
    return getLyr;
  }(), 300000 );
});