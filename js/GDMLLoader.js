/**
 * @author tpmccauley / http://cern.ch/mccauley
 */

 THREE.GDMLLoader = function() {

  var GDML = null;

 };

 THREE.GDMLLoader.prototype = {

  constructor: THREE.GDMLLoader,

  group: new THREE.Group(),
  geometries: {},
  refs: {},
  meshes: [],

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

    this.parseSolids();
    this.parseVolumes();
    this.parsePhysVols();

    return this.group;
  },

  parseSolids: function() {

    var elements = GDML.querySelectorAll('solids');
    var solids = elements[0].childNodes;

    for ( var i = 0; i < solids.length; i++ ) {

      var type = solids[i].nodeName;
      var solid = solids[i];

      if ( type === 'box' ) {

        name = solid.getAttribute('name');
        var x = solid.getAttribute('x') / 1e4;
        var y = solid.getAttribute('y') / 1e4;
        var z = solid.getAttribute('z') / 1e4;

      }

      if ( type === 'tube' ) {

        var aunit = solid.getAttribute('aunit');
        var lunit = solid.getAttribute('lunit');

        name = solid.getAttribute('name');
        var rmin = solid.getAttribute('rmin') / 1e4;
        var rmax = solid.getAttribute('rmax') / 1e4;
        var z = solid.getAttribute('z') / 1e4;
        var startphi = solid.getAttribute('startphi') * Math.PI/180.0;
        var deltaphi = solid.getAttribute('deltaphi') * Math.PI/180.0;

        var shape = new THREE.Shape();
        // x,y, radius, startAngle, endAngle, clockwise, rotation
        shape.absarc(0, 0, rmax, startphi, deltaphi, false);

        var hole = new THREE.Path();
        hole.absarc(0, 0, rmin, startphi, deltaphi, true);
        shape.holes.push(hole);

        var extrudeSettings = {
          amount : z,
          steps : 1,
          bevelEnabled: false,
          curveSegments: 24
        };

        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        this.geometries[name] = geometry;

      }
    }
  },

  parseVolumes: function() {
    var volumes = GDML.querySelectorAll('volume');

    for ( var i = 0; i < volumes.length; i++ ) {

      var name = volumes[i].getAttribute('name');
      var solidrefs = volumes[i].childNodes;

      for ( var j = 0; j < solidrefs.length; j++ ) {

        var type = solidrefs[j].nodeName;

        if ( type === 'solidref' ) {
          var solidref = solidrefs[j].getAttribute('ref');
          this.refs[name] = solidref;
        }
      }
    }
  },

  parsePhysVols: function() {
    var physvols = GDML.querySelectorAll('physvol');

    for ( var i = 0; i < physvols.length; i++ ) {

      var name = physvols[i].getAttribute('name');
      var children = physvols[i].childNodes;
      var volumeref = '';

      var position = new THREE.Vector3(0,0,0);
      var rotation = new THREE.Vector3(0,0,0);

      var geometry;
      var material = new THREE.MeshBasicMaterial({color:Math.random()*0xffffff, transparent:true, opacity:0.5});

      for ( var j = 0; j < children.length; j++ ) {

        var type = children[j].nodeName;

        if ( type === 'volumeref' ) {

          var volumeref = children[j].getAttribute('ref');
          geometry = this.geometries[this.refs[volumeref]];
        }

        if ( type === 'position' ) {

          var x = children[j].getAttribute('x') / 1e4;
          var y = children[j].getAttribute('y') / 1e4;
          var z = children[j].getAttribute('z') / 1e4;

          position.set(x,y,z);
        }

        if ( type === 'rotation' ) {

          var x = children[j].getAttribute('x') * Math.PI/180.0;
          var y = children[j].getAttribute('y') * Math.PI/180.0;
          var z = children[j].getAttribute('z') * Math.PI/180.0;

          rotation.set(x,y,z);
        }

      }

      var mesh = new THREE.Mesh(geometry, material);
      mesh.name = name;
      mesh.visible = true;

      mesh.position.set(position.x, position.y, position.z);
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);

      console.log(name, position);

      this.group.add(mesh);

    }

  }

};
