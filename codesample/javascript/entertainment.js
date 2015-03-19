/* This file controls entertainment page form and dom elements */
$(document).ready(function() {
	$('#table-content tr').each(function(i) {
		$('td:last', $(this)).addClass('last');
		if (i % 2 === 0) {
			$(this).addClass('alt');
		}
	});
	
	$('#table-content td a[href!="#"], #promos a').attr('target', '_blank');
	$('#table-content td a[href="#"]').each(function() {
		var el = $(this);
		if (!$('img', el).length) {
			el.addClass('no-link').click(function() {
				return false;
			});
		}
	});

	$('#table-content ul:first-child li').not('.active').click(function(e) {
		e.preventDefault();
		$(this).siblings().removeClass('active');
		$('[data-set]').removeClass('active');
		$('[data-set="' + $(this).data('set') + '"]').addClass('active');
	});

	$('[data-set="1"]').addClass('active');

	$('.toplink a').click(function(e) {
		e.preventDefault();
		var scrollto = $('body').offset();
		$('html, body').animate({scrollTop: scrollto.top}, 1000);	
	});

	$('#table-content td a:not(".no-link"), #performers .span3 a, .headline-act, .concert-name a, .event_wrapper a').click(function(e) {
		var el = $(this);
		if ($('img', el).length || el.data('fb') !== undefined || el.data('tw') !== undefined || el.data('yt') !== undefined || el.data('img') !== undefined) {
			e.preventDefault();
			showArtistOverlay(el);
		}
	});

	$(document).on('MP.ModalOpened', function() {
		var $l = $('.artist-details ul li:first-child');
  	$('.artist-details a[href="#"]').parents('li').hide();
  	if (!$l.is(':visible')) {
  		$l.next(':visible').addClass('first');
  	}
  });

	function showArtistOverlay(el) {
		var modalNodes = MP.Modal.getContentNode(),
				img = $('img', el).length,
				template = img ? 'templates.content' : el.data('img') !== undefined ? 'templates.content' : 'templates.contentNoImage',
				src = el.data('img') !== undefined ? '/images/_entertainment/artists/large/' + el.data('img') + '.jpg' : img ? $('img', el).attr('src').replace('/artists/', '/artists/large/') : '',
				mHeight = img ? 480 : el.data('img') !== undefined ? 480 : 200,
				$c = $(modalNodes.content),
				title = img ? $('em', el).clone().children().remove().end().text() : $(el).clone().children().remove().end().text(),
				html = config.getScriptedValue(template, {
					title: title,
					src: src,
					www: el.attr('href'),
					fb: el.data('fb') !== undefined ? el.data('fb') : '#',
					tw: el.data('tw') !== undefined ? el.data('tw') : '#',
					yt: el.data('yt') !== undefined ? el.data('yt') : '#'
				});
		$c.html(html);
		MP.Modal.open({width: 626, height: mHeight});
	}
});