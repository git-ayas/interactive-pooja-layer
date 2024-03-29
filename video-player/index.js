import * as THREE from './libs/three.module.js'
import TWEEN from './libs/Tween.js'

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
var bodies = document.getElementsByTagName("body");
var hammertime = new Hammer(document.getElementById('interactiveLayer'));
var camera, scene, renderer;
var plane;
var mouse, raycaster, isShiftDown = false;
var particleSystem,particlesPosition,particlesTarget,partTween;// create the particle variables
var travPartFlag = false;
var addPartFlag = true;

//plasma shooter
var plasmaBalls = [];
var emitter = new THREE.Object3D();
var speed = 40;
var clock = new THREE.Clock();
//!plasma shooter
var TWEENi;

var particleCount = 40,

    particles = new THREE.Geometry(),
    pMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        transparent: true,
        size: 50,
        map: new THREE.TextureLoader().load(
            "textures/particle-lower.png"
        ),
        blending: THREE.AdditiveBlending,

    });

var rollOverMesh, rollOverMaterial;
var flowerBtnMesh, flowerBtnMaterial
var cubeGeo, cubeMaterial;
var followMouse = false;
var objects = [];
init();
render();
function init() {
    document.getElementById('fullScreeBtn').onclick=toggleFullscreen;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 1000, 0);
    camera.lookAt(0, 0, 0);
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0xf0f0f0);
    //scene.background = new THREE.Color(0x000000);

    scene.transparent = true;

    // roll-over helpers
    var rollOverGeo = new THREE.PlaneGeometry(200, 75, 75);
    rollOverGeo.rotateX(-Math.PI / 2);

    rollOverMaterial = new THREE.MeshLambertMaterial({
        color: null,
        map: new THREE.TextureLoader().load('textures/pooja-thaali-lower.png'),
        transparent: true
    });

    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    rollOverMesh.overdraw = true;
    rollOverMesh.position.set(0, 1, 240);
    scene.add(rollOverMesh);

    //add flower button
    var flowerBtnGeo = new THREE.PlaneGeometry(200, 100, 200);
    flowerBtnGeo.rotateX(-Math.PI / 2);
    flowerBtnMaterial = new THREE.MeshLambertMaterial({
        color: null,
        map: new THREE.TextureLoader().load('textures/flowerBtn.png'),
        transparent: true
    });
    flowerBtnMesh = new THREE.Mesh(flowerBtnGeo, flowerBtnMaterial);
    flowerBtnMesh.position.set(-200, 1, 240);
    scene.add(flowerBtnMesh)






    // cubes
    cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial(
        {
            color: 0xfeb74c,
            map: new THREE.TextureLoader().load('textures/square-outline-textured.png')
        });
    // grid
    var gridHelper = new THREE.GridHelper(1000, 20);
    //scene.add(gridHelper);
    //
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2);
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);
    objects.push(plane);


    // now create the individual particles
    for (var p = 0; p < particleCount; p++) {

        // create a particle with random
        // position values, -250 -> 250
        var pX = Math.random() * 500 - 250,
            pY = Math.random() * 500 - 250,
            pZ = Math.random() * 500 - 250,
            particle = new THREE.Vector3(pX, pY, pZ);

        // create a velocity vector
        particle.velocity = new THREE.Vector3(
            0,				// x
            -Math.random(),	// y
            0);				// z


        // add it to the geometry
        particles.vertices.push(particle);
    }


    // create the particle system    
    particleSystem = new THREE.Points(
        particles,
        pMaterial);

    particleSystem.rotateX(-Math.PI / 2);
    particleSystem.position.set(0, 1100, 200)

    particleSystem.size = 1000;
    // also update the particle system to
    // sort the particles which enables
    // the behaviour we want
    //particleSystem.sortParticles = true;
    
    /* Particle system tween setup */
    particlesPosition={x:0,y:1000,z:200};
    particlesTarget={x:0,y:-1,z:200};
    partTween= new TWEEN.Tween(particlesPosition);
    partTween.to(particlesTarget,2000);
    /* partTween.onUpdate(function () {
        particleSystem.position.set(particlesPosition.x,particlesPosition.y,particlesPosition.z);
        
    }); */
    //partTween.onUpdate(travelParticles);
    partTween.onUpdate(tweenTravelParticles);
    partTween.start();
    





    // add it to the scene

    





    // lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0xffffff, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(document.getElementById('interactiveLayer').offsetWidth - 30, window.innerHeight);
    var hammertime = new Hammer(document.getElementById('interactiveLayer'));
    hammertime.on('tap', onDocumentTouchPress);
    document.getElementById('interactiveLayer').appendChild(renderer.domElement);



    document.addEventListener('mousemove', onDocumentMouseMove, false);
    //hammertime.on('pan',onDocumentTouchPan)
    document.addEventListener('touchmove', onDocumentTouchPan, false);
    document.addEventListener('touchend', resetThaaliPos, false);

    //document.addEventListener('touchstart', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    //hammertime.on('press',onDocumentMouseDown)
    document.addEventListener('mouseup', resetThaaliPos, false);
    //document.addEventListener('touchend', resetThaaliPos, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    //
    window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
    //camera.aspect = window.innerWidth / window.innerHeight;
    camera.aspect = document.getElementById('interactiveLayer').offsetWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(document.getElementById('interactiveLayer').offsetWidth - 20, window.innerHeight);
}


function onDocumentMouseMove(event) {

    event.preventDefault();
    mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        var intersect = intersects[0];
        if (followMouse) {
            rollOverMesh.position.copy(intersect.point)//.add(intersect.face.normal);
            rollOverMesh.position.divideScalar(1).floor().multiplyScalar(1).addScalar(1);
        } else {
            resetThaaliPos();
        }

    }
    render();
}
function onDocumentTouchPan(event) {
    onDocumentTouchCPointContact(event)
    event.preventDefault();
    mouse.set((event.changedTouches[0].clientX / window.innerWidth) * 2 - 1, - (event.changedTouches[0].clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        var intersect = intersects[0];
        //console.log("Following:" + followMouse)
        if (followMouse) {
            rollOverMesh.position.copy(intersect.point)//.add(intersect.face.normal);
            rollOverMesh.position.divideScalar(1).floor().multiplyScalar(1).addScalar(1);
        } else {
            resetThaaliPos();
        }
    }
    render();
}
function resetThaaliPos() {
    followMouse = false;
    rollOverMesh.position.set(0, 1, 240);

}
// animation loop
function updateParticle() {

    // add some rotation to the system
    //particleSystem.rotation.z += 0.01;
    //particleSystem.rotation.y += 0.01;
    particleSystem.size = Math.random() * 0.05 + 0.93;
    //travelParticles()
    partTween.update()



    /* var pCount = particleCount;
    while (pCount--) {
        // get the particle
        var particle = particles.vertices[pCount];


        // check if we need to reset
        if (particle.y < -200) {
            particle.y = 200;
            particle.velocity.y = 0;

        }

        // update the velocity
        particle.velocity.y -= Math.random() * .1;



        // and the position
        particle.add(particle.velocity);
    }

    particleSystem.z += 100;

    // flag to the particle system that we've
    // changed its vertices. This is the
    // dirty little secret.
    particleSystem.geometry.__dirtyVertices = true;
 */

    
    // set up the next call
    requestAnimFrame(updateParticle);
    
    render();
}
function onDocumentMouseDown(event) {

    resetThaaliPos();
    //shootBall();

    event.preventDefault();

    mouse.set((event.pageX / window.innerWidth) * 2 - 1, - (event.pageY / window.innerHeight) * 2 + 1);
    if (event.type == 'touchstart') {
        mouse.set((event.touches[0].clientX / window.innerWidth) * 2 - 1, - (event.touches[0].clientY / window.innerHeight) * 2 + 1);
    }

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);

    //travelParticles()

    if (intersects.length > 0) {
        var intersect = intersects[0];
        var currentPoint = intersect.point;

        if ((currentPoint.x > -94) && (currentPoint.x < 94)) {
            if ((currentPoint.z > 202) && (currentPoint.z < 277)) {
                followMouse = true;
            }
        }
        if ((currentPoint.x > -284) && (currentPoint.x < -119)) {
            if ((currentPoint.z > 202) && (currentPoint.z < 277)) {
                toggleFlowers();
            }
        }
    }
    updateParticle();
    return;

}
function onDocumentTouchPress(event) {

    resetThaaliPos();



    event.preventDefault();

    // mouse.set((event.deltaX / window.innerWidth) * 2 - 1, - (event.deltaY / window.innerHeight) * 2 + 1);

    //mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    mouse.set((event.pointers[0].clientX / window.innerWidth) * 2 - 1, - (event.pointers[0].clientY / window.innerHeight) * 2 + 1);


    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);

    travelParticles()

    if (intersects.length > 0) {
        var intersect = intersects[0];
        var currentPoint = intersect.point;

        if ((currentPoint.x > -94) && (currentPoint.x < 94)) {
            if ((currentPoint.z > 200) && (currentPoint.z < 268)) {
                //console.log('Capture Point detected.')
                followMouse = true;
            }
        }
    }
    updateParticle();
    return;
}
function onDocumentTouchCPointContact(event) {




    event.preventDefault();

    // mouse.set((event.deltaX / window.innerWidth) * 2 - 1, - (event.deltaY / window.innerHeight) * 2 + 1);

    //mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    mouse.set((event.targetTouches[0].clientX / window.innerWidth) * 2 - 1, - (event.targetTouches[0].clientY / window.innerHeight) * 2 + 1);


    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);

    travelParticles()

    if (intersects.length > 0) {
        var intersect = intersects[0];
        var currentPoint = intersect.point;

        if ((currentPoint.x > -94) && (currentPoint.x < 94)) {
            if ((currentPoint.z > 200) && (currentPoint.z < 268)) {
                //console.log('Capture Point detected.')
                followMouse = true;
            }
        }
    }
    updateParticle();
    return;
}
function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 16: isShiftDown = true; break;
        case 49: toggleFlowers(); break;
        default:
        //console.log(event.keyCode)
    }
}
function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 16: isShiftDown = false; break;

    }
}
function travelProjectile() {
    let delta = clock.getDelta();
    plasmaBalls.forEach(b => {
        b.translateY(-speed * delta); // move along the local z-axis
    });
}
function toggleFlowers() {
    travPartFlag = !travPartFlag
}
function toggleThaali() {
    followMouse = !followMouse;
}
function toggleFullscreen() {
    $('.video-react-big-play-button').trigger("click");
    var elem = document.getElementById('parent_space');
    elem.requestFullscreen();
}
function travelParticles() {
    let delta = clock.getDelta();
    const partSpeed = -500;
    if (travPartFlag) {
        if (addPartFlag) {
            scene.add(particleSystem);
            addPartFlag = false;
        }

        particleSystem.translateY(-partSpeed * delta / 10);
        particleSystem.translateZ(partSpeed * delta);

    }

    if ((particleSystem.position.z < -300) || !travPartFlag) {
        scene.remove(particleSystem);
        particleSystem.position.set(0, 1000, 200);
        //scene.add(particleSystem);
        travPartFlag = false;
        addPartFlag = true;

    }

}
function tweenTravelParticles() {
   
    if (travPartFlag) {
        if (addPartFlag) {
            scene.add(particleSystem);
            addPartFlag = false;
            
        }
        console.log(particleSystem.position.y);

        particleSystem.position.set(particleSystem.position.x,--particleSystem.position.y,particleSystem.position.z)
        

    }

    if ((particleSystem.position.y < -200) || !travPartFlag) {
        scene.remove(particleSystem);
        particleSystem.position.set(0, 1000, 200);
        partTween.stop();
        //scene.add(particleSystem);
        travPartFlag = false;
        addPartFlag = true;

    }

}

function render() {


    renderer.render(scene, camera);
}
