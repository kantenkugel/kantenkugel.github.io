// ==UserScript==
// @name Youtube Spacebar Integration
// @author Kantenkugel
// @description Enables simple spacebar integration because I was sick of the page scrolling down when i just wanted to play/pause the video. Spacebar now always plays/pauses video (or restarts if finished) unless a textarea is active (eg commentbox or reply).
// @version 1.6
// @namespace kantenkugel
// @include *://www.youtube.com/*
// @updateURL https://www.kantenkugel.com/m/dl/yt_spacebar.user.js
// @downloadURL https://www.kantenkugel.com/m/dl/yt_spacebar.user.js
// @grant none
// ==/UserScript==

/*
 * CONFIG
 */

var debug = false;

/*
 * NO CHANGES BEYOND THIS POINT
 */
function log(msg) {
    if(debug)
        console.log(msg);
}

document.addEventListener('keypress', function(e) {
    log('Key pressed');
    if(e.type === 'keypress' && e.charCode == 32) {
        log('Key is space');
        var video = document.querySelector("video");
        if(video && video.readyState > 1) {
            log('Have available and ready video');
            var focused = document.activeElement;
            if(!(focused.tagName == 'INPUT' && focused.type == 'text')
                && !(focused.tagName == 'DIV' && focused.getAttribute('role') === 'textbox')
                && focused.tagName != 'TEXTAREA') {
                log('Not in input-field... hijacking');
                if(video.ended || video.paused)
                    video.play();
                else
                    video.pause();
                e.preventDefault();
            }
        }
    }
}, true);