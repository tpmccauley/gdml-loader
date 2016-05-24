/**
 * @author tpmccauley / http://cern.ch/mccauley
 */

 THREE.GDMLLoader = function() {

  var GDML = null;

 };

 THREE.GDMLLoader.prototype = {

   constructor: THREE.GDMLLoader,

   load: function ( url, onLoad, onProgress, onError ) {
      var scope = this;

      var loader = new THREE.XHRLoader();
      loader.setPath( this.path );
      loader.load( url, function ( text ) {

        onLoad( scope.parse( text ) );

      }, onProgress, onError );
	 },

   parse: function ( text ) {
      GDML = new DOMParser().parseFromString( text, 'text/xml' );

      var solids = this.parseSolids()[0].childNodes;
      var name = '';
      var container = new THREE.Group();

      var geometries = {};
      var materials = {};
      var meshes = {};

      for ( var i = 0; i < solids.length; i++ ) {
        var type = solids[i].nodeName;

        if ( type === 'box' ) {

          name = solids[i].attributes.name;
          var x = solids[i].attributes.x;
          var y = solids[i].attributes.y;
          var z = solids[i].attributes.z;
        }

        if ( type === 'tube' ) {

          name = solids[i].attributes.name;
          var rmin = solids[i].attributes.rmin;
          var rmax = solids[i].attributes.rmax;
          var z = solids[i].attributes.z;
          var startphi = solids[i].attributes.startphi;
          var deltaphi = solids[i].attributes.deltaphi;
        }
      }

      return geometries;
   },

   parseSolids: function() {
     var elements = GDML.querySelectorAll('solids');
     return elements;
   }



 };
