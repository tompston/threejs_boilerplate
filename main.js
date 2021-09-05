// https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_keyframes.html

import "./style.css";
import * as THREE from "three";

import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "./node_modules/three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "./node_modules/three/examples/jsm/environments/RoomEnvironment";
import Stats from "./node_modules/three/examples/jsm/libs/stats.module";

// const loader = new THREE.TextureLoader();
let mixer;

let container_height = document.querySelector("#container").clientHeight;
let container_width = document.querySelector("#container").clientWidth;

const clock = new THREE.Clock();
const container = document.getElementById("container");

const stats = new Stats();
container.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  // canvas: document.querySelector("canvas"),
  canvas: document.querySelector("#first_canvas_element"),
});

renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);   // used when you need full canvas
// renderer.setSize(container_width, container_height);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;

const fov = 30;
const aspect = container_width / container_height; // the canvas default
const near = 1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(20, 5, 10);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(1, 1, 1);
// controls.update();
controls.enablePan = true;
controls.minDistance = 20;
controls.maxDistance = 85;
controls.enableDamping = true;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("js/libs/draco/gltf/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
//
loader.load(
  // .glb files also work
  "./models/astron.gltf",
  function (gltf) {
    const model = gltf.scene;

    model.position.set(0, -3.3, 0); //  set where the coordinate of the imported model
    model.scale.set(2, 2, 2); // set the size of the model (all values the same)

    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();

    animate();
  },
  undefined,
  function (e) {
    console.error(e);
  }
);

function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixer.update(delta);

  controls.update();
  stats.update();

  resizeCanvasToDisplaySize();
  renderer.render(scene, camera);
}

// renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.shadowMap = THREE.PCFSoftShadowMap;
