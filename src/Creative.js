/*global WebARCamera Back main mask Popcorn */
import Visualisation from './creative/Visualisation';
import Layout from './core/layout';
import loadJS from 'load-js';
import * as $ from "jquery";
import { flashIn, blur } from './creative/Effects';
import Hammer from 'hammerjs';
import TweenMax from 'gsap';
import Sharing from './creative/Sharing';
const sharing = new Sharing();
let visualisation;
let camera_permission_granted;
let overlay_index = 0;
let screens = {
    intro: {
        container: '.intro'
    },
    experience: {
        container: '.experience'
    },
    selfie: {
        container: '.selfie'
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
        var arr_scripts_cdn_ios = [
            'scripts/three.min.js',
            'scripts/OrbitControls.js',
            'scripts/DeviceOrientationControls.js',
            'scripts/Stats.min.js',
            'scripts/popcorn.min.js',
            'base64images.js'
        ];

        let loadArray = [];
        for (let value of checkIOS() ? arr_scripts_cdn_ios : arr_scripts_cdn) {
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
            //this.showPage(screens.experience);
            this.initCamera();
        });

        visualisation.on('selfie_time', ()=> {
            this.showSelfie();
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
            case screens.selfie:
                $('.experience').hide();
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
                        TweenMax.set(['.test'], {transformPerspective:400, rotationY:90, transformOrigin: "50% 50%"});
                        TweenMax.to(['.test'], 0.5, {transformPerspective:400, rotationY:0, delay: 0, transformOrigin: "50% 50%"});
                        if (!camera_permission_granted) {
                            camera_permission_granted = true
                            self.showPage(screens.experience);
                        }
                        break;
                    case 'NotSupportedError':
                        alert('denied');
                        break;
                }
            });
        }, 1000);
    },
    showSelfie() {
        this.showPage(screens.selfie);
        WebARCamera.camera.addCameraStream('user');

        if (checkIOS()) {
            this.iosVideo();
            $('#vid').hide();
        } else {

        }

        $('#webar_video').width(window.innerWidth);
        $('#webar_video').height(window.innerWidth * 1.33333);
        $('#webar_video').addClass('centered');

        $('.selfie').width(window.innerWidth);
        $('.selfie').height(window.innerWidth * 1.33333);
        $('.selfie').addClass('centered_selfie');

        $('.overlay').fadeOut();

        $('.selfie__button').on('touchend click', (e)=> {
            e.preventDefault();
            this.takePhoto();
        });

        $('.end_buttons__save').on('touchend click', (e)=> {
            e.preventDefault();
            this.savePhoto();
        });

        $('.end_buttons__retake').on('touchend click', (e)=> {
            e.preventDefault();
            // this.retakePhoto();
        });
        $('.selfie__overlay').hide();
    },
    retakePhoto() {
        $('#vid').css('opacity', 1);
        $('#c2').css('opacity', 1);
        $('.selfie__grid').fadeIn();
        $('.selfie__button').fadeIn();
        clearCanvas(document.getElementById('#c'));
        clearCanvas(document.getElementById('#c2'));
        TweenMax.to('.selfie', 0.5, {scaleX: 1, scaleY: 1, delay: 1, ease:Back.easeOut});
        $('body').removeClass('white');
        $('.end_buttons').fadeOut();
    },
    takePhoto() {
        WebARCamera.camera.capture().then((data) => {
            $('#webar_video').css('opacity', 0);
            /**
             * Add camera to canvas
             */
            setTimeout(()=> {
                this.addVideoToCanvas2('webar_video', 'c');
            }, 110);
            /**
             * Add pug to canvas
             */
            setTimeout(()=> {
                if (checkIOS()) {
                    addImageToCanvas(
                        'img/pug'+ getRandom(1,3) +'.png',
                        document.getElementById('c'),
                        window.innerWidth,
                        (window.innerWidth * 1.3333),
                        0 ,0).then(()=> {

                    });
                } else {
                    this.addVideoToCanvas('vid', 'c2');
                }
            }, 120);

            /**
             * Combine
             */
            setTimeout(()=> {
                $('#vid').css('opacity', 0);
                $('#c2').css('opacity', 0);
                $('.selfie__grid').fadeOut();
                $('.selfie__button').fadeOut();
                addCanvasToCanvas(
                    document.getElementById('c2'),
                    document.getElementById('c'),
                    window.innerWidth,
                    (window.innerWidth * 1.3333),
                    0 ,0);
                flashIn('#c');
            }, 130);
            $('.selfie__overlay').show();

            TweenMax.set('.selfie__overlay', {x: 200, alpha: 0});
            TweenMax.to('.selfie__overlay', 0.4, {alpha:1, x:0, ease: Back.easeOut});

            let mc = new Hammer.Manager($('.selfie__overlay').get(0));
            let pinch = new Hammer.Pinch();
            let swipe = new Hammer.Swipe();
            mc.add([pinch, swipe]);
            let self = this;
            mc.on("swipe", function(ev) {
                if (ev.deltaX > 0) {
                    self.changeProduct(1);
                } else {
                    self.changeProduct(-1);
                }
            });
            TweenMax.to('.selfie', 1, {scaleX: 0.95, scaleY: 0.9, delay: 1, ease:Back.easeOut});
            $('body').addClass('white');
            $('.end_buttons').fadeIn();
        })
    },
    changeProduct(idx) {
        overlay_index += idx;
        console.log('swipe', this.getCurrentIndex());
        TweenMax.set('.selfie__overlay', {x: (idx > 0 ? -200 : 200), alpha: 0});
        TweenMax.to('.selfie__overlay', 0.4, {alpha:1, x:0, ease: Back.easeOut});
        $('.selfie__overlay').css('background-image', 'url(img/filter'+ (this.getCurrentIndex()+1) +'.png');
    },
    getCurrentIndex() {
        if (overlay_index >= 4) {
            overlay_index = 0;
        } else if (overlay_index < 0) {
            overlay_index = overlay_index = 3;
        }
        return overlay_index;
    },
    addVideoToCanvas2(video, canvas) {
        let vid = document.getElementById(video);
        let drawcanvas = document.getElementById(canvas);
        let drawcanvas_ctx = drawcanvas.getContext('2d');
        let domRect = document.getElementById(video).getBoundingClientRect();
        let ypos = drawcanvas.height - domRect.height;
        drawcanvas.width = window.innerWidth;
        drawcanvas.height = window.innerWidth * 1.33333;
        drawcanvas_ctx.drawImage(vid, 0, 0, domRect.width, domRect.height);

    },
    addVideoToCanvas(video, canvas) {
        let vid = document.getElementById(video);
        let drawcanvas = document.getElementById(canvas);
        let drawcanvas_ctx = drawcanvas.getContext('2d');
        let domRect = document.getElementById(video).getBoundingClientRect();
        let ypos = drawcanvas.height - domRect.height;
        drawcanvas.width = window.innerWidth;
        drawcanvas.height = window.innerWidth * 1.33333;
        drawcanvas_ctx.drawImage(vid, 0, drawcanvas.height-280, domRect.width, domRect.height);
    },
    draw(v,c,w,h) {
        if(v.paused || v.ended) return false;
        c.drawImage(v,0,0,w,h);
        setTimeout(this.draw,20,v,c,w,h);
    },
    savePhoto() {
        addImageToCanvas(
            'img/filter'+ (this.getCurrentIndex()+1) +'.png',
            document.getElementById('c'),
            window.innerWidth,
            (window.innerWidth * 1.3333),
            0 ,0).then(()=> {
            this.uploadImage();
        });
    },
    async uploadImage() {
        let result = await sharing.sendData($('#c').get(0).toDataURL("image/jpeg"));
        console.log(result);
        /**
         * Url vars
         * @type {string}
         */
        let title = 'Oh Snap';
        let description = 'Oh Snap';
        let pic = result;
        let shareurl = encodeURI('http://customiseyourgarden.herokuapp.com/?title='+ title +'&pic='+ pic +'&description='+description);
        sharing.getShortURL(shareurl).then((res)=> {
            let shortenedShareURL = res.data.url;
            console.log(shortenedShareURL);
            window.open(shortenedShareURL)
        });
    },
    iosVideo() {
        /*/!**
         * This is the iOS video hack
         *!/
        let source = document.createElement('source');
        $(source).attr('type', 'video/mp4');
        $(source).attr('src', main);
        $('#a').append(source);

        let source2 = document.createElement('source');
        $(source2).attr('type', 'video/mp4');
        $(source2).attr('src', mask);
        $('#b').append(source);

        var videos = {
                a: Popcorn("#a"),
                b: Popcorn("#b"),
            },
            scrub = $("#scrub"),
            loadCount = 0,
            events = "play pause timeupdate seeking ended".split(/\s+/g);

        setTimeout(()=> {
            videos.a.play();
        }, 2000);

        // iterate both media sources
        Popcorn.forEach(videos, function(media, type) {

            // when each is ready...
            media.on("canplayall", function() {

                // trigger a custom "sync" event
                this.emit("sync");

                // set the max value of the "scrubber"
                scrub.attr("max", this.duration());

                // Listen for the custom sync event...
            }).on("sync", function() {

                // Once both items are loaded, sync events
                if (++loadCount == 2) {

                    // Iterate all events and trigger them on the video B
                    // whenever they occur on the video A
                    events.forEach(function(event) {

                        videos.a.on(event, function() {
                            // Avoid overkill events, trigger timeupdate manually
                            if (event === "timeupdate") {

                                if (!this.media.paused) {
                                    return;
                                }
                                videos.b.emit("timeupdate");

                                // update scrubber
                                scrub.val(this.currentTime());

                                return;
                            }

                            if (event === "seeking") {
                                videos.b.currentTime(this.currentTime());
                            }

                            if (event === "play" || event === "pause") {
                                videos.b[event]();
                            }
                            if (event === "ended") {
                                console.log('end');
                                videos.a.play();
                                videos.b.play();
                            }
                        });
                    });
                }
            });
        });

        function sync() {
            if (videos.b.media.readyState === 4) {
                videos.b.currentTime(
                    videos.a.currentTime()
                );
            }
            requestAnimationFrame(sync);
        }

        var canvas = document.getElementById('myCanvas'),
            ctx = canvas.getContext('2d'),
            video = document.getElementById('b'),
            videocanvas = document.getElementById('videocanvas'),
            videoctx = videocanvas.getContext('2d'),
            video_main = document.getElementById('a');

        function drawMask() {

            videoctx.drawImage(video, 0, 0, 300, 224);

            var imgd = videoctx.getImageData(0, 0, 300, 224),
                pix = imgd.data,
                i,n;

            for (i = 0, n = pix.length; i < n; i += 4) {
                pix[i + 3] = pix[i];
            }

            videoctx.putImageData(imgd, 0, 0, 0, 0, 300, 224);
        }

        function draw() {

            ctx.globalCompositeOperation = 'source-over';

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#BAE858";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            try {
                ctx.drawImage(video_main, 0, 0, 300, 224);
            } catch (e) {
                console.log(e)
            }
            ctx.globalCompositeOperation = 'destination-in';

            drawMask();
            ctx.drawImage(videocanvas, 0, 0, 300, 224);
            requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw);
        sync();*/

        let source = document.createElement('source');
        $(source).attr('type', 'video/mp4');
        $(source).attr('src', main);
        $('#a').append(source);

        source = document.createElement('source');
        $(source).attr('type', 'video/mp4');
        $(source).attr('src', mask);
        $('#b').append(source);

        var videos = {
                a: Popcorn("#a"),
                b: Popcorn("#b"),
            },
            scrub = $("#scrub"),
            loadCount = 0,
            events = "play pause timeupdate seeking ended".split(/\s+/g);

        videos.a.play();
        // iterate both media sources
        Popcorn.forEach(videos, function(media, type) {

            // when each is ready...
            media.on("canplayall", function() {

                // trigger a custom "sync" event
                this.emit("sync");

                // set the max value of the "scrubber"
                scrub.attr("max", this.duration());

                // Listen for the custom sync event...
            }).on("sync", function() {

                // Once both items are loaded, sync events
                if (++loadCount == 2) {

                    // Iterate all events and trigger them on the video B
                    // whenever they occur on the video A
                    events.forEach(function(event) {

                        videos.a.on(event, function() {
                            // Avoid overkill events, trigger timeupdate manually
                            if (event === "timeupdate") {

                                if (!this.media.paused) {
                                    return;
                                }
                                videos.b.emit("timeupdate");

                                // update scrubber
                                scrub.val(this.currentTime());

                                return;
                            }

                            if (event === "seeking") {
                                videos.b.currentTime(this.currentTime());
                            }

                            if (event === "play" || event === "pause") {
                                videos.b[event]();
                            }
                            if (event === "ended") {
                                console.log('end');
                                videos.a.play();
                                videos.b.play();
                            }
                        });
                    });
                }
            });
        });

        function sync() {
            if (videos.b.media.readyState === 4) {
                videos.b.currentTime(
                    videos.a.currentTime()
                );
            }
            requestAnimationFrame(sync);
        }
        sync();

        var canvas = document.getElementById('myCanvas'),
            ctx = canvas.getContext('2d'),
            video = document.getElementById('b'),
            videocanvas = document.getElementById('videocanvas'),
            videoctx = videocanvas.getContext('2d'),
            video_main = document.getElementById('a');

        ctx.fillStyle = "blue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        function drawMask() {

            videoctx.drawImage(video, 0, 0, 300, 224);

            var imgd = videoctx.getImageData(0, 0, 300, 224),
                pix = imgd.data,
                i, n;

            for (i = 0, n = pix.length; i < n; i += 4) {
                pix[i + 3] = pix[i];
            }

            videoctx.putImageData(imgd, 0, 0, 0, 0, 300, 224);
        }

        function draw() {
            ctx.fillStyle = "blue";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            console.log('drawing');

            ctx.globalCompositeOperation = 'source-over';

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#BAE858";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            try {
                ctx.drawImage(video_main, 0, 0, 300, 224);
            } catch (e) {
                console.log(e)
            }
            ctx.globalCompositeOperation = 'destination-in';

            drawMask();
            ctx.drawImage(videocanvas, 0, 0, 300, 224);

            requestAnimationFrame(draw);

        }

        function update() {

            const playPromise = video_main.play();
            if (playPromise !== null){
                playPromise.catch(() => {
                    video_main.pause();
                    video.currentTime = video_main.currentTime;
                    video_main.play(); })
            }
            const playPromise2 = video.play();
            if (playPromise !== null){
                playPromise.catch(() => {
                    video.pause();
                    video.currentTime = video_main.currentTime;
                    video.play(); })
            }
            requestAnimationFrame(update);
        }
        requestAnimationFrame(draw);
        //requestAnimationFrame(update);
    }
};


export default creative;


/**
 * Adds an image to a canvas
 * @param imageSrc: path to image
 * @param canvas: canvas
 * @returns {Promise}
 */
function addImageToCanvas(imageSrc, canvas, width, height, top, left) {
    return new Promise(
        function (resolve, reject) {
            var img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageSrc;
            img.onload = function(){
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img,
                    (typeof left !== 'undefined' ? left : 0),
                    (typeof top !== 'undefined' ? top : 0),
                    (typeof width !== 'undefined' ? width : canvas.width),
                    (typeof height !== 'undefined' ? height : canvas.height));
                resolve();
            };
        });
}

/**
 * Adds one canvas to another
 * @param canvas1: canvas
 * @param canvas2: canvas
 * @param gco: globalCompositeOperation
 * @returns {Promise}
 */
function addCanvasToCanvas(canvas1, canvas2, width, height) {
    return new Promise(
        function (resolve, reject) {
            var canvas2Ctx = canvas2.getContext('2d');
            let domRect = document.querySelector('.selfie').getBoundingClientRect();
            console.log('', width, height);
            console.log('', domRect);

            canvas2Ctx.drawImage(canvas1, 0, 0, width, height);
            resolve();
        });
}
function addCanvasToCanvas2(canvas1, canvas2, width, height, left, top) {
    return new Promise(
        function (resolve, reject) {
            var canvas2Ctx = canvas2.getContext('2d');
            let domRect = document.querySelector('.selfie').getBoundingClientRect();
            console.log('', canvas1.width, canvas1.height);
            console.log('', canvas2.width, canvas2.height);
            console.log('', domRect);

            canvas2Ctx.drawImage(canvas1, 0, 0, width, height);
            resolve();
        });
}

/**
 * Clear a pre-existing canvas
 * @param canvas
 */
function clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
}

/**
 * One Creative tracking bridge
 * @param name
 */
function trackMe(name) {
    console.log('tracking: ', name);
    try {
        var event = new CustomEvent("tracking", {
            detail: {
                label: name
            }
        });
        window.dispatchEvent(event);
    } catch(e) {
        console.log('Failed to track', name, e);
    }
}
function checkIOS() {
    var iOS = parseFloat(
        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
            .replace('undefined', '3_2').replace('_', '.').replace('_', '')
    ) || false;
    return iOS;
}
function getRandom(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}