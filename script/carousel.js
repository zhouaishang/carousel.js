/*
 * Carousel.js 0.0.4
 * Copyright Hito (vip@hitoy.org) All rights reserved
 *
 *
 * JS异步执行轮播组件库，由杨海涛编写，所有权力保留
 * 使用方法：
 * 异步引用组件库，编写HTML和CSS，使HTML能在不适用JS条件下正常展示
 * 给轮播容器指定carousel-container属性
 * 给轮播滚动父元素指定carousel-scroll属性
 *
 *
 * 可选展示功能:
 * 为轮播容器添加一个子元素，并给予carousel-indicator属性
 * 即激活了轮播指示器功能，添加carousel-indicator-focusclass属性并赋值，即可指定焦点指示器类名
 * 为录播容器添加2个元素，并给与carousel-next-button或carousel-previous-button
 * 即激活了前后翻页功能
 * 注意: 为保持灵活性，基础样式请自行指定
 *
 * 其他可选展示样式
 * 为轮播容器添加不同属性，即可使用自定义功能
 * carousel-loop 无缝循环滚动
 * carousel-autoplay 自动滚动
 * carousel-delay 自动滚动间隔，单位毫秒，默认6000毫秒
 * carousel-duration 每次滚动时间，单位毫秒，默认600毫秒
 * carousel-step 每次滚动的个数，默认为窗口可见的完整对象个数
 * carousel-direction 滚动方向，x轴或y轴，默认x
 *
 * 为轮播carousel-scroll增加不同属性，可定义
 * carousel-scroll-activeclass 可见的幻灯片class
 */
(function(w){
    'use strict';
    var version = '0.0.4';
    var readyState = w.document.readyState;
    var carousels;
    //第一次加载时执行初始化函数
    if(readyState === "interactive"||  readyState === "complete"){
        init();
    }else{
        w.document.addEventListener("DOMContentLoaded", init);
    }

    //解析DOM，开始工作
    function init(){
        carousels = w.document.querySelectorAll('[carousel-container]');
        carousels.forEach(function(carousel){
            //是否循环滚动
            var loop = carousel.hasAttribute('carousel-loop');
            //是否自动滚动
            var autoplay = carousel.hasAttribute('carousel-autoplay');
            //每次滑动延迟时间
            var delay = carousel.hasAttribute('carousel-delay') ? parseInt(carousel.getAttribute('carousel-delay')) : 6000;
            //每次动画持续时间
            var duration = carousel.hasAttribute('carousel-duration') ? parseInt(carousel.getAttribute('carousel-duration')): 600;
            //每次滑动的子元素个数，默认为视野内的所有子元素
            var step = carousel.hasAttribute('carousel-step') ? parseInt(carousel.getAttribute('carousel-step')) : 'auto';
            //滑动的方向x轴或者y轴
            var direction = carousel.hasAttribute('carousel-direction') ? ['x','y'].indexOf(carousel.getAttribute('carousel-direction')) == -1 ? 'x' : carousel.getAttribute('carousel-direction') : 'x';
            //是否通过鼠标控制滚动
            var mousewheel = carousel.hasAttribute('carousel-mousewheel');

            //滚动元素的父元素
            var carouselscroll = carousel.querySelector('[carousel-scroll]');
            if(!carouselscroll) return;
            //可见幻灯片的属性
            var carouselscrollactiveclass =  carouselscroll.getAttribute('carousel-scroll-activeclass') || 'visible';

            //初始化classname
            carousel.classList.add('carousel-container');
            carouselscroll.classList.add('carousel-scroll');
            if(direction === 'x')
                carouselscroll.classList.add('carousel-scroll-x');
            else
                carouselscroll.classList.add('carousel-scroll-y');
            
            //指示图标
            var indicator = carousel.querySelector('[carousel-indicator]') 
            var activeclass = indicator ? indicator.getAttribute('carousel-indicator-focusclass') || 'carousels-indicator-active' : 'carousels-indicator-active';
            //上下按钮
            var nextbutton = carousel.querySelector('[carousel-next-button]');
            var previousbutton = carousel.querySelector('[carousel-previous-button]');
        
            if(nextbutton){
                nextbutton.classList.add('carousel-nextbutton');
                nextbutton.setAttribute('role', 'button');
                nextbutton.setAttribute('tabindex', '0');
            }
            if(previousbutton){
                previousbutton.classList.add('carousel-previousbutton');
                previousbutton.setAttribute('role', 'button');
                previousbutton.setAttribute('tabindex', '0');
            }
            
            //初始化轮播对象
            var carousel =  new Carousel(carouselscroll, carouselscrollactiveclass, duration, step, loop, direction, indicator, activeclass, nextbutton, previousbutton, mousewheel);
            if(autoplay){
                carousel.autoplay(delay);
            }
        });
    }


    //轮播构造对象
    function Carousel(carouselscroll, carouselscrollactiveclass, duration, step, loop,  direction, indicator, activeclass, nextbutton, previousbutton, mousewheel){

        //替代对象
        var _this = this;

        //是否动画中
        var in_transition = false;

        //是否可以动画
        var eligible = true;

        //自动播放ID
        var autoplayid;

        //幻灯片容器HTML
        var html = carouselscroll.outerHTML;

        //幻灯片容器包裹元素
        var carouselwrap;

        //轮播对象的原始位置
        var carouselleft;
        var carouselright;
        var carouseltop;
        var carouselbottom;

        //轮播对象默认的宽度和高度
        var carouselwidth;
        var carouselheight;

        //初始时滚动条的位置
        var scrollY;
        var scrollX;

        //轮播scroll的宽度和高度
        var scrollwidth;
        var scrollheight;

        //总幻灯片个数，不包含过渡幻灯片
        var slidercount;
        //能够完整显示的幻灯片的数量
        var slidercountinview;
        
        //每次滑动的个数
        var step = step;

        //当前正在显示的幻灯片在滚动的子元素里的索引
        var currentindex = 0;

        /*
         * 根据方向和索引获取相对于carouselscroll的偏移量
         * @param index int carouselscroll中子元素索引
         * @param direction string 方向，可选，默认为x
         */
        function get_offset(){
            if(arguments.length == 1){
                var index = arguments[0];
                direction = direction;
            }else if(arguments.length == 2){
                var index = arguments[0];
                direction = arguments[1];
            }else{
                return false;
            }
            var carousel = carouselscroll.children;
            if(index > carousel.length || index < 0) return false;

            var slider = carousel[index];
            var rect = slider.getBoundingClientRect();
            if(direction == 'x')
                return rect.left - carouselleft - (scrollX - w.scrollX);
            else
                return rect.top - carouseltop - (scrollY - w.scrollY);
        }

        /*
         * 获取视野内可显示的完整幻灯片数量
         * @return int
         */
        function get_slider_count_in_view(){
            var containernum =  ( direction === 'x' ) ? carouselwidth : carouselheight;
            var count = carouselscroll.children.length;

            for(var i in carouselscroll.children){
                var slider = carouselscroll.children[i];
                var rect = slider.getBoundingClientRect();
                var num = ( direction == 'x' ) ? rect.right - carouselleft - (scrollX - w.scrollX) :  rect.bottom - carouseltop - (scrollY - w.scrollY);
                if(num > containernum){
                    return parseInt(i);
                }
            }
            return count;
        }

        /*
         * 判断scroll容器是否被填满
         * 通过最后一个元素
         */
        function is_filled(){
            var sliders = carouselscroll.children;
            var slidercount = sliders.length;
            var lastitem = sliders[slidercount - 1];
            var rect = lastitem.getBoundingClientRect();
            if(direction == 'x')
                return rect.right - carouselleft >= carouselwidth;
            else
                return rect.bottom - carouseltop >= carouselheight;
        }

        /*
         * 根据索引和时间移动carouselscroll
         *  @param index int carouselscroll中子元素索引
         *  @param duration int 移动时间 毫秒
         *  @param direction string 方向，可选，默认为x
         * 把carouselscroll移动到指定的位置
         */
        function move(){
            if(arguments.length == 2){
                var index = arguments[0];
                var duration = arguments[1];
                direction = direction;
            }else if(arguments.length == 3){
                var index = arguments[0];
                var duration = arguments[1];
                direction = arguments[2];
            }else{
                return false;
            }
            var offset = get_offset(index);
            var transdis = parseFloat(carouselscroll.getAttribute('data-translate')) - offset;
            carouselscroll.style.transitionDuration = parseFloat(duration/1000) + 's';
            if(direction == 'x')
                carouselscroll.style.transform = 'translateX('+transdis+'px)';
            else
                carouselscroll.style.transform = 'translateY('+transdis+'px)';
            carouselscroll.setAttribute('data-translate', transdis);
            currentindex = index;
        }

        
        /*
         * 初始化数据
         * 此函数在onload之后或resize时执行
         * 用于初始化并生成相关数据，是系统的入口函数
         */
        function __init(){

            //初始化滚动条位置
            scrollY = w.scrollY;
            scrollX = w.scrollX;

            //给滚动元素嵌套一层父元素
            if(!carouselwrap){
                carouselwrap = document.createElement('div');
                carouselwrap.className = 'carousel-wrap';
                carouselscroll.parentNode.insertBefore(carouselwrap, carouselscroll);
                carouselwrap.appendChild(carouselscroll);
            }

            //获取轮播对象相关数据
            var rect = carouselscroll.getBoundingClientRect();
            carouselleft = rect.left;
            carouselright = rect.right;
            carouseltop = rect.top;
            carouselbottom = rect.bottom;
            carouselwidth = rect.width;
            carouselheight = rect.height;

            //给遮罩层添加高度和宽度数据
            carouselscroll.parentNode.style.width = carouselwidth + 'px';
            carouselscroll.parentNode.style.height = carouselheight + 'px';

            //删除空白文本对象，以保证inline-block不会出现空白
            carouselscroll.childNodes.forEach(function(node,i){
                if(node.nodeType !== 1){
                    carouselscroll.removeChild(node);
                }
            });

            //scroll容器必须被填满，否则不应有滑动功能
            if(!is_filled()){
                eligible = false;
                return false;
            }

            //保存原始幻灯片个数
            slidercount = carouselscroll.children.length;

            //计算视野中显示的完整幻灯片个数
            slidercountinview = get_slider_count_in_view();

            //计算每次滑动的元素个数
            if(step === 'auto')
                step = slidercountinview;
            else
                step = Math.min(step, slidercountinview);
            
            /*
             * 下面开始根据相关数据操作DOM
             */

            //激活下一页按钮
            enable_page_button(nextbutton);

            //默认状态下容器偏移量为0
            carouselscroll.setAttribute('data-translate', 0);

            /*
             * 当需要进行LOOP时，则需要动态向前后插入幻灯片
             * 为了保证无缝滚动，需要往前后插入视野中能够显示幻灯片的数量
             * 系统只支持左对齐，所以需要往头部插入step个过渡幻灯片，往尾部插入slidercountinview+1个幻灯片
             */
            var positionoffset = 0;
            if(loop & currentindex === 0){
                 //获取原始幻灯片数据
                var origin_sliders = carouselscroll.cloneNode(true).children;

                //先往往尾部需要插入的元素，减小效果抖动
                for(var i = 0; i <= slidercountinview; i++){
                    var clone = origin_sliders[i].cloneNode(true);
                    carouselscroll.appendChild(clone);
                }

                //再往头部插入的元素，并设置位移属性
                for(var i = slidercount - 1; i >= slidercount - step; i--){
                    var slider = origin_sliders[i];
                    var clone = slider.cloneNode(true);
                    carouselscroll.insertBefore(clone, carouselscroll.children[0]);
                }
                //设置看到默认为第一个幻灯片
                var positionoffset = get_offset(step);
                if(direction === 'x'){
                    carouselscroll.style.left = - positionoffset + 'px';
                }else{
                    carouselscroll.style.top = - positionoffset + 'px';
                }
                currentindex = step;

                //上一页按钮可点击
                enable_page_button(previousbutton);
            }

            //给所有幻灯片设置宽度和高
            //并给视野中完整的幻灯片设置class
            var min = loop ?  step : 0;
            var max = loop ? slidercountinview+step : slidercountinview;
            carouselscroll.childNodes.forEach(function(node, i){
                if(node.nodeType === 1){
                    node.style.width = node.offsetWidth + 'px';
                    node.style.height = node.offsetHeight + 'px';
                }
                if( i >= min && i < max)
                    node.classList.add(carouselscrollactiveclass);
            });
            
            //通过最后一个元素计算scroll的高度和宽度并
            //给scroll添加高度和宽度属性
            var lastsliderrect = carouselscroll.lastElementChild.getBoundingClientRect();
            if(direction === 'x'){
                scrollwidth = lastsliderrect.right - carouselleft + positionoffset;
                scrollheight = carouselheight;
            }else{
                scrollwidth = carouselwidth;
                scrollheight = lastsliderrect.bottom - carouseltop + positionoffset;
            }
            carouselscroll.style.width = scrollwidth + 'px';
            carouselscroll.style.height = scrollheight + 'px';

            //添加需要的指示器
            if(indicator){
                var count = Math.ceil(slidercount/step);
                indicator.innerHTML='<span></span>'.repeat(count);
                carousel_indicator(currentindex);
            }

        };

        /*
         * 滑动的核心方法
         * @param index 幻灯片相对caarouselscroll的索引
         * 同时实现无缝循环和不循环两种效果
         */
        function slide(index){
            if(in_transition){
                return false;
            }
            in_transition = true;

            /*
             * 若loop， 则无缝过渡，在动画之前，需要根据当前位置，调整起始位置
             * 如果当前位置已显示了过渡幻灯片，并
             * **往前滚动：先跳转到尾部对应位置，然后往前滚动
             * **往后滚动：先跳转到头部位置，然后往前滚动
             */
            if(loop){
                /*
                 * 如果当前位置偏移量小于step，则代表至少有一个过渡幻灯片在展示，此时位于头部
                 * 并且要移动的位置索引小于当前位置索引，则代表是从大往小移动
                 * 先跳转到尾部
                 */
                if(currentindex < step && index < currentindex){
                    move(currentindex + slidercount, 0);
                    index = index + slidercount;
                }

                /* 如果当前查看的最后一个幻灯片索引大于非过渡最后一个幻灯片的索引，代表此时位于尾部，至少一个过渡幻灯片已被展示
                 * 并且要移动的位置索引大于当前位置索引，则代表从小往大移动
                 * 先跳转到头部
                 */
                else if(index > currentindex && currentindex + step - 1 > slidercount + step - 1){
                    move(currentindex - slidercount, 0);
                    index = index - slidercount;
                }
            }
            /*
             * 若非loop, 则动画最多只能到头部或者尾部
             */
            else{
                if(index < 0)
                    index = 0;
                else if(index >= slidercount - step)
                    index = slidercount - step;
            }

            //显示指示器
            if(indicator)
                carousel_indicator(index);

            //以动画方式移动元素
            move(index, duration);

            //同时: 在动画结束之后还原状态
            setTimeout(function(){
                if(!loop && currentindex >= slidercount - step){
                    disable_page_button(nextbutton);
                }
                //如果不loop，到头部，则不能网上翻页
                else if(!loop && currentindex == 0){
                    disable_page_button(previousbutton);
                }
                //正常不loop激活2个按钮
                else if(!loop){
                    enable_page_button(nextbutton);
                    enable_page_button(previousbutton);
                }
                //给正在展示的幻灯片增加一个class便于控制样式
                carouselscroll.childNodes.forEach(function(c, i){
                    if(i >= index && i < index + slidercountinview)
                        c.classList.add(carouselscrollactiveclass);
                    else
                        c.classList.remove(carouselscrollactiveclass);
                });
                in_transition = false; 
            }, duration);
        }

        /*
         * 显示指示器，对正在显示的高亮显示
         * @param index int 当前查看的幻灯片索引
         * @return null
         */
        function carousel_indicator(index){
            var indicators = indicator.querySelectorAll('span');
            var indicatorcount = indicators.length;

            var remainder = slidercount % step;
            //求没有loop情况下的index
            if(loop){
                if(index < step)
                    index = index + slidercount - step;
                else if(index > slidercount + step)
                    index = index - slidercount + step;
                else
                    index = index - step;
                index = Math.ceil(index/step) % indicatorcount;
            }else{
                index = Math.ceil(index/step);
            }

            indicator.querySelectorAll('span').forEach(function(c,i){
                if(i == index)
                    c.classList.add(activeclass);
                else
                    c.classList.remove(activeclass);
            });
        }

        /*
         * 根据参数激活前或后翻页按钮
         * @param button string next|previous按钮
         */
        function enable_page_button(button){
            if((button == 'next' || button == nextbutton) && nextbutton){
                nextbutton.setAttribute('aria-disabled', 'false');
            }
            else if((button == 'previous' || button == previousbutton) && previousbutton){
                previousbutton.setAttribute('aria-disabled', 'false');
            }
        }
        
        /*
         * 根据参数冻结前或后翻页按钮
         * @param button string next|previous按钮
         */
         function disable_page_button(button){
            if((button == 'next' || button == nextbutton) && nextbutton){
                nextbutton.setAttribute('aria-disabled', 'true');
            }
            else if((button == 'previous' || button == previousbutton) && previousbutton){
                previousbutton.setAttribute('aria-disabled', 'true');
            }
        }

        /*
         * 判断当前是否可以滑动
         * @return boolean
         */
        function disabled(){
            return in_transition && eligible;
        }

        /*
         * 以下为对外暴露的接口
         */
        
        //自动滑动
        this.autoplay = function(delay){
            autoplayid = setInterval(function(){
                slide(currentindex + step);
            }, delay);
        }
        //停止动画
        this.stop = function(){
            clearInterval(autoplayid);
        }


        /*
         * 以下为立即执行代码
         */

        //绑定下一页和上一页点击事件
        if(nextbutton){
            //下一页按钮默认冻结
            nextbutton.setAttribute('aria-disabled', 'true');
            nextbutton.addEventListener('click', function(e){
                _this.stop();
                if(disabled() || nextbutton.getAttribute('aria-disabled') == 'true') return false;
                slide(currentindex + step);
            });
        }
        if(previousbutton){
            //上一页按钮默认冻结
            previousbutton.setAttribute('aria-disabled', 'true');
            previousbutton.addEventListener('click', function(e){
                _this.stop();
                if(disabled() || previousbutton.getAttribute('aria-disabled') == 'true') return false;
                slide(currentindex - step);
            });
        }

        //手动点击指示器事件
        if(indicator){
            indicator.addEventListener('click', function(e){
                _this.stop();
                var target = e.target || window.event.srcElement;
                if(disabled() || target.nodeName != 'SPAN') return false;
                var index = (Array.from(indicator.children).indexOf(target));
                if(loop){
                    index = index * step + step;
                }else{
                    index = index * step;
                }
                slide(index);
            });
        }

        /*
         * 拖拽功能
         * 需要几组变量存放数据以获得拖拽距离
         * initpageX,initpageY存放touchstart时的位置
         * pageX,pageY存放touchmove时的位置
         */
        var initpageX = 0;
        var initpageY = 0;
        var pageX = 0;
        var pageY = 0;

        //绑定拖拽事件
        carouselscroll.addEventListener('touchstart', function(ev){
            _this.stop();
            initpageX = ev.targetTouches[0].pageX;
            initpageY = ev.targetTouches[0].pageY;
            pageX = initpageX;
            pageY = initpageY;
        });
        carouselscroll.addEventListener('touchmove', function(ev){
            var x = ev.targetTouches[0].pageX;
            var y = ev.targetTouches[0].pageY;
            var translate = parseFloat(carouselscroll.getAttribute('data-translate'));
            carouselscroll.style.transitionDuration = '0s';
            if(direction == 'x'){
                var movedis = x - pageX;
                var transdis = translate + movedis;
                carouselscroll.style.transform = 'translateX('+transdis+'px)';
                carouselscroll.setAttribute('data-translate', transdis);
            }else{
                var movedis = y - pageY;
                var transdis = translate + movedis;
                carouselscroll.style.transform = 'translateY('+transdis+'px)';
                carouselscroll.setAttribute('data-translate', transdis);
            }
            pageX = x;
            pageY = y;

        });
        carouselscroll.addEventListener('touchend', function(ev){
            var x = ev.changedTouches[0].pageX;
            var y = ev.changedTouches[0].pageY;
            var basedis = get_offset(step) - get_offset(0);

            if(direction == 'x'){
                var movedis = x - initpageX;
            }else{
                var movedis = y - initpageY;
            }
            if(movedis < -basedis/2)
                slide(currentindex + step);
            else if(movedis > basedis/2)
                slide(currentindex - step);
            else
                slide(currentindex);
        });


        /*
         * 鼠标滚动控制滑动
         */
        if(mousewheel){
            var sliderslength = carouselscroll.children.length;
            carouselscroll.addEventListener('wheel', function(ev){
                _this.stop();
                if(event.deltaY > 0){
                    if(!loop && currentindex == sliderslength - 1 && !disabled()) return false;
                    if(!disabled()){
                        slide(currentindex + step);
                    }
                }else if(event.deltaY < 0){
                    if(!loop && currentindex == 0 && !disabled()) return false;
                    if(!disabled()){
                        slide(currentindex - step);
                    }
                }
                ev.preventDefault();
                ev.stopPropagation();
            });
        }
        
        //初始化数据，延迟执行
        if(readyState === "complete"){
             __init();
        }else{
            w.addEventListener("load", __init);
        }
    }

    //创建Style
    var nestedstyle = w.document.createElement('style');
    nestedstyle.setAttribute('carousel-extension', version);
    nestedstyle.innerHTML='.carousel-container{position:relative}.carousel-wrap{position:relative;max-width:100%;max-height:100%;overflow:hidden}.carousel-scroll{position:absolute;display:block;width:100%;height:auto;transition-property:transform;transition-timing-function:ease-in-out}.carousel-scroll>*{box-sizing:border-box}.carousel-scroll-x{white-space:nowrap}.carousel-scroll-x>*{display:inline-block}.carousel-scroll-y>*{display:block}.carousel-previousbutton[aria-disabled=true],.carousel-nextbutton[aria-disabled=true]{display: none}';
    w.document.head.append(nestedstyle);
})(window);
