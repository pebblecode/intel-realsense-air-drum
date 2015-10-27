// (function() {
  // var audio = new Audio('inception.mp3');
  //var audio = new Audio('99752__menegass__bongo2.wav');
  var ambientLight,
    spotLight,
    objLoader = new THREE.OBJLoader(),
    objMtlLoader = new THREE.OBJMTLLoader(),
    spacesphere,
    planet,
    sounds = {
      hiHat: new Audio('audio/CHINESE TD_2.wav'),
      drumDeep: new Audio('audio/218458__thomasjaunism__pacific-island-drum-2 (1).wav'),
      drumKick: new Audio('audio/190551__nabz871__kick-drum-hard-3.wav'),
      drumSnare: new Audio('audio/82238__kevoy__snare-drum.wav')
    };

  function initModels() {

    loadDrum('red', [-200, 80, 30]);
    loadDrum('blue', [-70, 90, 0]);
    loadDrum('red', [70, 90, 30]);
    loadHiHat([130,170,200]);
  }

  function loadDrum(color, posArray) {

    var drumMaterialOutsideRed = new THREE.MeshLambertMaterial({color: 0xfe0000});
    var drumMaterialOutsideBlue = new THREE.MeshLambertMaterial({color: 0x4669dd});
    var drumMaterialMetal = new THREE.MeshPhongMaterial({color: 0xb08a6e});
    var drumMaterialSkinWhite = new THREE.MeshLambertMaterial({color: 0xfcfcfc});

    // var tempChildNames = [];

    objLoader.load( 'models/drum2.obj', function ( object ) {

      // console.log('Loaded drum model', object);

      object.traverse( function ( child ) {

        if ( child instanceof THREE.Mesh ) {

          // console.log('child mesh', child);

          if (child.name.indexOf('Circle') > -1) {
            child.material = drumMaterialSkinWhite;

          } else if (child.name.indexOf('Sphere') > -1) {
            child.material = drumMaterialMetal;

          } else if (child.name.indexOf('Line') > -1) {
            child.material = drumMaterialMetal;

          } else if (child.name.indexOf('Rectangle') > -1) {
            child.material = drumMaterialSkinWhite;

          } else {
            child.material = color === 'red' ? drumMaterialOutsideRed : drumMaterialOutsideBlue;
          }

          if( child.name === 'Object03' ) {
            child.material = drumMaterialSkinWhite;
          }

          // tempChildNames.push( child.name );

        }

      } );

      // console.log(tempChildNames);

      object.scale.set(4, 4, 4);
      object.position.set(posArray[0], posArray[1], posArray[2]);

      scene.add(object);
    });

  }

  function loadHiHat(posArray) {

    var hiHatMaterialSilver = new THREE.MeshPhongMaterial({color: 0xcccccc});
    var hiHatMaterialGold = new THREE.MeshPhongMaterial({color: 0xb08a6e});

    var count = 0;

    objMtlLoader.load( 'models/hihat.obj', 'models/hihat.mtl', function ( object ) {

      //console.log('Loaded hi hat model', object);

      object.traverse( function ( child ) {

        console.log('Hi hat child', child);

        if ( child instanceof THREE.Mesh ) {

          if (count === 0) {
            child.material = hiHatMaterialSilver;
          } else {
            child.material = hiHatMaterialGold;
          }

          count++;
        }
      });

      object.scale.set(20,19,20);
      object.position.set(posArray[0], posArray[1], posArray[2]);
      window.hihat = object;
      scene.add(object);
    });

  }

  function initSpaceScene() {

    var planetGeometry = new THREE.SphereGeometry(200,20,20);

    //Load the planet textures
    var texture = THREE.ImageUtils.loadTexture("images/planet-512.jpg");
    var normalmap = THREE.ImageUtils.loadTexture("images/normal-map-512.jpg");
    var specmap = THREE.ImageUtils.loadTexture("images/water-map-512.jpg");

    var planetMaterial = new THREE.MeshPhongMaterial();
    planetMaterial.map = texture;

    planetMaterial.specularMap = specmap;
    planetMaterial.specular = new THREE.Color( 0xff0000 );
    planetMaterial.shininess = 1;

    planetMaterial.normalMap = normalmap;
    planetMaterial.normalScale.set(-0.3,-0.3);

    var planet = new THREE.Mesh(planetGeometry, planetMaterial);

    //here we allow the texture/normal/specular maps to wrap
    planet.material.map.wrapS = THREE.RepeatWrapping;
    planet.material.map.wrapT = THREE.RepeatWrapping;
    planet.material.normalMap.wrapS = THREE.RepeatWrapping;
    planet.material.normalMap.wrapT = THREE.RepeatWrapping;
    planet.material.specularMap.wrapS = THREE.RepeatWrapping;
    planet.material.specularMap.wrapT = THREE.RepeatWrapping;

    //here we repeat the texture/normal/specular maps twice along X
    planet.material.map.repeat.set( 2, 1);
    planet.material.normalMap.repeat.set( 2, 1);
    planet.material.specularMap.repeat.set( 2, 1);

    planet.position.x = 0;
    planet.position.y = 400;
    planet.position.z = -1400;

    scene.add(planet);

    //Space background is a large sphere
    var spacetex = THREE.ImageUtils.loadTexture("images/space.jpg");
    var spacesphereGeo = new THREE.SphereGeometry(2000,20,20);
    var spacesphereMat = new THREE.MeshPhongMaterial();
    spacesphereMat.map = spacetex;

    spacesphere = new THREE.Mesh(spacesphereGeo,spacesphereMat);

    //spacesphere needs to be double sided as the camera is within the spacesphere
    spacesphere.material.side = THREE.DoubleSide;

    spacesphere.material.map.wrapS = THREE.RepeatWrapping;
    spacesphere.material.map.wrapT = THREE.RepeatWrapping;
    spacesphere.material.map.repeat.set( 5, 3);

    scene.add(spacesphere);

  }

  function initLights() {

    ambientLight = new THREE.AmbientLight( 0x404040 );
    scene.add( ambientLight );

    spotLight = new THREE.SpotLight( 0xFFFFFF, 1.0 );

    spotLight.castShadow = true;
    //spotLight.onlyShadow = true;
    spotLight.shadowCameraNear = camera.near;

    spotLight.position.set( 0, 1000, 700);
    spotLight.target.position.set( 0, 0, -100 );
    //spotLight.shadowCameraVisible = true;

    scene.add( spotLight );
    scene.add( spotLight.target );

  }

  function playSoundOnGesture(frame, gesture) {
    if (gesture.handIds.length < 1)
      return;
      
    sounds['drumDeep'].play();
  }

  function gestureStuff(frame) {
    frame.gestures.forEach(function(gesture) {
      switch (gesture.type){
        case "circle":
            console.log("Circle Gesture");              
            break;
        case "keyTap":
            console.log("Key Tap Gesture");
            break;
        case "screenTap":
            console.log("Screen Tap Gesture");
            break;
        case "swipe":
            if (gesture.state == "start")
            {                
              console.log("Swipe Gesture start");
            }
            else
            {
              console.log("Swipe Gesture update or stop");
            }
            break;
      }
    });
  }

  var previousLeftPalmPos = [0, 0, 0];
  var previousRightPalmPos = [0, 0, 0];

  function handleHand(hand, previousHandPos) {

    if (Math.abs(previousHandPos[1] - hand.palmPosition[1]) < 20 || previousHandPos[1] < hand.palmPosition[1])
      return;

    console.log("Hand type: " + hand.type);
    console.log("Palm x: " + hand.palmPosition[0]);
    console.log("Palm y: " + hand.palmPosition[1]);

    var palmXPosition = hand.palmPosition[0];
    if (palmXPosition < 0)
      sounds['drumDeep'].play();
    else if (palmXPosition > 180)
      sounds['hiHat'].play();
    else
      sounds['drumSnare'].play();
  }

  function yAxisStuff(frame) {
    for (var h = 0; h < frame.hands.length; h++){
        var hand = frame.hands[h];        
        
        if (hand.type == "left") {
          handleHand(hand, previousLeftPalmPos);
          previousLeftPalmPos = hand.palmPosition;
        }
        else {
          handleHand(hand, previousRightPalmPos);
          previousRightPalmPos = hand.palmPosition;
        }
    }
  }

  // Set up scene

 	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	initLights();
	initSpaceScene();
	initModels();

	camera.position.z = 400;
	camera.position.y = 240;

	var render = function () {
		requestAnimationFrame( render );
		renderer.render(scene, camera);
	};

	render();

	
  
  // initModels();
 
  // initSpaceScene();

  // initLights();
  // renderer.render( scene, camera );
//  scene.add(plane);

  //var axisHelper = new THREE.AxisHelper( 100 );
  //scene.add( axisHelper );



// })();