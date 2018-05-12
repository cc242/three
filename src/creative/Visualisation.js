/*global Hammer TweenMax THREE Back Quad Linear Elastic trackMe $*/

import {EventEmitter} from 'events';
import ThreeSetup from './Three.Setup';
import Sprites from "./Sprites";
import * as $ from "jquery";

let three, sprites, paused;
let scene, object, stats, camera, renderer;
let INTERSECTED, raycaster, mouse, frustrum, cameraViewProjectionMatrix, intersect_timeout;
let groups;
let count = 0;
let multiples = 4;
let arr_assets = [
    {json: 'anim/rainbow.json', id: 'rainbow'},
    {json: 'anim/kiss.json', id: 'kiss'},
    {json: 'anim/peeing_pug.json', id: 'peeing_pug'},
    {json: 'anim/dance.json', id: 'dance'},
    {json: 'anim/butt_notype.json', id: 'butt_notype'},
    {json: 'anim/skipping.json', id: 'skipping'},
    {json: 'anim/star.json', id: 'star'},
    {json: 'anim/star.json', id: 'star2'},
    {json: 'anim/butt.json', id: 'butt'},
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

        let scene_max = [
            {id: 'rainbow1', canvas: 'rainbow'},
            {id: 'rainbow2', canvas: 'rainbow'},
            {id: 'rainbow3', canvas: 'rainbow'},
            {id: 'rainbow4', canvas: 'rainbow'},
            {id: 'kiss1', canvas: 'kiss'},
            {id: 'kiss2', canvas: 'kiss'},
            {id: 'kiss3', canvas: 'kiss'},
            {id: 'kiss4', canvas: 'kiss'},
            {id: 'peeing_pug1', canvas: 'peeing_pug'},
            {id: 'peeing_pug2', canvas: 'peeing_pug'},
            {id: 'peeing_pug3', canvas: 'peeing_pug'},
            {id: 'dance1', canvas: 'dance'},
            {id: 'dance2', canvas: 'dance'},
            {id: 'dance3', canvas: 'dance'},
            {id: 'dance4', canvas: 'dance'},
            {id: 'butt_notype1', canvas: 'butt_notype'},
            {id: 'butt_notype2', canvas: 'butt_notype'},
            {id: 'butt_notype3', canvas: 'butt_notype'},
            {id: 'skipping1', canvas: 'skipping'},
            {id: 'skipping2', canvas: 'skipping'},
            {id: 'skipping3', canvas: 'skipping'},
            {id: 'twerk1', canvas: 'twerk'}
        ];
        groups = [];
        for (let i=0; i<scene_max.length; i++) {
            let s = three.getTHREESprite(sprites.getCanvas(scene_max[i].canvas), scene_max[i].id);
            scene_sprites.push({sprite: s, id: scene_max[i].id, canvas: scene_max[i].canvas});

            let angle = Math.random()*Math.PI*2;
            let radius = (Math.random() * 2000) + 3000;
            let xpos = Math.cos(angle) *radius;
            let zpos = Math.sin(angle)*radius;
            let group = new THREE.Object3D();
            group.add(s);
            scene.add(group);

            groups.push({canvas: scene_max[i].canvas, group: group, id: scene_max[i].id, spr: s, disappear: 300 + (Math.floor(Math.random() * 400))});
            s.scale.set(800, 800, 1.0);

            switch (scene_max[i].id) {
                case 'skipping1':
                case 'skipping2':
                case 'skipping3':
                    group.rotationspeed = 0.002;
                    s.position.set(xpos, 0,  zpos);
                    break;
                case 'rainbow1':
                    group.rotationspeed = 0.01;
                    s.position.set(0, 3000,  0);
                    break;
                case 'peeing_pug1':
                    group.rotationspeed = 0.002;
                    s.position.set(0, 3000,  0);
                    break;
                case 'twerk':
                    group.rotationspeed = 0;
                    s.position.set(xpos, 0,  zpos);
                    break;
                default:
                    group.rotationspeed = 0.001;
                    s.position.set(xpos, Math.random() * 3000,  zpos);
            }

        }
        console.log('', groups);
        function getPos() {
            return (Math.random() > 0.5 ? 1 : -1) * (2500 + Math.random() * 2500);
        }
        return;

        for (let i=0; i<arr_assets.length; i++) {

                let spr = three.getTHREESprite(sprites.getCanvas(arr_assets[i].id), arr_assets[i].id);
                let group = new THREE.Object3D();
                scene.add(group);
                group.add(spr);
                sprites.getSprite(arr_assets[i].id).render = true;

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
        /*for (let i=0; i<arr_images.length; i++) {
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
        }*/
    }
    getPosition() {
        let angle = Math.random()*Math.PI*2;
        let radius = (Math.random() * 3000) + 1000;
        let xpos = Math.cos(angle) *radius;
        let zpos = Math.sin(angle)*radius;
        return {x: xpos, z: zpos};
    }
    animate() {
        stats.begin();
        three.animate();
        sprites.drawCanvas();
        requestAnimationFrame( this.animate.bind(this) );

        count++;

        for (let i=0; i<groups.length; i++) {
             groups[i].group.rotation.y += groups[i].group['rotationspeed'];
            switch(groups[i].id) {
                case 'rainbow2':
                    groups[i].group.position.z = (Math.cos(count/40) * 1300) + 0;
                    groups[i].group.position.y = (Math.sin(count/40) * 800) + 100;
                    break;
                case 'peeing_pug1':
                    groups[i].group.position.y = (Math.sin(count/40) * 1300) + 0;
                    break;
                case 'peeing_pug2':
                    groups[i].group.position.y = (Math.sin(count/100) * 160) + 220;
                    break;
                case 'peeing_pug3':
                    groups[i].group.position.y = (Math.sin(count/100) * 160) + 320;
                    break;
                case 'butt':
                    groups[i].group.position.y = (Math.sin(count/80) * 120) + 70;
                    break;
            }
            if (count % groups[i].disappear == 0) {
                // console.log('', three.hideObject('twerk1'));
                sprites.hide(groups[i].canvas);
               // groups[i].spr.position.set(this.getPosition().x, Math.random() * 3000,  this.getPosition().z);
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
        let obj_onscreen = {};
        for (let i=0; i<scene_sprites.length; i++) {
            sprites.getSprite(scene_sprites[i].canvas).render = false;
            if (frustrum.intersectsSprite( three.getObject(scene_sprites[i].id)) ) {
                obj_onscreen[scene_sprites[i].canvas] = sprites.getSprite(scene_sprites[i].canvas);
            }
        }
        for (const [key] of Object.entries(obj_onscreen)) {
                   let obj = obj_onscreen[key];
                   obj.render = true;
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