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
		if(percentNumber) {
			this.addMultiListener(window, 'load scroll', this.scrollPercentage);
		}
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
	}
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
