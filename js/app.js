// (function() {
  // var audio = new Audio('inception.mp3');
  //var audio = new Audio('99752__menegass__bongo2.wav');
  var ambientLight,
    spotLight,
    objLoader = new THREE.OBJLoader(),
    objMtlLoader = new THREE.OBJMTLLoader(),
    spacesphere,
    planet,
    fingerPoint = new THREE.Vector3(0,0,0),
    lastFingerPoint = new THREE.Vector3(0,0,0),
    sounds = {
      hiHat: new Audio('audio/CHINESE TD_2.wav'),
      drumDeep: new Audio('audio/218458__thomasjaunism__pacific-island-drum-2 (1).wav'),
      drumKick: new Audio('audio/190551__nabz871__kick-drum-hard-3.wav'),
      drumSnare: new Audio('audio/82238__kevoy__snare-drum.wav')
    };


  function initModels() {
    var showHitAreas = false;
    loadDrum('blue', [40, -60, 140], 30, 'drumSnare', showHitAreas);
    loadDrum('red', [0, -60, 140], 0, 'drumDeep',showHitAreas);
    loadDrum('blue', [-40, -60, 140], -30, 'drumKick', showHitAreas);
    // loadHiHat([130,170,200]);
  }

  function loadDrum(color, posArray, hitAreaPosition, sound, showHitArea) {

    showHitArea = showHitArea || false;

    var drumMaterialOutsideRed = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0xfe0000}));
    var drumMaterialOutsideBlue = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0x4669dd}));
    var drumMaterialMetal = Physijs.createMaterial(new THREE.MeshPhongMaterial({color: 0xb08a6e}));
    var drumMaterialSkinWhite = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0xfcfcfc}));

    objLoader.load( 'models/drum2.obj', function ( object ) {


      object.traverse( function ( child ) {

        if ( child instanceof THREE.Mesh ) {

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

        }

      } );

      object.position.set(posArray[0], posArray[1], posArray[2]);
      
      var box = new Physijs.BoxMesh(
          new THREE.BoxGeometry(20,5,20),
          new Physijs.createMaterial(new THREE.MeshBasicMaterial()),
          0
        );
      box.visible = showHitArea;
      box.addEventListener('collision', function() {
        console.log('Hit BOX!');
        sounds[sound].play();
      });

      box.position.set(hitAreaPosition,-27,100);
      scene.add(box);
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
	
	Physijs.scripts.worker = 'js/vendor/physijs_worker.js';
	Physijs.scripts.ammo = 'physijs_ammo.js';
	// var scene = new THREE.Scene();
	var scene = new Physijs.Scene();

	scene.addEventListener(
			'update',
			function() {

        var screenPos = fingerPoint.clone().project(camera);
        ball.position.set(-100 * screenPos.x, 5 + (100 * screenPos.y), 100);
        ball.__dirtyPosition = true;
        ball.applyCentralImpulse(new THREE.Vector3(0,35,0));

				scene.simulate( undefined, 1 );
			}
		);

	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	initLights();
	// initSpaceScene();
	initModels();

	var ball = new Physijs.SphereMesh(
	    new THREE.SphereGeometry( 3 ),
	    new Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: 0xEEFF11 }))
	);

	ball.position.set(0,0,100);

	scene.add(ball);

	camera.position.x = -100;
	camera.position.z = 400;
	camera.position.y = 240;

  var axisHelper = new THREE.AxisHelper( 100 );
  scene.add( axisHelper );

  var groundMaterial = Physijs.createMaterial( 
		new THREE.MeshPhongMaterial({
				specular:'#414141',
				color:'#8BC34A',
				emissive:'#0f0e0e', 
				shininess:100
			}), 
			.8, 
			.3
	);


	intel.realsense.SenseManager.detectPlatform(['hand'], ['front']).then(function (info) {
      if (info.nextStep == 'ready') {
         console.log('ready!')
         mainLogic();
         $('#check').hide();
         $('#Start').show();
      }
      else if (info.nextStep == 'unsupported') {
          $('#fail').show();
          $('#fail').append('<b> Platform is not supported for Intel(R) RealSense(TM) SDK: </b>');
          $('#fail').append('<b> either you are missing the required camera, or your OS and browser are not supported </b>');
          $('#fail').show();
      } else if (info.nextStep == 'driver') {
          $('#fail').append('Please update your camera driver from your computer manufacturer.');
          $('#fail').show();
      } else if (info.nextStep == 'runtime') {
          $('#download').show(1000);
      }

  }).catch(function (error) {
      $('#fail').append("CheckPlatform failed " + JSON.stringify(error));
      $('#fail').show();
  });

  function mainLogic() {

    // Close when page goes away
    var sense;
    $(window).bind("beforeunload", function (e) {
        if (sense != undefined) {
            sense.release().then(function (result) {
                sense = undefined;
            });
        }
    })

    $(document).ready(function () {

        var rs = intel.realsense; // name space short-cut
        var handModule; // hand module instance
        var handConfig; // hand module configuration instance

        var imageSize; //image stream size
        var scaleFactor = 1900;// scaleFactor for the sample renderer
        var nodestorender; // data structure to hold sphere objects to render

        // Pause the module when the page goes out of view
        $(document).bind(visChangeEvent, function () {
            if (sense !== undefined && handModule !== undefined) {
                if (document[hiddenObj]) {
                    handModule.pause(true);
                }
                else {
                    handModule.pause(false);
                }
            }
        });

        $('#Start').click(function () {
        		$(this).hide();
        		$('#Stop').show();
            // Create a SenseManager instance
            rs.SenseManager.createInstance().then(function (result) {
                sense = result;
                return rs.hand.HandModule.activate(sense);
            }).then(function (result) {
                handModule = result;
                status('Init started');

                // Set the on connect handler
                sense.onDeviceConnected = onConnect;

                // Set the status handler
                sense.onStatusChanged = onStatus;

                // Set the data handler
                handModule.onFrameProcessed = onHandData;

                // SenseManager Initialization
                return sense.init();
            }).then(function (result) {

                // Configure Hand Tracking
                return handModule.createActiveConfiguration();
            }).then(function (result) {
                handConfig = result;

                // Enable all alerts
                handConfig.allAlerts = true;

                // Enable all gestures
                handConfig.allGestures = true;

                // Apply Hand Configuration changes
                return handConfig.applyChanges();
            }).then(function (result) {
                return handConfig.release();
            }).then(function (result) {
                // Query image size 
                imageSize = sense.captureManager.queryImageSize(rs.StreamType.STREAM_TYPE_DEPTH);

                // Start Streaming
                return sense.streamFrames();
            }).then(function (result) {
                status('Streaming ' + imageSize.width + 'x' + imageSize.height);

                nodestorender = initHandRenderer(imageSize.width, imageSize.height);

            }).catch(function (error) {
                // handle pipeline initialization errors
                status('Init failed: ' + JSON.stringify(error));
            });
        });

        // Process hand data when ready
        function onHandData(sender, data) {

            // if no hands found
            if (data.numberOfHands == 0) return;

            // retrieve hand data 
            var allData = data.queryHandData(rs.hand.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);

            // for every hand in current frame
            for (h = 0; h < data.numberOfHands; h++) {
                var ihand = allData[h]; //retrieve hand data
                var joints = ihand.trackedJoints; //retrieve all the joints

                // for every joint
                for (j = 0; j < joints.length; j++) {

                    // if a joint is not valid
                    if (joints[j] == null || joints[j].confidence <= 0) continue;
                    
                    // update sample renderer joint position
                    nodestorender[h][j].position.set(joints[j].positionWorld.x * scaleFactor, joints[j].positionWorld.y * scaleFactor, joints[j].positionWorld.z * scaleFactor);
                    
                    //if(j === 9){
                    //  fingerPoint = nodestorender[h][j].position;
                    //}
                }

            }
            if (data.numberOfHands > 0) {
                  fingerPoint = nodestorender[0][9].position;
                }

            // retrieve the fired alerts
            for (a = 0; a < data.firedAlertData.length; a++) {
                $('#alerts_status').text('Alert: ' + JSON.stringify(data.firedAlertData[a]));
                var _label = data.firedAlertData[a].label;

                // notify the sample renderer the tracking alerts
                if (_label == rs.hand.AlertType.ALERT_HAND_NOT_DETECTED || _label == rs.hand.AlertType.ALERT_HAND_NOT_TRACKED || _label == rs.hand.AlertType.ALERT_HAND_OUT_OF_BORDERS) {
                    clearHandsPosition();
                }
            }

            // retrieve the fired gestures
            for (g = 0; g < data.firedGestureData.length; g++) {
                $('#gestures_status').text('Gesture: ' + JSON.stringify(data.firedGestureData[g]));
            }
        }

        // stop streaming
        $('#Stop').click(function () {

            sense.release().then(function (result) {
                status('Stopped');
                sense = undefined;
                $(this).hide()
		        		$('#Start').show();
                clear();
            });
        });

        // On connected to device info
        function onConnect(sender, connected) {
            if (connected == true) {
                $('#alerts_status').append('Connect with device instance: ' + sender.instance + '<br>');
            }
        }

        // Error status
        function onStatus(sender, sts) {
            if (sts < 0) {
                status('Module error with status code: ' + sts);
                clear();
            }
        }

        // Status msg
        function status(msg) {
            $('#status').text(msg);
        };

        // clear alerts & gestures
        function clear() {
            clearHandsPosition();
            $('#alerts_status').text('');
            $('#gestures_status').text('');
        };

    });

	};


//renderHands.js

/*
The MIT License

Copyright © 2010-2015 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// sphere width segments, heightSegments
var sp_wseg = 8;
var sp_hseg = 8;

var MaxHands = 2;
var MaxJoints = intel.realsense.hand.NUMBER_OF_JOINTS;
var MaxLandmarks = 78;

// hand base sphere radius, width segments, heightSegments
var sp_hradius = 11;
// hand joints
var hand_joints_array = new Array(2);

// face base radius 
var sp_fradius = 0.40;
// face points
var face_points_array;
// face detection plane
var detectionPlane;

// maxFaces (only detection & landmark in current sample renderer)
var maxFaces = 1; //initialized to 1

// Create Sphere Function used across face & hand
function createSphere(_radius, _wSegments, _hSegments, _specularColor, _color, _emmisive, _shininess){
    var geometry = new THREE.SphereGeometry(_radius, _wSegments, _hSegments);
    var material = new THREE.MeshPhongMaterial({
        specular: _specularColor,
        color: _color,
        emissive: _emmisive,
        shininess: _shininess
    });
    var sphere = new THREE.Mesh(geometry, material);
    return sphere;
}


/** HAND RENDERER METHODS **/

// show/hide spheres for joints not active
function checkHandJointsVisible() {

    for (i = 0; i < MaxHands; i++){
        for (j = 0; j < MaxJoints; j++) {
            if (hand_joints_array[i][j].position.x == 0 && hand_joints_array[i][j].position.y == 0 && hand_joints_array[i][j].position.z == 0)
                hand_joints_array[i][j].visible = false;
            else
                hand_joints_array[i][j].visible = true;
        }
    }
}

// reset joints position
function clearHandsPosition(_label) {

   // if (_label == 16384) {
        for (i = 0; i < MaxHands; i++) {
            for (j = 0; j < MaxJoints; j++) {
                hand_joints_array[i][j].position.set(0, 0, 0);
            }
        }
   // }
}

// initialize sample hand renderer
function initHandRenderer(w, h) {

    // setup THREE.JS scene, camera & renderer
    w += 250; // wider Window
    
    // initialize 2D array
    for (i = 0; i < MaxHands; i++) {
        hand_joints_array[i] = new Array(MaxJoints);
    }

    // scene & camera
    // scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, w / h, 1, 1500);
    camera.position.z = -60;
    camera.rotateY = 90 * Math.PI / 180;
    camera.lookAt(scene.position);

    // // renderer
    // renderer = new THREE.WebGLRenderer({ alpha: true } );
    
    // // set window size
    renderer.setSize(w, h);
    renderer.setClearColor( 0x000000, 0 ); // the default
    // var container = document.getElementById('renderercontainer');
    // container.appendChild(renderer.domElement);

    // ambient lighting
    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // directional lighting (Top)
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.85);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
    
    // directional light (Bottom)
    var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(0, -1, 0);
    scene.add(directionalLight2);

    // Grid
    var grid = new THREE.GridHelper(400, 80);
    grid.setColors('#FFFFFF', '#FFFFFF');
    grid.position.z = 875;
    grid.position.y = -200;
    scene.add(grid);
   
    fillHandScene(); // create spheres
    handRendererUpdate(); // hand renderer update
    scene.simulate();
    return hand_joints_array;
}

// update hand renderer
function handRendererUpdate() {
    requestAnimationFrame(handRendererUpdate);
    checkHandJointsVisible();
    renderer.render(scene, camera);
}

// create objects(spheres) for the hand scene
function fillHandScene() {
    for(i = 0; i< MaxHands; i++){
        for (j = 0; j < MaxJoints; j++) {
            if (j == 5 || j == 9 || j == 13 || j == 17 || j == 21) {
                hand_joints_array[i][j] = createSphere(sp_hradius, sp_wseg, sp_hseg, '#414141', '#f0e53d', '#0f0e0e', 100);
            } else if (j == 1) {
                hand_joints_array[i][j] =  createSphere(sp_hradius+4, sp_wseg, sp_hseg, '#414141', '#ff000e', '#0f0e0e', 100);
            } else {
                hand_joints_array[i][j] = createSphere(sp_hradius-3, sp_wseg, sp_hseg, '#525252', '#1b93ff', '#0f0e0e', 100);
            }
            scene.add(hand_joints_array[i][j]);
        }
    }
}

/** END OF HAND RENDERER METHODS */