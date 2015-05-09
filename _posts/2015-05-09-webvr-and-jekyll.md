---
layout: post
title:  "WebVR and Jekyll"
date:   2015-05-09 15:07:00
categories: jekyll
---
VR and wearables are the future of tech in my opinion.  Everything in the next few years will be about getting us more immersed into the tech, and the tech immersed into us.  With this in mind I wanted to get WebVR working with my Jekyll site.  How do we do this?

First and foremost head on over and grab the [WebVr Starter Kit on Github](https://github.com/povdocs/webvr-starter-kit "WebVR").  What I ended up doing for this particlar test (and to make it simple) was to look at the [Panorama Example](http://povdocs.github.io/webvr-starter-kit/examples/panorama.html "Panorama Example") and grab the page source.  

Looking at that source it looked like we really only needed to do a couple of things to make this work with Jekyll.  I'm going to assume you have a Jeckyll installation up and going (if you don't then go to [jekyllrb.com](http://jekyllrb.com/ "Jekyll") and grab it).  First thing you do is edit your _config.yaml to add a collection.  Here is a simple example (add to the bottom of the file):

{%highlight yaml %}
# Collections
collections:
    vr:
        output: true
{% endhighlight %}

Now we have a collection for jekyll to look for.  Now add a few directories to your root:

*	_vr
*	libraries

Inside of your */libraries* directory download and place the file **vr.dev.js** from the WebVR Starter Kit.  Inside of your */_vr* directory you'll be putting your *.md files later.

The next thing I did was make a new file inside of */_layouts* called **vr.html** which is really just a copy of the source from the Panorama Example with some md changes.  Here's what that looks like (**disclosure**: I don't know how to ignore the markdown I'm putting in this so I've putt in /'s to prevent the markdown from being applied in the example):

{% highlight html %}
<!-- saved from url=(0065)http://povdocs.github.io/webvr-starter-kit/examples/panorama.html -->
<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta charset="utf-8">
        <title>/{/{ page.title /}/}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <style type="text/css">.pns_lightbox_container_border {
  border-radius: initial;
  padding: 6px;
}

.pns_lightbox_close {
  top: 10px !important;
  right: 5px !important;
  font-size: 20px !important;
}

.pns_lightbox_close .close-x {
  -webkit-filter: invert(60%);
  filter: invert(60%);
  height: 25px;

}

.pns_lightbox_close .close-x:hover {
  top: -1px; 
}

.pns_lightbox_container {
  background-color: #f7f9f9 !important;
}

.pns_lightbox_container_border {
  border: none;
  background-color: rgba(0,0,0,0);
}</style><style type="text/css">body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #eee;
    overflow: hidden;
    background: rgb(40, 40, 40);

    height: 100%;
    width: 100%;
    margin: 0px;
    padding: 0px;
}

canvas {
    width: 100% !important;
    height: 100% !important;
    /*position: absolute;*/
    top: 0;
    left: 0;
}

#buttons {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 12px;
    margin: 8px;
    border-radius: 8px;
    background-color: rgba(128, 128, 128, 0.6);
}

#buttons > * {
    margin: 0 10px;
    display: inline-block;
    width: 18px;
    height: 18px;
    cursor: pointer;
}

#buttons > *:first-child {
    margin-left: 0;
}

#buttons > .unsupported {
    display: none;
}

#fs-disable {
    display: none;
}</style><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"><style id="style-1-cropbar-clipper">
.en-markup-crop-options {
    top: 18px !important;
    left: 50% !important;
    margin-left: -100px !important;
    width: 200px !important;
    border: 2px rgba(255,255,255,.38) solid !important;
    border-radius: 4px !important;
}

.en-markup-crop-options div div:first-of-type {
    margin-left: 0px !important;
}
</style></head>
    <body><canvas width="1440" height="734" style="width: 1440px; height: 734px;"></canvas>
        <script type="text/javascript" src="/libraries/vr.dev.js" charset="utf-8"></script><div id="buttons"><span id="fs-enable" title="Enable Full Screen"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 8 8">
  <path d="M0 0v4l1.5-1.5 1.5 1.5 1-1-1.5-1.5 1.5-1.5h-4zm5 4l-1 1 1.5 1.5-1.5 1.5h4v-4l-1.5 1.5-1.5-1.5z"></path>
</svg></span><span id="fs-disable" title="Exit Full Screen"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 8 8">
  <path d="M1 0l-1 1 1.5 1.5-1.5 1.5h4v-4l-1.5 1.5-1.5-1.5zm3 4v4l1.5-1.5 1.5 1.5 1-1-1.5-1.5 1.5-1.5h-4z"></path>
</svg></span><span id="vr" title="Toggle Virtual Reality" class="unsupported"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 8 8">
  <path d="M4.03 0c-2.53 0-4.03 3-4.03 3s1.5 3 4.03 3c2.47 0 3.97-3 3.97-3s-1.5-3-3.97-3zm-.03 1c1.11 0 2 .9 2 2 0 1.11-.89 2-2 2-1.1 0-2-.89-2-2 0-1.1.9-2 2-2zm0 1c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.04-.19-.06-.28-.08.16-.24.28-.44.28-.28 0-.5-.22-.5-.5 0-.2.12-.36.28-.44-.09-.03-.18-.06-.28-.06z" transform="translate(0 1)"></path>
</svg></span><span id="orientation" title="Toggle Orientation" class="unsupported"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 8 8">
  <path d="M4 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 1c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm2 1l-3 1-1 3 3-1 1-3zm-2 1.5c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5z"></path>
</svg></span></div>
        <script type="text/javascript">
        VR.panorama('/{/{ page.image /}/}');
        </script>
    
</body></html>
{% endhighlight %}

As you can see there are only two spots I'm messing with this.  The title, and the VR.panorama.  Next I made my first md file which I called opening-day.md.  The only thing that goes here is the layout, title, and image.  The layout chooses the layout to use, the title is placed in the markup above, and the image as shown above.  That opening-day.md file looks like this:

{% highlight html %}
---
layout: vr
title:  VR Camden Yards
image:	http://i.imgur.com/7wt7yWm.jpg
---
{% endhighlight %}

And there you have it.  I have a type of content on my site that will be VR.  If you've got [Google Cardboard](https://www.google.com/get/cardboard/ "Google Cardboard") you can checkout [this picture I took at Camden Yards](/vr/opening-day.html "VR Camden Yards") on opening day in full VR glory.  If you don't have Cardboard then you can still see a decent effect via a mobile or desktop modern browser.  The picture isn't perfect.  I took it with my (awesome) OnePlus One, and I didn't use anything to really stabilize myself.  You'll notice some stitching weirdness in that picture.  In the end I got a cool VR thing going on with my simple jekyll site in about 5 minutes.