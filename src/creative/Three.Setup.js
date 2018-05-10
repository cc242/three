/*global THREE Stats*/

import {EventEmitter} from 'events';
var screenWidth, screenHeight, scene, renderer, camera, controls, stats
var arr_materials = [];
var objects = {};

class ThreeSetup extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.init()
    }
    init() {
        /**
         * Setup Three.js scene
         * @type {Element}
         */
        let container = document.querySelector( '.experience' );
        screenWidth = document.documentElement.clientWidth;
        screenHeight = document.documentElement.clientHeight;
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setPixelRatio( 2 );
        renderer.setSize( screenWidth, screenHeight );
        renderer.sortObjects = false;
        container.appendChild( renderer.domElement );
        camera = new THREE.PerspectiveCamera( 60, screenWidth / screenHeight, 1, 25000 );

        if (!this.config.gyro) {
            console.log('no gyro');
            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.enableZoom = true;
            camera.position.z = 0;
            camera.position.y = 1600;
            camera.position.z = -1060.9657061668715;
            camera.lookAt(new THREE.Vector3());
        } else {
            controls = new THREE.DeviceOrientationControls( camera );
            var initialPosition = new THREE.Vector3(0, 300, 0);
            camera.position.copy(initialPosition);
        }
        let size = 20000;
        let divisions = 50;
        let gridHelper = new THREE.GridHelper( size, divisions, 0x3b3b3b, 0x3b3b3b );
        scene.add( gridHelper );
        gridHelper.position.y = -300;
        gridHelper.position.x = 5;

        /**
         * Lights
         */
        var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
        scene.add( ambientLight );

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
        directionalLight.position.set( 1, 10, 0 ).normalize();
        scene.add( directionalLight );

        this.getStats();
        // this.animate();
    }
    animate() {

        controls.update();
        renderer.render( scene, camera );
        /**
         * update canvastextures
         */
        for (let i=0; i<arr_materials.length; i++) {
            arr_materials[i]['mat'].map.needsUpdate = true
        }
        //requestAnimationFrame( this.animate.bind(this) );

    }
    getScene() {
        return scene;
    }
    getCamera() {
        return camera;
    }
    getCrate() {
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshPhongMaterial( { depthWrite: true, map: THREE.ImageUtils.loadTexture(require('../img/crate.jpg')) } );
        var object = new THREE.Mesh( geometry, material );
        object.castShadow = true;
        object.receiveShadow = true;
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 0;
        objects['crate'] = object;
        return object;
    }
    getStats() {
        stats = new Stats();
        return stats;
    }
    getTHREESprite(canvas, id) {
        let crateTexture = new THREE.Texture(canvas);
        let crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, useScreenCoordinates: false } );
        arr_materials.push({mat: crateMaterial, canv: canvas});
        let obj = new THREE.Sprite( crateMaterial );
        objects[id] = obj;
        return obj;
    }
    getObject(id) {
        return objects[id];
    }
    getRenderer() {
        return renderer;
    }
}

export default ThreeSetup;