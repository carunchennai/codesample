/* Landing page js and social site content manage page */
var landing = new function () {
	var me = this,
		$html,
		$links,
		$linksWithLargeCallouts,
		isOldIE,
		numImg = 60,
		$socialItemNodes,
		$logo,
		$largeCallouts,
		$largeCalloutsContainer,
		$callout2,
		instagramData,
		twitterData,
		tweets = [],
		photos = [],
		$progress,
		instagramContentLoaded = false,
		twitterContentLoaded = false,
		isIOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false ),
		isIE7,
		hoverExceptions = [12,18,21,27,44,54],
		cycleSpeed, cycleInterval, largeThumbCycleInterval,
		twitterToInstagramRatio,
		areLargeSquareInitialized = false,
		instagramCounter = 0,
			tweetCounter = 0,
			
		cons = {
			INSTAGRAM: 1,
			TWITTER: 2
		};
	    
	
	me.init = function () {
		
		$html = $('html');
		$links = $('#links');
		isOldIE = $('html').hasClass('lt-ie9');
		$largeCallouts = $('#largeCallouts .callout');
		$linksWithLargeCallouts =  $('#links, #largeCallouts .callout');
		$progress = $('progress');
		isIE7 = $html.hasClass('lt-ie8'),
		$largeCalloutsContainer = $('#largeCallouts');
		cycleSpeed = parseInt($links.attr('data-cycle-speed'));
		cycleInterval = parseInt($links.attr('data-cycle-interval'));
		largeThumbCycleInterval = parseInt($links.attr('data-large-thumb-cycle-interval'));
		twitterToInstagramRatio = parseFloat($links.attr('data-twitter-to-instagram-ratio'));
		//$socialItemNodes = $('.socialItem');
		
		if (true) {
			
			me.initInstagram();
			
		} else {
			$links.html(getLinkImagesHTML());
			
			
			
			$links.imagesLoaded(logoImagesLoadedEvent)
			$socialItemNodes = $('.socialItem')
			
		}
		
		$logo = $('#logo');
		
		if (isIOS) {
			$html.addClass('iOS');
		}
		
		/*
		 * got to detect touch device support.  This is so we don't have strange
		 * hover-like-but-not-really-hover event styles appearing for those 
		 * devices
		 */
		if (!("ontouchstart" in document.documentElement)) {
		    $html.addClass("no-touch");
		}
		
		if (isIE7) {
			
			$('#links').on('mouseenter', 'a', function(e) {
				var $this = $(this);
				$this.css({
					position: 'absolute',
					left: $this.attr('data-x'),
					top: $this.attr('data-y') 
				});
				
			}).on('mouseleave', 'a', function(e) {
				$(this).css({
					position: 'relative',
					left: '0px',
					top: '0px'
				});
			});
			
			$('.callout').bind('mouseenter', function() {
				$largeCalloutsContainer.css({
					'z-index': 100
				});
			}).bind('mouseleave', function () {
				$largeCalloutsContainer.css({
					'z-index': 2
				});
			})
			
		}
		
	}
	
	me.initInstagram = function () {
		var pages = 0;
		
		//retrieve the instagram feed url from the hidden form in the page
		var feed = $("#links").attr('data-instagram-feed-url');
		
		
		//valid feed not found stop here
		if(!feed) return;

		console.log('INIT INSTAGRAM')

		instagramData = new Instagram(feed ); 
		instagramData.cache = true;
		instagramData.get();

		//listen for instagram load success
		$(instagramData).bind(instagramData.events.feedLoadSuccess, function (e, data) {

			pages ++;
			console.log('success! ' +  pages);
			addToPhotoArray(cons.INSTAGRAM);
			if (pages <= 4) {
				console.log('another!'  + photos.length)
				instagramData.getNext();
			} 

			if (pages == 2) {
				console.log('done!');
				instagramContentLoaded = true;
				if (twitterContentLoaded) {
					putImagesInLogo();
				}
			}
			
		});
		//listen for instagram load error
		$(instagramData).one(instagramData.events.feedLoadError, function(e) {
	  		//load local instagram feed if error
	  		
	  		console.log('instagram error');
	  		pages=1;
	  		instagramData.get( this.errorFeed, true );
	  		
	  		
		});
		
		$(instagramData).one(instagramData.events.feedLoadTooFew, function(e) {
	  		//load local instagram feed if error
	  		
	  		console.log('instagram error');
	  		pages=1;
	  		instagramData.get( this.errorFeed, true );
	  		
	  		
		});
	}
	
	me.initTwitter  = function (data) {
		console.log('INIT TWITTER');
		
		twitterData = data;
		addToPhotoArray(cons.TWITTER);
		if (instagramContentLoaded) {
			putImagesInLogo();
		}
		twitterContentLoaded = true;
	}
	
	
	function putImagesInLogo () { // here
		console.log('PUTTING IMAGES IN LOGO. ' + photos.length)
		var $imagesToCache,
			numImagesToLoad,
			counter = 0;
		
		$links.html(getLinkImagesHTML());
		initLargeSquares();
		
		console.log('set $links html')
		$imagesToCache = $('#links, #largeCallouts');
		numImagesToLoad = $('#links img, #largeCallouts img').length;
		$progress.attr('max', 10);
		
		$imagesToCache.imagesLoaded({
			progress: function() {
				counter++;
				
				var percent = parseInt(counter * 10/numImagesToLoad);
				
				$progress.attr('value', percent).html('<strong>' + (percent * 10) + '%</strong>');
				
			},
			
			fail: function ($images, $proper, $broken) {
				$broken.each(function(i, el) {
					el.src = el.lowsrc;
				})
			},
			
			always: logoImagesLoadedEvent
		});
		$socialItemNodes = $('.socialItem');
		
		$linksWithLargeCallouts.on('click', 'a ', function(e) {
			
			e.preventDefault();
	 		//Track.instagramPhotoView(o.options.eventID);
	 		var type;
	 		
	 		if ($(e.target).hasClass('twitter-photo')) {
	 			type = 'twitter';
	 		} else if ($(e.target).hasClass('video-photo') || $(e.target).attr('data-video')) {
	 			type = 'video';
	 		} else {
	 			type = 'photo';
	 		}
	 		
	 		
			openModalWindow(e.target,type,instagramData);
			Track.mosiacInteraction(type);
		});
		
	}
	
	function addToPhotoArray(type) {
		console.log('addToPhotoArray: ' + instagramData.images);
		
		switch (type) {
			case cons.INSTAGRAM:
				photos = [];
				var images = instagramData.images;
				var count = 0;
				$.each(images, function (id, photo) {
					photo.id = id;
					photos.push(photo);
					count++;
				});
				console.log('done (instagram): ', count, photos.length)
				break;
			case cons.TWITTER:
				$.each(twitterData, function (id, tweet) {
					tweet.id = id;
					tweets.push(tweet);
				});
				console.log('done: ' + tweets.length)
				break;
		}
		
		
		
	}
	
	function randInt (lower, upper)
	{
		
		var size = upper-lower;
		return Math.floor(lower+(Math.random()*(size+1)));
	}
	
	function getHiddenImageIndex(socialItem) {
		var $imgs = $('img', socialItem);
		
	var activeImage = $(socialItem).attr('data-activeImage');
		//console.log(activeImage);
		if (activeImage !== undefined) {
			return parseInt(activeImage);
		} else {
			return 0;
		} 
	}
	
	function logoImagesLoadedEvent(e) {
		console.log('logoImagesLoadedEvent()')
		var endOfRowExceptions = [10,19,28,39,49,59];
		$('#landing-content').addClass('loaded');
		
		$('#links a').each(function(index, el) {
			var $el = $(el);
			
			
			
			
			$(el).attr('data-x', el.offsetLeft + 'px').attr('data-y', el.offsetTop + 'px');
			var elIndex = parseInt(el.hash.replace('#',''));
				
			if ($.inArray(elIndex, endOfRowExceptions) >= 0) {
				$el.addClass('end-of-row');	
			}
			
		})
		
		
		setInterval(function () {
			var dart = randInt(0, 66);
			
			if (dart <= 4 && areLargeSquareInitialized) {
				var num = randInt(0, 2)
				$($('.callout')[num]).cycle('next');
			} else {
				var length = $socialItemNodes.length,
					rand = randInt(0, length - 1),
					node = $socialItemNodes.get(rand);
				
				changeTile(node);
			}
		}, cycleInterval);
		
		var counter = 0;
			
		$socialItemNodes.sort(randomSortFunction);
		
		$socialItemNodes.each(function(index, el) {
			setTimeout(function() {
				$(el).addClass('loaded')
			}, index * 25);
		})
	}
	
	function getSlideNode(type, data) {
		var $img, sb = [];
		
		switch (type) {
			case cons.INSTAGRAM:
				sb.push('<img class="photo" src="');
				sb.push(data.images.low_resolution.url); 
				sb.push('" data-photoid="');
				sb.push(data.id);
				sb.push('"/>');
				
				break;
			case cons.TWITTER:
				sb.push(data.image); 
				sb.push('" data-photoid="');
				sb.push(data.id);
				sb.push('" data-tweet="');
				sb.push(escape(data.text));
				sb.push('" /><div class="twitter-icon"></div></div></a>');
				break;
		}
		$img = $(sb.join(''));
		
		return $img[0];
	}
	
	function placeSecondImage($parent) {
		var type = (randInt(1, 10) <= 10 *twitterToInstagramRatio)?cons.TWITTER:cons.INSTAGRAM,
			photo = getNextImage(type),
			nextSlide = getSlideNode(type, photo)
		$parent.append(nextSlide);
		
	}
	
	function onBefore (curr, next, opts) {
		var length = opts.elements.length;
		if (length <= 5 && opts.addSlide) { // <-- important! 
			var lastEl = opts.elements[length - 1];
			
			
			// add another image
			var type = (randInt(1, 10) <= 10 *twitterToInstagramRatio)?cons.TWITTER:cons.INSTAGRAM,
			photo = getNextImage(type),
			nextSlide = getSlideNode(type, photo)
				
			//img.onload = function () {
			opts.addSlide(nextSlide);
				
				
        }    
		
	}
	
	function setIEEvents() {
		//$('#links').hover(linksHoverIn, linksHoverOut);
		$('#links a').hover(linkHoverIn, linkHoverOut);
	}
	
	function linkHoverIn(e) {
		
		var target = e.currentTarget,
			$target = $(target),
			type = e.type,
			start = (type=='mouseenter')?0:1,
			end = (type=='mouseeneter')?0:1;
		
		$target.stop().css({
			zoltan: start
		}).animate({
			zoltan: end
		}, {
			step: function (now, fx) {
				var scaleFactor = (0.2 * now + 1);
				var marginFactor = - (10 * now) + 'px';
				this.style.filter = 
					'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (150 * now + 50) +') ' + 
					'progid:DXImageTransform.Microsoft.Matrix(' + 
							'M11=' + scaleFactor +', ' +
				            'M12=0, M21=0, ' + 
				            'M22=' + scaleFactor + ', '
				            'SizingMethod=\'auto expand\')'
				;
				/* this.style.marginLeft = marginFactor;
				this.style.marginTop = marginFactor; */
			},
			duration: 1000
		}
		);
	}
	
	function linkHoverOut(e) {
		var target = e.currentTarget,
			$target = $(target),
			style = target.style;
		
		$target.stop();	
		style.filter = '';
		style.marginLeft = '0px';
		style.marginTop = '0px';
	}
	
	function getLinkImagesHTML(images) {
		var sb = [],
			imageURLs = [],
			
			images = instagramData.images;
		
		
		
		for (var i=0; i< numImg; i++) {
			
			/*
			 * There is a 70/30 split to choosing Instagram and Twitter Images.
			 */
			var isTwitter = (randInt(1, 10) <= 10 *twitterToInstagramRatio),
				photo, photo2, className;
			
			
			if (isTwitter) {
				photo = tweets[tweetCounter % (tweets.length - 1)],
				/* rand = randInt(0, tweets.length - 1),
				photo2 = tweets[rand], */
				className = '';
			
				if (i <= 11) {
					className = 'first-row';
				} else if (i >= numImg-10) {
					className = 'last-row';
				}
				
				if ($.inArray(i, hoverExceptions) >= 0) {
					sb.push('<div class="blankSocialItem"></div><div class="blankSocialItem"></div>');
				} else {
					if (photo === undefined) {
						console.log('a photo: ' + instagramCounter % (photos.length - 1))
					}
					
					
					sb.push('<a class="socialItem ');
					sb.push(className);
					sb.push('"  href="#');
					sb.push(i);
					sb.push('"><div class="twitterContainer"><img lowsrc="http://a0.twimg.com/profile_images/2393507284/harley-davidson_reasonably_small.jpg" class="photo twitter-photo" src="');
					sb.push(photo.image); 
					sb.push('" data-photoid="');
					sb.push(photo.id);
					sb.push('" data-tweet="');
					sb.push(escape(photo.text));
					sb.push('" /><div class="twitter-icon"></div></div></a>');
					imageURLs.push(photo.image);
					
				}
				tweetCounter++;
			} else {
				photo = photos[instagramCounter % (photos.length - 1)],
				className = '';
			
				if (i <= 11) {
					className = 'first-row';
				} else if (i >= numImg-10) {
					className = 'last-row';
				}
				
				if ($.inArray(i, hoverExceptions) >= 0) {
					sb.push('<div class="blankSocialItem"></div><div class="blankSocialItem"></div>');
				} else {
					if (photo === undefined) {
						return;
					} 
					sb.push('<a class="socialItem ');
					sb.push(className);
					sb.push('"  href="#');
					sb.push(i);
					sb.push('"><img class="photo" src="');
					sb.push(photo.images.low_resolution.url); 
					sb.push('" data-photoid="');
					sb.push(photo.id);
					sb.push('"/></a>');
					imageURLs.push(photo.images.low_resolution.url);
					
				}
				instagramCounter++;
			}
			
			
		}
		return sb.join('')
	}
	
	function changeTile(node) {
			var $node = $(node);
			if (!$node.hasClass('is_cycle_enabled')) {
				placeSecondImage($node)
				$node.cycle({
					fx: 'scrollRight',
					speed: cycleSpeed,
					before: onBefore,
					
					timeout: 0
				}).addClass('is_cycle_enabled');
			}
			$node.closest('.socialItem').cycle('next');
		
	}
	
	function animateLogo() {
		var animation = new Silk($logo, {
			
		}, {
			stepStart: 0,
			stepEnd: 9,
			duration: 1000,
			complete: function () {
				
			},
			easing: 'easeInOutCubic',
			step: function (now, fx) {
				
				var index = Math.floor(now);
				
				$logo = polyClip.clipImage($logo.get(0), 'path:' + pathFrames[index]);
			}
		})
	}
	
	me.getImageTarget = function (link) {
		var $images = $('img', link),
			r = null;
		
		$images.each(function(index, el) {
			if ($(el).css('display') == 'block') {
				r=el;
			}
		});
		return r;
	}
	
	function randomSortFunction(a, b) {
		var n = randInt(0, 1);
		if (n == 0) {
			return -1;
		} else {
			return 1;
		}
	}
	
	function logoImagesLoadEvent(e) {
				
	}
	
	function getNextImage(type){
		var r;
		
		switch(type) {
			case cons.TWITTER:
				r = tweets[tweetCounter % (tweets.length - 1)];
				tweetCounter++;
				break;
			case cons.INSTAGRAM:
				r = photos[instagramCounter % (photos.length - 1)];
				instagramCounter ++;
				break;
		}
		
		return r;
	}
	
}

function getTwitter() {
	var twitterData = new Twitter();
	//twitterData.get($('#news-twitter-wrapper').attr('data-feed-url'));
	twitterData.get('hd110');
	$(twitterData).bind(twitterData.events.feedLoadSuccess, function(e, data) {
		twitterScroller(data);
		landing.initTwitter(data);
	}).bind(twitterData.events.feedLoadError, function (e, data) {
		twitterData.get('customtweets');
	});
}

function twitterScroller(data) {
	var totalTweets = 0, 
	tweetIndex = 0, 
	$dialogueSlides = $('<div class="dialogue-slides" />'),
	$dialogueContent = $('#twitter-modal .twitter-modal-content-item');
	
	$.each(data, function(id, tweet) {
		$('#tweets-wrapper').append('<div class="tweet"><img src="' + 
			tweet.image + '"/><p>"' + 
			tweet.text + '" <a href="http://twitter.com/' + 
			tweet.user + '" class="username" target="_blank">@' + 
			tweet.user + '</a></p></div>');
		$newSlide = $dialogueContent.clone();	
		$('.twitter-user-icon', $newSlide).attr('src', tweet.image);
	  $newSlide.attr('data-twitter-id', id); 
	  $('.twitter-tweet-text', $newSlide).html(tweet.text);
		$('.twitter-tweet-user', $newSlide).html('@' + 	tweet.user);
		$dialogueSlides.append($newSlide);
		totalTweets++;
	});
	if (totalTweets > 1) {
	  $('#next-tweet').removeClass('disabled');
	  scrollInterval = setInterval(function(){tweetScroll(1,true);}, 5000);
	}
	$dialogueContent.removeClass('twitter-modal-content-item').html('').append($dialogueSlides);
	
	$('#next-tweet').on('click', function() {
		tweetScroll(1);
	});
	$('#prev-tweet').on('click', function() {
		tweetScroll(-1);
	});
	$('.twitter-column').on('mouseenter mouseleave', function(e) {
  	if(e.type == 'mouseenter') clearInterval(scrollInterval);
  	else if(e.type == 'mouseleave') scrollInterval = setInterval(function(){tweetScroll(1,true);}, 5000);
  });
	function tweetScroll(direction,interval) {
		if(((direction == 1 && tweetIndex < totalTweets - 1) || (direction == -1 && tweetIndex > 0)) && !$('#tweets-wrapper').is(':animated')) {
			var tweetElement = $('#tweets-wrapper .tweet').get(tweetIndex + (direction - 1) / 2);
			tweetIndex += direction;
			$('#tweets-wrapper').animate({marginTop : '-=' + direction * ($(tweetElement).height() + 30)}, 600, 'easeInOutQuad', function() {
			  if (tweetIndex == 0) $('#prev-tweet').addClass('disabled');
			  else if (tweetIndex == totalTweets - 1) $('#next-tweet').addClass('disabled');
			  else $('#next-tweet, #prev-tweet').removeClass('disabled');
			});
		}
		else if (interval) {
		  tweetIndex = 0;
		  $('#next-tweet, #prev-tweet').toggleClass('disabled');
		  $('#tweets-wrapper').css('marginTop','0px');
		}
	}
}

var Billboard = Class.extend({
  init : function() {
    var o = this;
	  this.carousel = new Carousel({
		  el:             '#billboard-carousel', 
		  mask:           '.stage-wrap', 
		  itemsContainer: '.stage-items',
		  item:           '.carousel-item',
		  speed:          800,
		  infiniteScroll: true,
		  easing: 		'easeInOutQuad'
	  });
	  this.carousel.buildCarousel();
	  if($('.ie8').length > 0) {
			this.billboardSection = $('#billboard-wrapper');
			this.window = $(window);
			$(this.billboardSection).css({'position': 'relative', 'margin': '0px'});
			this._centerBillboardSection();
			var o = this;
			this.window.resize(function() {
				if($(this).width() > 940)
					o._centerBillboardSection();
			});
		}
	  if (this.carousel.totalItems > 1) this._setupPagination();
	},
	_setupPagination: function() {
	  var o = this;
	  $('#carousel-pagination').css('left',-this.carousel.totalItems*($('.pagination-button').width()/2+1)).show();
	  for (i = 1; i < this.carousel.totalItems; i++) $('#carousel-pagination').append('<div class="pagination-button"></div>');
	  $('#carousel-pagination').children().first().addClass('active');
	  $('.pagination-button').on('click', function(e) {
      if (!o.carousel.isMoving()) {
        o._selectPagination(this);
        o.carousel.selectItem($('.pagination-button').index(e.target));
      }
  	});
  	
  	this.scrollInterval = setInterval(function(){o._timerScroll();}, 5000);
  	$('#billboard-carousel').on('mouseenter mouseleave', function(e) {
  	  if(e.type == 'mouseenter') clearInterval(o.scrollInterval);
  	  else if(e.type == 'mouseleave') o.scrollInterval = setInterval(function(){o._timerScroll();}, 5000);
  	});
	},
	_selectPagination: function(item) {
		$('.pagination-button.active').removeClass('active');
		$(item).addClass('active');
	},
	_timerScroll: function() {
	  this.carousel.next();
	  var currentButton = $('.pagination-button').get(this.carousel.selectedIndex);
	  this._selectPagination(currentButton);
  },
  _centerBillboardSection: function() {
		var middle = (this.window.width() - this.billboardSection.width())*0.5;
		this.billboardSection.css('left', middle+'px');
	}
});


var mouseoverHelpers = new function () {
	var me = this;
	
	me.init = function () {
		$('body').bind('mousemove', mousemoveEvent);
	}
	
	function mousemoveEvent(e) {
		var x = e.pageX, y = e.pageY;
		
		var $el = $(document.elementFromPoint());
		if ($el.hasClass('video-thumb')) {
			
		}
	}
}

$(document).ready(function() {
	landing.init();
	getTwitter();

	//check to make sure the billboard isn't empty before initialization
	if($('#billboard-carousel .carousel-item').length > 0) {

		//IE7 woot woot 
        //So turns out IE7 was having issues loading larger scripts in the proper order and crashing
        //We have added a timeout that delays the initialization of JS objects
        if ($('.lt-ie8').length > 0) {
            setTimeout(function() {
                var billboard = new Billboard();
                //alert('ie7');
            }, 5000)
        } else {
            var billboard = new Billboard();
        }
	}
	
	$('#news-twitter').height($('#news-twitter > .news-column').height());
	$('#news-twitter > .news-column').css('visibility', 'visible');
});

