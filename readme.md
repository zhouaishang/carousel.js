# carousel.js: 高性能网页轮播库
> carousel.js是一个异步执行的网页轮播JS库,具有性能高，定制性强，SEO友好等优点，是制作高性能网站必备的JS库之一

## 使用方法
* 在网页头部引入carousel.js，推荐添加async异步执行
* 编辑基础的HTML和CSS代码，使carousel在不运行的情况下，可正常查看，基础的符合carousel.js规范轮播结构包含以下四个组件：
   * carousel-container: 轮播容器，包含所有的轮播组件
   * carousel-scroll: 轮播滚动器，包含所有的用于轮播的幻灯片
   * carousel-indicator: (可选)轮播指示器，用于显示当前播放的幻灯片索引
   * carousel-next-button和carousel-previous-button: (可选)翻页按钮，用于切换播放的幻灯片
* 编辑好HTML和CSS之后，对相应的标签添加属性以指定轮播库组件，一个demo如下:
```
<div class="container" carousel-container>
    <ul class="altas" carousel-scroll>
        <li><img src="example.jpg" alt="example"></li>
        <li><img src="example.jpg" alt="example"></li>
        <li><img src="example.jpg" alt="example"></li>
        <li><img src="example.jpg" alt="example"></li>
    </ul>
    <div class="indicator" carousel-indicator></div>
    <span carousel-next-button></span>
    <span carousel-previous-button></span>
</div>
```
* carousel.js还支持更多自定义选项，可分别在不同的域内指定：
   * carousel-container: 
      * carousel-loop 无缝循环滚动
      * carousel-autoplay 自动滚动
      * carousel-mousewheel 是否绑定鼠标滚轮切换幻灯片显示
      * carousel-delay 需要指定值，自动滚动间隔，单位毫秒，默认6000毫秒
      * carousel-duration 需要指定值，每次滚动时间，单位毫秒，默认600毫秒
      * carousel-step 需要指定值，每次滚动的个数，默认为窗口可见的完整对象个数
      * carousel-direction 需要指定值，滚动方向，x轴或y轴，默认x

   * carousel-scroll:
      * carousel-scroll-activeclass 可见的幻灯片类名，默认visible

   * carousel-indicator:
      * carousel-indicator-focusclass 焦点指示器类名，默认carousel-indicator-active

## 注意
* carousel.js支持不同宽度的幻灯片切换，carousel-scroll下的幻灯片应为inline-block, carousel-scroll应该添加overflow:hidden属性
* carousel.js会根据系统配置自动往carousel-indicator添加子元素，元素类型为span，请根据展示需要自行配置样式
* 系统对正在显示的幻灯片动态添加了类名，可使用CSS动画属性进行动画个性化定制
* carousel-mousewheel绑定了鼠标滚轮事件切换幻灯片，如果此时使用carousel-loop，可能会造成鼠标滚轮被锁定，无法滚动网页，避免同时使用它们
* 关于使用问题，或者上报bug请联系vip#hitoy.org(#=>@)
