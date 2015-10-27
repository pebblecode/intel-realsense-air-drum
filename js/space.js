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

  if (typeof document.hidden !== "undefined") {
      hiddenObj = "hidden";
      visChangeEvent = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
      hiddenObj = "msHidden";
      visChangeEvent = "msvisibilitychange";
  } else if (typeof document.mozHidden !== "undefined") {
      hiddenObj = "mozHidden";
      visChangeEvent = "mozvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
      hiddenObj = "webkitHidden";
      visChangeEvent = "webkitvisibilitychange";
  }


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

  var axisHelper = new THREE.AxisHelper( 100 );
  scene.add( axisHelper );

  //use render in renderHands.js
	// var render = function () {
	// 	requestAnimationFrame( render );
	// 	renderer.render(scene, camera);
	// };

	// render();

	intel.realsense.SenseManager.detectPlatform(['hand'], ['front']).then(function (info) {
      if (info.nextStep == 'ready') {
         console.log('ready!')
         // mainLogic();
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
        		$('#Stop')).show();
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

                //initialize sample renderer
                if (scene == null) {
                    nodestorender = initHandRenderer(imageSize.width, imageSize.height);
                }

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
                }
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



// })();