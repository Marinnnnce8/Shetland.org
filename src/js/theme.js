/**
 * Theme JS
 *
 * @copyright 2020 NB Communication Ltd
 *
 */

var theme = {

	init: function() {
		this.blocks();
		var percentNumber = document.getElementsByClassName('percent-num')[0];
		var bannerVideo = document.getElementsByClassName('banner-video')[0];
		var campaignSlider = document.getElementsByClassName('campaign-slider')[0];
		var navToggleButton = document.getElementsByClassName('js-navbar-toggle')[0];
		var printButton = document.getElementsByClassName('js-print-button')[0];
		var navAligned = document.getElementsByClassName('js-nav-aligned')[0];

		var downloadButton = document.querySelectorAll('download-button');

		if(percentNumber) {
			this.addMultiListener(window, 'load scroll', this.scrollPercentage);
		}

		if(bannerVideo) {
			this.addMultiListener(window, 'load scroll', this.ifVideoIsPlaying);
			this.videoPlayToggle();
			this.videoSoundToggle();
		}

		if(campaignSlider) {
			this.addMultiListener(window, 'load resize', theme.campaignItemSetHeight);
		}

		if(navToggleButton) {
			navToggleButton.addEventListener('click', this.toggleButtonClass);
		}

		if(printButton) {
			printButton.addEventListener('click', this.printContainer);
		}

		if(navAligned) {
			this.addMultiListener(window, 'load resize', this.alignNavLinks);
		}

		// if(downloadButton) {
		// 	this.downloadButtonEvent();
		// }
		
	},

	blocks: function() {

		$nb.profilerStart('theme.blocks');

		var alignments = ['left', 'right', 'center'];
		var fileIcons = {
			pdf: ['pdf'],
			word: ['doc', 'docx'],
			excel: ['xls', 'xlsx'],
			powerpoint: ['ppt', 'pptx'],
			archive: ['zip', 'tar']
		};

		$nb.$$('nb-block').forEach(function(block) {

			switch($uk.data(block, 'nb-block')) {
				case 'content':

					// Apply UIkit table component
					$uk.$$('table', block).forEach(function(el) {
						UIkit.nbTable(el);
					});

					// Inline Images UIkit Lightbox/Scrollspy
					($uk.$$('a[href]', block).filter(function(a) {
						return $uk.attr(a, 'href').match(/\.(jpg|jpeg|png|gif|webp)/i)
					})).forEach(function(a) {

						var figure = a.parentNode;
						var caption = $uk.$('figcaption', figure);

						// uk-lightbox
						UIkit.lightbox(figure, {animation: 'fade'});
						if(caption) $uk.attr(a, 'data-caption', $uk.html(caption));

						// uk-scrollspy
						for(var i = 0; i < alignments.length; i++) {
							var align = alignments[i];
							if($uk.hasClass(figure, 'align_' + align)) {
								UIkit.scrollspy(figure, {
									cls: ('uk-animation-slide-' + (align == 'center' ? 'bottom' : align) + '-small')
								});
							}
						}
					});

					// UIkit File Icons
					for(var key in fileIcons) {
						if($uk.hasOwn(fileIcons, key)) {
							var value = fileIcons[key];
							for(var i = 0; i < value.length; i++) {
								var links = $uk.$$('a[href$=".' + value[i] + '"]:not(.nb-file-icon):not(.nb-no-icon)', block);
								if(links.length) {
									links.forEach(function(el) {
										$uk.prepend(el, $nb.ukIcon(key == 'pdf' ? 'file-pdf' : (key == 'archive' ? 'album' : 'file-text')));
										$uk.addClass(el, 'nb-file-icon nb-file-icon-' + key);
									});
								}
							}
						}
					}

					break;
				case 'embed':

					$uk.$$('iframe', block).forEach(function(el) {
						$uk.attr(el, 'data-uk-responsive', true);
					});

					UIkit.update();

					break;
			}
		});

		$nb.profilerStop('theme.blocks');
	},

	//combining multiple event listeners
	addMultiListener: function(element, eventNames, listener) {
		var events = eventNames.split(' ');
		for (var i=0, iLen=events.length; i<iLen; i++) {
			element.addEventListener(events[i], listener, false);
		}
	},

	//calculating and displaying scroll percentage
	scrollPercentage: function() {
		var scrollPage = document.documentElement;
		var scrollBody = document.body;
		var	scrollTopOffset = 'scrollTop';
		var scrollHeight = 'scrollHeight';
		var percentNumber = document.getElementsByClassName('percent-num')[0];
		var percentCirclePath = document.getElementsByClassName('circlePath')[0];

		//scroll vertical offset
		var percent = (scrollPage[scrollTopOffset]||scrollBody[scrollTopOffset]) / ((scrollPage[scrollHeight]||scrollBody[scrollHeight]) - scrollPage.clientHeight) * 100;
		percent = Math.floor(percent);

		percentNumber.innerHTML = percent + '%';

		//svg circle scroll percentage calculation and display
		var svgRadius = percentCirclePath.getAttribute('r');
		var svgCircum = svgRadius * 2 * Math.PI;
		var svgCurrentAmount = svgCircum * (percent++) / 100;

		percentCirclePath.setAttribute('stroke-dasharray', svgCurrentAmount + ',' + svgCircum);
	},

	//toggle video button class depending on video pause/play
	ifVideoIsPlaying: function() {
		var playToggleBtn = document.getElementsByClassName('js-button-video')[0];
		var bannerVideo = document.getElementsByClassName('banner-video')[0];
		var isPlaying = bannerVideo.currentTime > 0 && !bannerVideo.paused && !bannerVideo.ended && bannerVideo.readyState > 2;

		if(isPlaying){
			playToggleBtn.setAttribute('aria-label', 'Pause');
			playToggleBtn.classList.add('button-video-active');
		}else {
			playToggleBtn.setAttribute('aria-label', 'Play');
			playToggleBtn.classList.remove('button-video-active');
		}
	},

	//toggle video
	videoPlayToggle: function() {

		var playToggleBtn = document.getElementsByClassName('js-button-video')[0];
		var bannerVideo = document.getElementsByClassName('banner-video')[0];

		playToggleBtn.addEventListener('click', function() {

			if(bannerVideo.paused) {
				bannerVideo.play();
				this.setAttribute('aria-label', 'Pause');
				this.classList.add('button-video-active');
			}else {
				bannerVideo.pause();
				this.setAttribute('aria-label', 'Play');
				this.classList.remove('button-video-active');
			}
		});
	},

	//toggle video sound
	videoSoundToggle: function() {
		var soundToggleBtn = document.getElementsByClassName('js-button-sound')[0];
		var bannerVideo = document.getElementsByClassName('banner-video')[0];

		soundToggleBtn.addEventListener('click', function() {
			if(bannerVideo.muted) {
				bannerVideo.muted = false;
				this.setAttribute('aria-label', 'Mute');
				this.classList.add('button-sound-active');
			}else {
				bannerVideo.muted = true;
				this.setAttribute('aria-label', 'Unmute');
				this.classList.remove('button-sound-active');
			}
		});
	},

	//set campaign slider item height equal to width 
	campaignItemSetHeight: function() {
		var campaignSlider = document.getElementsByClassName('campaign-slider')[0];
		var campaignItem = campaignSlider.querySelectorAll('.uk-card');
		var maxWidth = 0;

		maxWidth = campaignItem[0].offsetWidth;

		for(var i = 0;i < campaignItem.length;i++) {
			campaignItem[i].style.height = maxWidth + 'px';
		}
	},

	//Toggle class on click
	toggleButtonClass: function() {
		var activeClass = 'uk-navbar-toggle-open';

		if(this.classList.contains(activeClass)) {
			this.classList.remove(activeClass)
		} else {
			this.classList.add(activeClass);
		}
	},

	//Print button's container
	printContainer: function() {
		var printContents = this.parentNode;

		var printContents = printContents.innerHTML;
     	var originalContents = document.body.innerHTML;

     	document.body.innerHTML = printContents;

     	window.print();

     	document.body.innerHTML = originalContents;
	},


	//align dropdown navigation links with dropdown button 
	alignNavLinks: function() {
		var isDesktop = window.matchMedia('screen and (min-width: 1200px)').matches;
		var navAligned = document.getElementsByClassName('js-nav-aligned')[0];

		if(isDesktop) {
			
			var navParent = navAligned.closest('.mega-menu');
			var navButton = navParent.getElementsByTagName('button')[0];

			//calculate dropdown button's left offset
			var bodyRect = document.body.getBoundingClientRect().left;
			var navButtonLeftPos = navButton.getBoundingClientRect().left;
			var navButtonLeftPosOffset = navButtonLeftPos - bodyRect;

			navAligned.style.left = navButtonLeftPosOffset + 'px';
			navAligned.style.paddingLeft = 0 + 'px';
		} else {
			navAligned.style.left = '';
			navAligned.style.paddingLeft = '';
			return;
		}
	}

	// downloadButtonEvent: function() {
	// 	document.querySelectorAll('.download-button').forEach(button => {

	// 		let duration = 3000,
	// 			svg = button.querySelector('svg'),
	// 			svgPath = new Proxy({
	// 				y: null,
	// 				smoothing: null
	// 			}, {
	// 				set(target, key, value) {
	// 					target[key] = value;
	// 					if(target.y !== null && target.smoothing !== null) {
	// 						svg.innerHTML = getPath(target.y, target.smoothing, null);
	// 					}
	// 					return true;
	// 				},
	// 				get(target, key) {
	// 					return target[key];
	// 				}
	// 			});
		
	// 		button.style.setProperty('--duration', duration);
		
	// 		svgPath.y = 20;
	// 		svgPath.smoothing = 0;
		
	// 		button.addEventListener('click', e => {
				
	// 			// e.preventDefault();
		
	// 			if(!button.classList.contains('loading')) {
		
	// 				button.classList.add('loading');
		
	// 				gsap.to(svgPath, {
	// 					smoothing: .3,
	// 					duration: duration * .065 / 1000
	// 				});
		
	// 				gsap.to(svgPath, {
	// 					y: 12,
	// 					duration: duration * .265 / 1000,
	// 					delay: duration * .065 / 1000,
	// 					ease: Elastic.easeOut.config(1.12, .4)
	// 				});
		
	// 				setTimeout(() => {
	// 					svg.innerHTML = getPath(0, 0, [
	// 						[3, 14],
	// 						[8, 19],
	// 						[21, 6]
	// 					]);
	// 				}, duration / 2);
		
	// 			}
		
	// 		});
		
	// 	});
		
	// 	function getPoint(point, i, a, smoothing) {
	// 		let cp = (current, previous, next, reverse) => {
	// 				let p = previous || current,
	// 					n = next || current,
	// 					o = {
	// 						length: Math.sqrt(Math.pow(n[0] - p[0], 2) + Math.pow(n[1] - p[1], 2)),
	// 						angle: Math.atan2(n[1] - p[1], n[0] - p[0])
	// 					},
	// 					angle = o.angle + (reverse ? Math.PI : 0),
	// 					length = o.length * smoothing;
	// 				return [current[0] + Math.cos(angle) * length, current[1] + Math.sin(angle) * length];
	// 			},
	// 			cps = cp(a[i - 1], a[i - 2], point, false),
	// 			cpe = cp(point, a[i - 1], a[i + 1], true);
	// 		return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
	// 	}
		
	// 	function getPath(update, smoothing, pointsNew) {
	// 		let points = pointsNew ? pointsNew : [
	// 				[4, 12],
	// 				[12, update],
	// 				[20, 12]
	// 			],
	// 			d = points.reduce((acc, point, i, a) => i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${getPoint(point, i, a, smoothing)}`, '');
	// 		return `<path d="${d}" />`;
	// 	}
	// }
};

$uk.ready(function() {
	theme.init();
});

/**
 * jsonRender
 *
 * @param {Array} items
 * @return {string}
 *
 */
function renderItems(items) {

	$nb.profilerStart('theme.renderItems');

	var classes = ['uk-grid-match', 'uk-child-width-1-2@s'];
	var sizes = $nb.ukWidths(classes);
	var config = $uk.isPlainObject(this.config) ? this.config : {};
	var metas = ['date_pub', 'dates', 'location'];
	var clsTag = 'uk-label uk-label-primary uk-margin-small-right';

	var out = '';
	for(var i = 0; i < items.length; i++) {

		var item = items[i];

		// Title
		var title = $nb.wrap(
			$nb.wrap(item.title, {href: item.url, class: 'uk-link-reset'}, 'a'),
			{class: ['uk-card-title', 'uk-margin-remove-bottom']},
			'h3'
		);

		// Image
		var image = item.getImage ? $nb.img(item.getImage, {
			alt: item.title,
			sizes: (sizes.length ? sizes.join(', ') : false),
		}, {
			ukImg: {target: '!* +*'}
		}) : '';

		// Meta
		var meta = '';
		for(var n = 0; n < metas.length; n++) {
			var v = item[metas[n]];
			if(v) meta += $nb.wrap(v, 'uk-text-meta')
		}

		// Tags
		var tags = '';
		if(config.showTemplate && item.template) {
			tags += $nb.wrap($uk.ucfirst(item.template), clsTag);
		}
		if($uk.isArray(item.tags)) {
			item.tags.forEach(function(tag) {
				tags += $nb.wrap(tag.title, clsTag);
			});
		}

		// Summary
		var summary = (item.getSummary ? $nb.wrap(item.getSummary, 'p') : '');

		// CTA
		var cta = $nb.wrap((config.cta ? config.cta : $nb.ukIcon('more')), {
			href: item.url,
			class: ['uk-button', 'uk-button-text']
		}, 'a');

		out += $nb.wrap(
			$nb.wrap(
				(image ? $nb.wrap($nb.wrap(image, {href: item.url}, 'a'), 'uk-card-media-top') : '') +
				$nb.wrap(title + meta + tags, 'uk-card-header') +
				(summary ? $nb.wrap(summary, 'uk-card-body') : '') +
				$nb.wrap(cta, 'uk-card-footer'),
				'uk-card uk-card-default'
			),
			'div'
		);
	}

	out = $nb.wrap(out, {
		class: classes,
		dataUkGrid: true,
		dataUkScrollspy: {
			target: '> div',
			cls: 'uk-animation-slide-bottom-small',
			delay: NB.options.duration,
		}
	}, 'div');

	$nb.profilerStop('theme.renderItems');

	return out;
}

