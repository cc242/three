/*global WebARCamera*/
import Visualisation from './creative/Visualisation';
import Layout from './core/layout';
import loadJS from 'load-js';
import * as $ from "jquery";
import TweenMax from 'gsap';
let visualisation;

let screens = {
    intro: {
        container: '.intro'
    },
    experience: {
        container: '.experience'
    }
}

var creative = {
    defaults: {
        container: '.container'
    },
    options: {},
    config: {container: '', width: 320, height: 568},
    init: function(opts) {

        for(var i in opts){
            this.options[i] = {
                value: opts[i],
                enumerable: true,
                writeable: true,
                configurable: true
            }
        }
        this.config = Object.create(this.defaults, this.options);

        let layout = new Layout(this.config);


        /**
         * Load Three.js scripts here as they aren't well supported on npm
         */
        /*var arr_scripts_cdn = [
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/92/three.min.js',
            'https://threejs.org/examples/js/controls/OrbitControls.js',
            'https://threejs.org/examples/js/controls/DeviceOrientationControls.js',
            'https://cdnjs.cloudflare.com/ajax/libs/stats.js/r16/Stats.min.js'
        ];*/
        var arr_scripts_cdn = [
            'scripts/three.min.js',
            'scripts/OrbitControls.js',
            'scripts/DeviceOrientationControls.js',
            'scripts/Stats.min.js'
        ];

        let loadArray = [];
        for (let value of arr_scripts_cdn) {
            let loadObj = {async: false, url: value};
            loadArray.push(loadObj);
        }
        loadJS( loadArray )
            .then(() => {
                console.log("scripts loaded");
                this.start();
            });
    },
    start() {
        this.showPage(screens.intro)
        visualisation = new Visualisation(this.config);

        $('.intro__cta').on('touchend click', (e)=> {
            e.preventDefault();
            $('.intro__cta').off();
            $('.intro__prompt').fadeIn();
            this.initCamera();
        });
    },
    showPage(id) {
        for (const [key] of Object.entries(screens)) {
                   $('.page').hide();
                   $(id.container).fadeIn();
                }
        switch(id) {
            case screens.experience:
                visualisation.start();
                break;
        }
    },
    initCamera() {
        setTimeout(()=> {
            WebARCamera.camera.init({
                camera: 'environment',
                domElementID: 'webar_video',
                debug: false
            });

            var self = this;
            WebARCamera.camera.addEventListener("camera_event", function(e) {
                console.log('%ccamera_event: ' + e.detail, 'background: #222; color: #fff');
                switch (e.detail) {
                    case 'NotAllowedError':
                        alert('denied');
                        break;
                    case 'PermissionDeniedError':
                        alert('denied');
                        break;
                    case 'PermissionGranted':
                        self.showPage(screens.experience);
                        // experience = true;
                        break;
                    case 'NotSupportedError':
                        alert('denied');
                        break;
                }
            });
        }, 1000);
    }
};


export default creative;