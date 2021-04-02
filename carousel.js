/*
 * Carousel.js
 * Copy right Hito (vip@hitoy.org) All rights reserved
 */
(function(){
    var carousels = window.document.querySelectorAll('[carousel]')
    console.log( carousels);
    carousels.forEach(function(carousel){
        var autoplay = carousel.hasAttribute('autoplay');
        var loop = carousel.hasAttribute('loop');
        var delay = carousel.hasAttribute('delay') ? parseInt(carousel.getAttribute('delay')) : 3000;
        var direction = carousel.hasAttribute('direction') ? ['x','y'].indexOf(carousel.getAttribute('direction')) == -1 ? 'x' : carousel.getAttribute('direction') : 'x';
        console.log(autoplay, loop, delay, direction);
        
        var carouselitems = carousel.querySelector('[carousel-items]');
        console.log();
        //var carousel = item.querySelector('[carousel]');




    });






})(window);
