/*global Hammer TweenMax THREE Back Quad Linear Elastic trackMe $*/

import {EventEmitter} from 'events';
import ThreeSetup from './Three.Setup';
import Sprites from "./Sprites";
import * as $ from "jquery";

let three, sprites, paused;
let scene, object, stats, camera, renderer;
let INTERSECTED, raycaster, mouse, frustrum, cameraViewProjectionMatrix, intersect_timeout;
let arr_groups, arr_threeSprites;
let count = 0;
let multiples = 4;
let arr_assets = [
    {json: 'anim/rainbow.json', id: 'rainbow'},
    {json: 'anim/kiss.json', id: 'kiss'},
    {json: 'anim/peeing_pug.json', id: 'peeing_pug'},
    {json: 'anim/dance.json', id: 'dance'},
    {json: 'anim/butt_notype.json', id: 'butt_notype'},
    {json: 'anim/butt.json', id: 'butt'},
    {json: 'anim/skipping.json', id: 'skipping'},
    {json: 'anim/twerk_small.json', id: 'twerk'}
];
let arr_images = [
    {img: 'anim/en-megapack_heart-09.png', id: 'heart'},
    {img: 'anim/en-megapack_143-lips.png', id: 'lips'},
    {img: 'anim/Wink.png', id: 'wink'},
    {img: 'anim/en-megapack_143-lips.png', id: 'lips'},
    {img: 'anim/Crying.png', id: 'crying'},
    {img: 'anim/en-megapack_heart-09.png'}
];


let scene_sprites;
class Experience extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.init()
    }
    start() {
        this.showNotification('blah', 2)
    }
    init() {
        three = new ThreeSetup(this.config);
        scene = three.getScene();
        object = three.getCrate();
        stats = three.getStats();
        camera = three.getCamera();
        renderer = three.getRenderer();
        document.body.appendChild(stats.domElement);

        scene.add(object);

        // on-screen stuff
        mouse = new THREE.Vector2();
        raycaster = new THREE.Raycaster();
        frustrum = new THREE.Frustum();
        cameraViewProjectionMatrix = new THREE.Matrix4();

        this.createSprites();
    }
    createSprites() {
        sprites = new Sprites();
        arr_groups = [];
        sprites.initPixi();
        sprites.loadSprites(arr_assets).then(() => {
            this.addSprites();
            this.animate();
        });
    }
    addSprites() {
        /**
         * These are the animated sprites
         */
        scene_sprites = [];

        // create a sprite
        console.log('', sprites.getCanvas('rainbow'));
        let s = three.getTHREESprite(sprites.getCanvas('rainbow'), 'mysprite');
        scene.add(s);
        scene_sprites.push({sprite: s, id:'mysprite'});
        s.position.set(-1200, 0, 400);
        s.scale.set(1024, 1024, 1.0);
        sprites.getSprite('rainbow').render = true;

        let s2 = three.getTHREESprite(sprites.getCanvas('rainbow'), 'mysprite2');
        scene.add(s2);
        scene_sprites.push({sprite: s2, id:'mysprite2'});
        s2.position.set(1200, 200, 300);
        s2.scale.set(1024, 1024, 1.0);
        sprites.getSprite('rainbow').render = true;





        function getPos() {
            return (Math.random() > 0.5 ? 1 : -1) * (2500 + Math.random() * 1500);
        }

        return;


        let spr = three.getTHREESprite(sprites.getCanvas('rainbow'), 'rainbow');
        let group = new THREE.Object3D();
        scene.add(group);
        group.blah = 'rainbow';
        group.add(spr);
        scene_sprites.push({sprite: spr, id:'rainbow'});
        sprites.getSprite('rainbow').render = true;

        arr_groups.push(group);
        group.rotationspeed = (1 * (0.001) + 0.002);
        spr.position.set(getPos(), Math.random() * 3000, getPos());
        spr.scale.set(1024, 1024, 1.0);

        let spr2 = three.getTHREESprite(sprites.getCanvas('rainbow'), 'rainbow2');
        let group2 = new THREE.Object3D();
        scene.add(group2);
        group2.blah = 'rainbow';
        group2.add(spr2);
        scene_sprites.push({sprite: spr2, id:'rainbow2'});
        sprites.getSprite('rainbow').render = true;

        arr_groups.push(group2);
        group2.rotationspeed = (1 * (0.001) + 0.002);
        spr2.position.set(getPos(), Math.random() * 3000, getPos());
        spr2.scale.set(1024, 1024, 1.0);

        function getPos() {
            return (Math.random() > 0.5 ? 1 : -1) * (2500 + Math.random() * 1500);
        }

        return;

        for (let i=0; i<arr_assets.length; i++) {

                let spr = three.getTHREESprite(sprites.getCanvas(arr_assets[i].id), arr_assets[i].id);
                let group = new THREE.Object3D();
                scene.add(group);
                group.add(spr);
                sprites.getSprite(arr_assets[i].id).render = true;

                arr_groups[arr_assets[i].id] = group;
                group.rotationspeed = (i * (0.001) + 0.002);

                switch (arr_assets[i].id) {
                    case 'skipping':
                        group.rotationspeed = 0.005;
                        spr.position.set(getPos(), 0, getPos());
                        break;
                    case 'twerk':
                        group.rotationspeed = 0;
                        spr.position.set(600, -200, 600);
                        spr.scale.set(256, 256, 1.0);
                        object.position.x = spr.position.x;
                        object.position.y = spr.position.y;
                        object.position.z = spr.position.z;
                        break;
                    default:
                        spr.position.set(getPos(), Math.random() * 3000, getPos());
                        spr.scale.set(1024, 1024, 1.0);
                }
        }

        /**
         * These are the static images
         */
        for (let i=0; i<arr_images.length; i++) {
            let imgTexture = THREE.ImageUtils.loadTexture( arr_images[i]['img'] );
            let imgMaterial = new THREE.SpriteMaterial( { map: imgTexture, useScreenCoordinates: true } );
            let sprite = new THREE.Sprite( imgMaterial );
            sprite.position.set( getPos(),  Math.random() * 1000, getPos() );
            sprite.scale.set( 512, 512, 1.0 );
            let group = new THREE.Object3D();
            scene.add(group);
            group.add(sprite);
            arr_groups[arr_images[i].id] = group;
            group.rotationspeed = ((i+1) * (0.001) + 0.002);
        }

        function getPos() {
            return (Math.random() > 0.5 ? 1 : -1) * (2500 + Math.random() * 1500);
        }
    }
    animate() {
        stats.begin();
        three.animate();
        sprites.drawCanvas();
        requestAnimationFrame( this.animate.bind(this) );

        count++;

        for (let i=0; i<arr_groups.length; i++) {
            arr_groups[i].rotation.y += arr_groups[i]['rotationspeed'];
            switch(arr_groups[i].blah) {
                case 'peeing_pug':
                    arr_groups[i].position.y = (Math.sin(count/40) * 160) + 120;
                    break;
                case 'butt':
                    arr_groups[i].position.y = (Math.sin(count/80) * 120) + 70;
                    break;
            }
        }



        /**
         * Is sprite on screen
         */
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        cameraViewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
        frustrum.setFromMatrix( cameraViewProjectionMatrix );

       /* switch (true) {
            case frustrum.intersectsSprite( three.getObject('twerk')):
                //console.log('intersecting puggerfly');
                break;
        }*/
        // for every sprite on the screen {sprite, id}
        for (let i=0; i<scene_sprites.length; i++) {
            console.log('', three.getObject(scene_sprites[i].id)));
            if (frustrum.intersectsSprite( three.getObject(scene_sprites[i].id)) ) {
                //sprites.getSprite(scene_sprites[i].id).render = true;
            } else {
                //sprites.getSprite(scene_sprites[i].id).render = false;
            }
        }
        stats.end();
    }

    showNotification(s, delay) {
        TweenMax.set('.experience__notification', {y: -100, alpha: 0});
        $('.experience__notification').show();
        TweenMax.to('.experience__notification', 1, {y: 0, alpha:1, ease:Back.easeOut, delay: delay});
    }

}

export default Experience;