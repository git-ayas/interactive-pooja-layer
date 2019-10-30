import * as THREE from './libs/three.module.js';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.set(0, 0, 1);
scene.add(camera);
var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//var controls = new THREE.OrbitControls(camera, renderer.domElement);
var controls= THREE.

var background = new THREE.Mesh(new THREE.SphereGeometry(1000, 90, 45), new THREE.MeshBasicMaterial({
    color: "gray",
    wireframe: true
}));
scene.add(background);

var weapon = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 5), new THREE.MeshBasicMaterial({
    color: 0x5555ff
}));
weapon.position.set(2, -1, -2.5);
camera.add(weapon);
var emitter = new THREE.Object3D();
emitter.position.set(2, -1, -5);
camera.add(emitter);


var plasmaBalls = [];
window.addEventListener("mousedown", onMouseDown);

function onMouseDown() {
    let plasmaBall = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 4), new THREE.MeshBasicMaterial({
        color: "aqua"
    }));
    plasmaBall.position.copy(emitter.getWorldPosition()); // start position - the tip of the weapon
    plasmaBall.quaternion.copy(camera.quaternion); // apply camera's quaternion
    scene.add(plasmaBall);
    plasmaBalls.push(plasmaBall);
}

var speed = 50;
var clock = new THREE.Clock();
var delta = 0;

(function render() {
    requestAnimationFrame(render);
    delta = clock.getDelta();
    plasmaBalls.forEach(b => {
        b.translateZ(-speed * delta); // move along the local z-axis
    });
    renderer.render(scene, camera);
})()