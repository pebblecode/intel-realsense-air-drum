
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('content').appendChild(renderer.domElement);

Physijs.scripts.worker = 'js/vendor/physijs_worker.js';
Physijs.scripts.ammo = 'physijs_ammo.js';

var scene = new Physijs.Scene;
scene.setGravity(new THREE.Vector3( 0, -30, 0 ));

scene.addEventListener(
			'update',
			function() {
				scene.simulate( undefined, 1 );
			}
		);

var camera = new THREE.PerspectiveCamera(
	35,
	window.innerWidth / window.innerHeight,
	1,
	1000
);
camera.position.set( 60, 50, 60 );
camera.lookAt( scene.position );
scene.add( camera );

light = new THREE.DirectionalLight( 0xFFFFFF );
light.position.set( 20, 40, -15 );
light.target.position.copy( scene.position );
light.castShadow = true;
light.shadowCameraLeft = -60;
light.shadowCameraTop = -60;
light.shadowCameraRight = 60;
light.shadowCameraBottom = 60;
light.shadowCameraNear = 20;
light.shadowCameraFar = 200;
light.shadowBias = -.0001
light.shadowMapWidth = light.shadowMapHeight = 2048;
light.shadowDarkness = .7;
scene.add( light );

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

var ground = new Physijs.BoxMesh(
	new THREE.BoxGeometry(100,1,100),
	groundMaterial,
	0
);

ground.receiveShadow = true;
scene.add(ground);

var balls = [];
function createBall(){
	var ball = new Physijs.SphereMesh(
		new THREE.SphereGeometry( 3 ),
		new Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: 0xEEFF11 }))
	); 

	
	ball.collisions = 0;

	ball.position.set(
		Math.random() * 15 - 7.5,
		25,
		Math.random() * 15 - 7.5
	);

	ball.castShadow = true;

	ball.addEventListener('collision', function( other_object, relative_velocity, relative_rotation, contact_normal ) {
	// `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
		console.log('hit')
	});

	balls.push(ball);
	scene.add(ball);	
}

createBall();
setTimeout(createBall, 2000);
// createBall();


 

function render(){
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	// balls[1].position.y--;
}
requestAnimationFrame(render);
scene.simulate();
