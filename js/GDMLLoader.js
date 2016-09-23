/**
 * @author tpmccauley / http://cern.ch/mccauley
 */

 THREE.GDMLLoader = function() {

  var GDML = null;

 };

 THREE.GDMLLoader.prototype = {

  constructor: THREE.GDMLLoader,

  group: new THREE.Group(),
  defines: {},
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

    this.parseDefines();
    this.parseSolids();
    this.parseVolumes();
    this.parsePhysVols();

    return this.group;
  },

  parseDefines: function() {

    var elements = GDML.querySelectorAll('define');
    var defs = elements[0].childNodes;
    var name = '';
    var value;

    for ( var i = 0; i < defs.length; i++ ) {

      var nodeName = defs[i].nodeName;
      var def = defs[i];

      if ( nodeName === 'constant' ) {

        name = def.getAttribute('name');
        value = def.getAttribute('value');

      }

      if ( nodeName === 'position' ) {

        name = def.getAttribute('name');

        var x = def.getAttribute('x');

        if ( ! x ) {
          x = 0.0;
        }

        var y = def.getAttribute('y');

        if ( ! y ) {
          y = 0.0;
        }

        var z = def.getAttribute('z');

        if ( ! z ) {
          z = 0.0;
        }

        var position = new THREE.Vector3(x, y, z);
        this.defines[name] = position;

      }

      if ( nodeName === 'rotation' ) {

        // Note: need to handle constants
        // before this can be implemented

        name = def.getAttribute('name');

        var x = def.getAttribute('x');
        var y = def.getAttribute('y');
        var z = def.getAttribute('z');

      }

      if ( nodeName === 'quantity' ) {

        // Note: need to handle units

        name = def.getAttribute('name');
        var type = def.getAttribute('type');

      }

      if ( nodeName === 'expression' ) {

        name = def.getAttribute('name');

      }
    }
  },


  parseSolids: function() {

    var elements = GDML.querySelectorAll('solids');
    var solids = elements[0].childNodes;
    var name = '';

    for ( var i = 0; i < solids.length; i++ ) {

      var type = solids[i].nodeName;
      var solid = solids[i];

      if ( type === 'box' ) {

        name = solid.getAttribute('name');

        var x = solid.getAttribute('x');
        var y = solid.getAttribute('y');
        var z = solid.getAttribute('z');

        if ( this.defines[x] ) {
          x = this.defines[x];
        }

        if ( this.defines[y] ) {
          y = this.defines[y];
        }

        if ( this.defines[z] ) {
          z = this.defines[z];
        }

        var geometry = new THREE.BoxGeometry(x,y,z);
        this.geometries[name] = geometry;

      }

      if ( type === 'tube' ) {

        // Note: need to handle units
        var aunit = solid.getAttribute('aunit');
        var lunit = solid.getAttribute('lunit');

        name = solid.getAttribute('name');
        var rmin = solid.getAttribute('rmin') / 1e4;
        var rmax = solid.getAttribute('rmax') / 1e4;
        var z = solid.getAttribute('z') / 1e4;

        var startphi = solid.getAttribute('startphi');
        var deltaphi = solid.getAttribute('deltaphi');

        if ( aunit === 'deg' ) {
          startphi *= Math.PI/180.0;
          deltaphi *= Math.PI/180.0;
        }

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

      if ( type === 'sphere' ) {

        name = solid.getAttribute('name');
        var rmax = solid.getAttribute('rmax');

        var startphi = solid.getAttribute('startphi');
        var deltaphi = solid.getAttribute('deltaphi');

        var starttheta = solid.getAttribute('starttheta');
        var deltatheta = solid.getAttribute('deltatheta');

        var aunit = solid.getAttribute('aunit');

        if ( ! startphi ) {
          startphi = 0.0;
        }

        if ( ! starttheta ) {
          starttheta = 0.0;
        }

        if ( aunit === 'deg' ) {

          startphi *= Math.PI/180.0;
          deltaphi *= Math.PI/180.0;

          starttheta *= Math.PI/180.0;
          deltatheta *= Math.PI/180.0;

        }

        // radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength
        var sphere = new THREE.SphereGeometry(rmax, 32, 32, startphi, deltaphi, starttheta, deltatheta);

        this.geometries[name] = sphere;

      }

      if ( type === 'orb' ) {

        name = solid.getAttribute('name');
        var r = solid.getAttribute('r');

        var sphere = new THREE.SphereGeometry(r, 32, 32, 0.0, 2*Math.PI, 0.0, Math.PI);
        this.geometries[name] = sphere;

      }


      if ( type === ' polycone' ) {
        //console.log('polycone');
      }

      if ( type === 'polyhedra' ) {
        //console.log('polyhedra');
      }

      if ( type === 'trd' ) {
        //console.log('trd');
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

      if ( ! name ) {
        name = 'JDoe';
      }

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

        if ( type === 'positionref' ) {

          var positionref = children[j].getAttribute('ref');
          position = this.defines[positionref];

        }

        if ( type === 'rotationref' ) {

          var rotationref = children[j].getAttribute('ref');

        }

        if ( type === 'position' ) {

          var x = children[j].getAttribute('x');
          var y = children[j].getAttribute('y');
          var z = children[j].getAttribute('z');

          // Note: how to handle units?
          position.set(x / 1e4, y / 1e4, z / 1e4);
        }

        if ( type === 'rotation' ) {

          var x = children[j].getAttribute('x') * Math.PI/180.0;
          var y = children[j].getAttribute('y') * Math.PI/180.0;
          var z = children[j].getAttribute('z') * Math.PI/180.0;

          rotation.set(x,y,z);
        }

      }

      if ( geometry ) {

        var mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        mesh.visible = true;

        mesh.position.set(position.x, position.y, position.z);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);

        this.group.add(mesh);

      }
    }

  }

};
