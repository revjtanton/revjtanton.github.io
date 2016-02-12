---
layout: post
title:  "Alexa, launch Iris Bridge..."
permalink: /node/alexa-launch-iris-bridge/
date:   2015-10-17 14:19:00
categories: node
tags: [alexa, iris]
---
I have an Iris system from Lowes.  Overall I love the system.  I've had it for years, and have built it up over time.  It has its limitations though.  Mainly that they haven't really opened it up for developers to do neat integrations with it.  There's no official API support, or IFTTT integration.  If you stick with what they've provided then you're kinda limited in what you can do.  So, for example, if you want to be able to turn off all the lights in your house with your Pebble watch there's no straight path.

Recently I purchased an Amazon Echo.  I love it.  Keeping it in my kitchen has made keeping track of shopping items, timers in cooking, and to-do items much more efficient.  The one thing it was missing was Iris integration.  Alexa integrates with many other home automation systems, but not Iris.  Amazon, however, has a whole Skills Development Kit for developers to dig in and make Alexa do whatever they want.  So, thanks to a discovered API for Iris, and Amazon's Alexa Skill Kit, we can bridge the gap and bring Iris integration to Alexa.

## Setting up your Alexa environment

First and foremost you'll want to head on over to [The Amazon Developer Console](https://developer.amazon.com/ "Developer Console") and sign up for an account.  You can use your existing Amazon account assuming you have one.  Here you'll be making your skills and learning how to use the Skills Kit for *Alexa*.  While you're at it go over to [The Amazon AWS Management Console](http://aws.amazon.com/ "AWS") and take care of business there as well.  Amazon recommends, and I agree, that you use their Lambda service to host your skills.  That's an AWS product.

I don't want to spend too much time expalining how to do a *HelloWorld* app for Alexa. There is a great tutorials section dedicated to Alexa via the Amazon Developer Console, and examples for Javascript or Java skills [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/getting-started-guide "Getting Started").  Instead I'll detail what I'm doing.  A lot of it is the same as the *HelloWorld* skill.

## Iris, AlertMe v5, and Living with Iris
Lowes does not officially support any API and no documentation is available from them.  Luckily their API was found and posted to the Living with Iris forum [here](http://forum.livingwithiris.com/index.php?/topic/229-alertme-api/ "AlertMe API").  The API documentation is available as a download on that forum post (you'll need to sign up for an account with the forum to download files).  **Side note** that forum is an invaluable resource for Iris hacks and tricks.  Through that site you can figure out how to do anything with your Iris system.

## Let's get down to it.
OK so we've already covered where to go to learn about Alexa and AlertMe so I'll get right into the Javascript.  There will be three files you put up on Lambda: *index.js*, *AlexaSkill.js*, *IrisSkill.js*.  The *index.js* file I've put together here is largely the same as the *HelloWorld* but here are a few differences.

{% highlight javascript %}
var IrisSkill = require('./IrisSkill');
{% endhighlight %}

All this does is pull in our code set in *IrisSkill.js*.  The other major departure is the Intents.

{% highlight javascript %}
SetHomeIntent: function (intent, session, response) {
	IrisSkill.prototype.HomeMode(response);
},
{% endhighlight %}

I'm passing *response* along for Alexa to say something when our request is done.  Other than those two differences *index.js* is largely the same as the Amazon provided examples.  Feel free to download and review their examples, they're great.  

Anyway moving on to *IrisSkill.js*.  This was my first time working with Node.js so my code is probably not great, but it works.  Instead of disecting it piece by piece I'll just put it all out there.  Here you go!

{% highlight javascript %}/**
/**
 * Here we're setting some values for use later.  These are your Iris credentials and some stuff we're pulling in from Node
 */
var USERNAME = '';
var PASSWORD = '';

var https = require('https');
var querystring = require('querystring');

/**
 * Declaring our IrisConnect
 */
function IrisConnect() {
	
};

//This is the login portion.  This will return the ApiSession value for use with other requests.  
IrisConnect.prototype.Login = function(callback) {
	var post_data = querystring.stringify({
		username: USERNAME,
		password: PASSWORD,
	});

	var options = {
	  host: 'www.irissmarthome.com',
	  port: 443,
	  path: '/v5/login',
	  method: 'POST',
	  headers: {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  'Content-Length': Buffer.byteLength(post_data)
	  }
	};

	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		console.log(res.statusCode);
		res.on('data', function(d) {
			de = JSON.parse(d);
			callback(de.ApiSession);
		});
	});
	req.write(post_data);
	req.end();

	req.on('error', function(e) {
	  console.error(e);
	});
};

// This will set the HOME mode.  Change HOME to AWAY or NIGHT to set those.  
IrisConnect.prototype.SetHome = function(callback) {
	var a = IrisConnect.prototype.Login(function(result) {
		ApiSession = result;
		
		var post_data = querystring.stringify({
			profile: 'HOME'
		});
			
		var options = {
		  host: 'www.irissmarthome.com',
		  port: 443,
		  path: '/v5/users/' + USERNAME + '/hubs/only/profile',
		  method: 'PUT',
		  headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Content-Length': Buffer.byteLength(post_data),
			  'cookie': 'ApiSession=' + ApiSession
		  }
		};

		var req = https.request(options, function(res) {
			res.setEncoding('utf8');
			console.log(res.statusCode);
			res.on('data', function(d) {
				de = JSON.parse(d);
				callback(de);
			});
		});
		req.write(post_data);
		req.end();

		req.on('error', function(e) {
		  console.error(e);
		});
	});
};

// Exporting IrisConnect for use by index.js
module.exports = IrisConnect;
{% endhighlight %}

The important things here that aren't completely obvious (like setting your USERNAME and PASSWORD) are where to set your actions.  The *post_data*, path, method, and headers are all very important.  Depending on what you're trying to do, each one will change.  The login request, for example, is setup this way:

{% highlight javascript %}
var post_data = querystring.stringify({
	username: USERNAME,
	password: PASSWORD,
});

var options = {
  host: 'www.irissmarthome.com',
  port: 443,
  path: '/v5/login',
  method: 'POST',
  headers: {
	  'Content-Type': 'application/x-www-form-urlencoded',
	  'Content-Length': Buffer.byteLength(post_data)
  }
};
{% endhighlight %}

But to set your Home mode that looks like this:
{% highlight javascript %}
var post_data = querystring.stringify({
	profile: 'HOME'
});
				
var options = {
  host: 'www.irissmarthome.com',
  port: 443,
  path: '/v5/users/' + USERNAME + '/hubs/only/profile',
  method: 'PUT',
  headers: {
	  'Content-Type': 'application/x-www-form-urlencoded',
	  'Content-Length': Buffer.byteLength(post_data),
	  'cookie': 'ApiSession=' + de.ApiSession
  }
};
{% endhighlight %}

The *post_data* seems like an obvious thing to change, the POST seems like it would've been appropriate for each request, right?  Well, I guess, but PUT makes sense for changing the Home mode.  The AlertMe documentation linked on Living with Iris outlines what each type of action requires.  Each type of request will go to a different path.  Of note is also how the session cookie is pushed along.  That was kinda weird and it took me a while to realise "cookie" was the key, not "ApiSession".  I'm still annoyed by that.  

After all of your coding you'll need to setup your Intent Schema and Utterances.  The Utterances are important.  Try to think of as many ways you'll say the command you'll want and put them all down.  Make it as easy as possible for Alexa to understand you!

Anyway after it's all done you've got yourself a pretty cool setup for turning on/off lights, setting your home mode, or really anything.  Speaking to your house to get it to do things is cool.  I've put everything I've done here up on [Github](https://github.com/revjtanton/alexaIris "Github").  Take what I've done and expand on it, improve it, and make it better!