/**
 * NB
 *
 * @version 3.5.3
 * @author Chris Thomson
 * @copyright 2020 NB Communication Ltd
 *
 */

if(typeof UIkit === 'undefined') {
	throw new Error('NB requires UIkit. UIkit must be included before this script.');
}

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('nb', factory) :
	(global = global || self, global.NB = factory());
}(this, function() { 'use strict';

	/**
	 * UIkit utilities
	 *
	 * https://github.com/uikit/uikit-site/blob/feature/js-utils/docs/pages/javascript-utilities.md
	 *
	 */
	var $uk = UIkit.util;

	/**
	 * Javascript Promise
	 *
	 */
	var Promise = 'Promise' in window ? window.Promise : $uk.Promise;

	/**
	 * Can the Storage API be used?
	 *
	 */
	var hasStorage = 'localStorage' in window && 'sessionStorage' in window;

	/**
	 * Object.values
	 *
	 */
	if(!Object.values) Object.values = function(obj) {
		return Object.keys(obj).map(function(key) {
			return obj[key];
		});
	};

	/**
	 * Cookie Consent Settings
	 *
	 */
	var nbCookie = {settings: {}};

	/**
	 * Is desktop client?
	 *
	 */
	var isDesktop = true;

	/**
	 * Select a single HTML element
	 *
	 * @return {HTMLElement}
	 *
	 */
	function $() {
		return _query(arguments);
	}

	/**
	 * Select multiple HTML elements
	 *
	 * @return {HTMLCollection}
	 *
	 */
	function $$() {
		return _query(arguments, true);
	}

	/**
	 * Select single/multiple HTML elements
	 *
	 * @param {Array} args
	 * @param {Boolean} [multiple]
	 * @return {(HTMLElement | HTMLCollection)}
	 *
	 */
	function _query(args, multiple) {

		var name, context = document, prefix = '.';
		var prefixes = ['.', '#', '[data]'];

		for(var i = 0; i < args.length; i++) {
			var arg = args[i];
			if($uk.isString(arg)) {
				if(prefixes.indexOf(arg) !== -1) {
					prefix = arg;
				} else {
					name = arg;
					for(var n = 0; n < prefixes.length; n++) {
						var pre = prefixes[n];
						if($uk.startsWith(name, pre)) {
							name = name.replace(pre, '');
							prefix = pre;
						}
					}
				}
			} else if($uk.isNode(arg)) {
				context = arg;
			}
		}

		var selector;
		switch(prefix) {
			case '[data]':
				selector = '[data-' + name + ']';
				break;
			default:
				selector = prefix + name;
				break;
		}

		return $uk[(multiple ? '$$' : '$')](selector, context);
	}

	/**
	 * Perform an asynchronous request
	 *
	 * @param {string} [url]
	 * @param {Object} [options]
	 * @return {Promise}
	 *
	 */
	function ajax(url, options) {

		profilerStart('nb.ajax');

		if(!url) url = [location.protocol, '//', location.host, location.pathname].join('') + '?ajax=1';
		if(options === void 0 || !$uk.isPlainObject(options)) options = {};

		if($uk.includes(url, '#')) {
			// Make sure # comes after ?
			var x = url.split('#'), y = x[1].split('?');
			url = x[0] + (y.length > 1 ? '?' + y[1] : '') + '#' + y[0];
		}

		options = $uk.assign({
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			method: 'GET',
			responseType: 'json'
		}, options);

		return new Promise(function(resolve, reject) {
			$uk.ajax(url, options).then(function(xhr) {
				var response = getRequestResponse(xhr);
				profilerStop('nb.ajax');
				if(!response.status) {
					reject(response);
				} else {
					resolve(response);
				}
			}, function(e) {
				profilerStop('nb.ajax');
				reject(getRequestResponse(e.xhr, e.status, e));
			});
		});
	}

	/**
	 * Return html attributes as a rendered string
	 *
	 * @return {string}
	 *
	 */
	function attr() {

		var attrs = {};
		var tag = '';
		var close = false;

		// Get and set arguments provided
		for(var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if($uk.isBoolean(arg)) {
				close = arg;
			} else if($uk.isString(arg) && arg) {
				tag = arg;
			} else if($uk.isArray(arg) && arg.length) {
				if(!('class' in attrs)) attrs.class = [];
				if(!$uk.isArray(attrs.class)) attrs.class = [attrs.class];
				for(var n = 0; n < arg.length; n++) attrs.class.push(arg[n]);
				tag = 'div';
			} else if($uk.isPlainObject(arg)) {
				attrs = $uk.assign(attrs, arg);
			}
		}

		var attributes = [];
		for(var key in attrs) {
			if($uk.hasOwn(attrs, key)) {
				var value = attrs[key];
				switch(key) {
					case 'element':
					case 'nodeName':
					case 'tag':
						// If `tag` is passed in attrs
						// and a tag has not been passed
						// make it the tag
						if(!tag) tag = value;
						break;
					case 'close':
						// If `close` is passed in attrs
						// set this as the close value
						close = $uk.toBoolean(value);
						break;
					default:
						if(value !== false) {
							if(key) key = $uk.hyphenate(key);
							if(value == '' || $uk.isBoolean(value)) {
								attributes.push(key);
							} else {
								value = attrValue(value);
								attributes.push(key ? key + '="' + value + '"' : value);
							}
						}
						break;
				}
			}
		}

		attributes = attributes.join(' ');
		attributes = attributes ? ' ' + attributes : '';
		if(tag) tag = tag.replace(/<|>|\//gi, '');

		return tag ? '<' + tag + attributes + '>' + (close ? '</' + tag + '>' : '') : attributes;
	}

	/**
	 * Convert a value to an html attribute value
	 *
	 * @param {*} value The value to process.
	 * @return {string}
	 *
	 */
	function attrValue(value) {
		if($uk.isArray(value)) {
			value = value.join(' ');
		} else if($uk.isPlainObject(value)) {
			var attrValue = [];
			var val;
			for(var key in value) {
				if($uk.hasOwn(value, key)) {
					val = value[key];
					if($uk.isPlainObject()) break;
					if($uk.isBoolean(val)) val = val ? 'true' : 'false';
					key = $uk.hyphenate(key);
					attrValue.push(key + ': ' + val);
				}
			}
			value = Object.keys(value).length == attrValue.length ? attrValue.join('; ') : JSON.stringify(value);
		}
		return value;
	}

	/**
	 * Decode a value from Base64
	 *
	 * @param {*} value The value to decode.
	 * @param {string} [delimiter] If specified, the string will be split into an array.
	 * @return {(string | Object | Array)}
	 *
	 */
	function base64_decode(value, delimiter) {
		try {
			value = atob(value);
			value = data(value, delimiter);
		} catch(e) {
			value = '';
		}
		return value;
	}

	/**
	 * Encode a value to Base64
	 *
	 * @param {*} value The value to encode.
	 * @param {string} [delimiter] An array value will be joined by this (default='').
	 * @return {string}
	 *
	 */
	function base64_encode(value, delimiter) {
		if(delimiter === void 0) delimiter = '';
		if($uk.isArray(value)) value = value.join(delimiter);
		if($uk.isPlainObject(value)) value = JSON.stringify(value);
		return btoa(value);
	}

	/**
	 * Handles cookie consent settings.
	 *
	 * @param {(string | boolean)} key The cookie setting name.
	 * @param {(number | boolean | string | callable)} value The value to set or a listener function.
	 * @return {(number | null)}
	 *
	 */
	function cookieConsent(key, value) {
		if(key === void 0) return nbCookie.settings;
		if($uk.isBoolean(key)) {
			value = key;
			for(var key in nbCookie.settings) {
				if($uk.hasOwn(nbCookie.settings, key)) {
					cookieConsent(key, (value ? value : nbCookie.settings[key]));
				}
			}
		} else {
			if(!(key in nbCookie.settings)) return null;
			if($uk.isFunction(value)) {
				if(!(key in CookieSetting.data.callbacks)) {
					CookieSetting.data.callbacks[key] = [];
				}
				CookieSetting.data.callbacks[key].push(value);
			} else if(!$uk.isUndefined(value)) {
				if($uk.isNumeric(value)) value = parseInt(value);
				if($uk.isString(value)) value = value.toLowerCase() == 'yes' ? 1 : 0;
				if($uk.isBoolean(value)) value = value ? 1 : 0;
				nbCookie.settings[key] = value;
				if(hasStorage) {
					localStorage.setItem('nbCookie', JSON.stringify(nbCookie.settings));
				}
			}
		}
		return nbCookie.settings[key];
	}

	/**
	 * Data
	 *
	 * @param {(string | HTMLElement)} value The string to parse, or the element to retrieve data from.
	 * @param {string} [key] The data-* attribute key/name.
	 * @param {boolean} [base64]
	 * @return {(string | Object | Array)} Should the retrieved value be decoded from Base64?
	 *
	 */
	function data(value, key, base64) {

		if($uk.isPlainObject(value)) return value;

		var el;
		if($uk.isNode(value)) {
			el = value;
			value = key ? $uk.data(el, key) : '';
		}
		if(base64) {
			if(el) {
				['', 'data-'].forEach(function(prefix) {
					var name = prefix + key;
					if($uk.hasAttr(el, name)) {
						$uk.removeAttr(el, name);
					}
				});
			}
			return value ? base64_decode(value) : {};
		}

		try {
			value = $uk.parseOptions(value);
		} catch(e) {
			if(key && $uk.includes(value, key)) {
				value = value.split(key);
			}
		}

		return value;
	}

	/**
	 * Debounce
	 *
	 * @param {Function} func The function to limit.
	 * @param {number} [wait] The time (ms) to wait between fires.
	 * @param {boolean} [immediate] Trigger the function on the leading edge, instead of the trailing.
	 * @return {Function}
	 *
	 */
	function debounce(func, wait, immediate) {

		var timeout;
		if(wait === void 0) wait = NB.options.duration;
		return function() {

			var context = this;
			var args = arguments;
			var later = function() {
				timeout = null;
				if(!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);

			if(callNow) func.apply(context, args);
		};
	}

	/**
	 * Get a class name
	 *
	 * @param {(Object | string)} item
	 * @return {string}
	 *
	 */
	function getClassName(item) {
		if($uk.isPlainObject(item)) {
			if('$options' in item) {
				item = item.$options.name;
			} else {
				var infer = ['name', 'title'];
				var key;
				for(var i = 0; i < infer.length; i++) {
					key = infer[i];
					if(key in item) {
						item = item[key];
						break;
					}
				}
			}
		}
		return $uk.isString(item) ? $uk.hyphenate(item).replace(/\s+/g, '-') : '';
	}

	/**
	 * Get the previous sibling, with optional selector
	 *
	 * @param {HTMLElement} el The element to get the previous sibling of.
	 * @param {string} [selector] An optional selector.
	 *
	 */
	function getPreviousSibling(el, selector) {

		// Get the previous sibling element
		var sibling = el.previousElementSibling;

		// If there's no selector, return the first sibling
		if(!$uk.isString(selector)) return sibling;

		// If the sibling matches our selector, use it
		// If not, jump to the next sibling and continue the loop
		while(sibling) {
			if(sibling.matches(selector)) return sibling;
			sibling = sibling.previousElementSibling;
		}
	}

	/**
	 * Process an XHR response and return data
	 *
	 * @param {Object} xhr
	 * @param {number} [status]
	 * @param {*} [fallback]
	 * @return {Object}
	 *
	 */
	function getRequestResponse(xhr, status, fallback) {

		if(status === void 0 || !$uk.isNumber(status)) {
			if($uk.isString(status)) fallback = status;
			status = 500;
		}
		if(xhr.status) status = xhr.status;
		if(fallback === void 0) fallback = null;

		var response = xhr.response;
		if(!$uk.isPlainObject(response)) {
			try {
				response = JSON.parse(response);
			} catch(e) {
				if(!fallback) fallback = response;
			}
		}

		if($uk.isPlainObject(response)) {
			if('errors' in response) {
				response = getResponseErrors(response.errors);
				if(status < 400) status = 0;
			} else if('data' in response) {
				response = response.data;
			}
		} else {
			response = fallback;
			status = 500;
		}

		return {status: parseInt(status), response: response};
	}

	/**
	 * Parse response errors
	 *
	 * @param {Object} e
	 * @return {Array}
	 *
	 */
	function getResponseErrors(e) {
		var errors = [];
		for(var i = 0; i < e.length; i++) {
			errors.push(e[i].message);
		}
		return errors;
	}

	/**
	 * Perform an asynchronous request to a GraphQL API endpoint
	 *
	 * @param {string} query The GraphQL query.
	 * @param {Object} [variables] Additional `key:value` variables.
	 * @return {Promise}
	 *
	 */
	function graphql(query, variables) {
		var data = {query: query};
		if($uk.isPlainObject(variables)) data.variables = variables;
		return ajax(NB.options.graphql, {
			data: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest'
			},
			method: 'POST'
		});
	}

	/**
	 * Render an image
	 *
	 * @param {(string | Object)} image The image to render.
	 * @param {(Object | string)} [attrs] Attributes for the tag. If a string is passed the alt attribute is set.
	 * @param {Object} [options] Options to modify behaviour.
	 * @return {string}
	 *
	 */
	function img(image, attrs, options) {

		// Shortcuts
		if($uk.isString(attrs)) attrs = {alt: attrs};
		if(attrs === void 0) attrs = {};
		if(options === void 0) options = {};

		// Set default options
		options = $uk.assign({
			focus: false,
			tag: 'img',
			ukImg: true,
			src: 'url'
		}, options);

		var isImg = options.tag === 'img';
		var focus = {left: 50, top: 50};
		var srcset = false;
		var sizes = false;

		if($uk.isPlainObject(image)) {
			if(image.focus && $uk.isPlainObject(image.focus)) focus = $uk.assign(focus, image.focus);
			if(image.srcset) srcset = image.srcset;
			if(image.sizes && image.srcset) sizes = image.sizes;
			image = image[options.src];
		}

		// Set default img attributes
		attrs = $uk.assign({
			alt: '',
			width: 0,
			height: 0
		}, attrs);

		// If no image has been passed or nothing found
		if(!image) return '';

		// Set width/height from image url
		var matches = image.match(/(\.\d*x\d*\.)/g);
		if(isImg && matches) {
			var size = matches[0].split('x');
			if(!attrs.width) attrs.width = $uk.toNumber(size[0].replace('.', ''));
			if(!attrs.height) attrs.height = $uk.toNumber(size[1].replace('.', ''));
		}

		// If a background image, set the background position style
		if(!isImg && options.focus) {
			var styles = attrs.style ? attrs.style.split(';') : [];
			styles.push('background-position:' + focus.left + '% ' + focus.top + '%');
			attrs.style = styles.join(';');
		}

		// Remove unnecessary attributes
		if(attrs.width == 0 || !isImg) attrs.width = false;
		if(attrs.height == 0 || !isImg) attrs.height = false;
		if(!isImg) attrs.alt = false;
		if(!srcset && 'sizes' in attrs) delete(attrs.sizes);

		// Set remaining attributes
		if(options.ukImg) {
			var a = { // Use uk-img lazy loading
				src: (isImg ? 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==' : false),
				dataSrc: image,
				dataSrcset: srcset,
				dataUkImg: options.ukImg
			};
			if(sizes && srcset) a.dataSizes = sizes;
			attrs = $uk.assign(a, attrs);
		} else if(isImg) {
			attrs.src = image;
			attrs.srcset = srcset;
			if(srcset) attrs.sizes = sizes;
		} else {
			// Set background-image style
			attrs.style = 'background-image:url(' + image + ');' + (attrs.style ? attrs.style : '');
		}

		return attr(attrs, options.tag);
	}

	/**
	 * Render a background image
	 *
	 * @param {(string | Object)} image The image to render.
	 * @param {Object} [attrs] Attributes for the tag.
	 * @param {Object} [options] Options to modify behaviour.
	 * @return {string}
	 *
	 */
	function imgBg(image, attrs, options) {

		if(!$uk.isPlainObject(attrs)) attrs = {};
		if(!$uk.isPlainObject(options)) options = {};

		// Set default attributes
		attrs = $uk.assign({
			alt: false,
			class: 'uk-background-cover'
		}, attrs);

		// Set default options
		options = $uk.assign({
			tag: 'div',
			focus: true
		}, options);

		return img(image, attrs, options);
	}

	/**
	 * Check if a string is a tag
	 *
	 * @param {string} str The string to be checked.
	 * @return {boolean}
	 *
	 */
	function isTag(str) {
		return /<[a-z][\s\S]*>/i.test(str);
	}

	/**
	 * Render a link
	 *
	 * @param {(string | Object)} url The href attribute.
	 * @param {(string | Object | boolean | null)} [label] The link label.
	 * @param {(Object | string | boolean} [attrs] Attributes for the link.
	 * @return {string}
	 *
	 */
	function link(url, label, attrs) {

		if(label === void 0) label = '';
		if(attrs === void 0) attrs = {};

		var _blank = false;

		if($uk.isBoolean(attrs)) {
			_blank = attrs;
			attrs = {};
		} else if(!$uk.isPlainObject(attrs)) {
			attrs = {class: attrs};
		}

		if($uk.isPlainObject(url)) {
			if('href' in url) {
				attrs = url;
				url = attrs.href;
			} else if('url' in attrs) {
				label = url[label ? label : 'title'];
				url = url.url;
			} else {
				attrs = url;
				url = '#';
			}
		}

		if(label == null) {
			label = url;
		} else if($uk.isPlainObject(label)) {
			attrs = label;
			label = '';
		} else if($uk.isBoolean(label)) {
			_blank = label;
			label = '';
		}

		if($uk.includes(url, '://')) {
			_blank = true;
		}

		attrs.href = url;
		if(!('target' in attrs)) {
			attrs.target = _blank ? '_blank' : false;
		}
		if(!('rel' in attrs)) {
			attrs.rel = _blank ? 'noopener' : false;
		}

		return wrap(label, attrs, 'a');
	}

	/**
	 * Load an asset and append it
	 *
	 * @param {string} type The type of element to be created.
	 * @param {Object} attrs The attributes for the created element.
	 * @param {string} element The element to append the created element.
	 * @return {Promise}
	 *
	 */
	function loadAsset(type, attrs, element) {
		var name = 'nb.loadS' + (type == 'script' ? 'cript' : 'tyle');
		profilerStart(name);
		return new Promise(function(resolve) {
			var tag = document.createElement(type);
			for(var key in attrs) {
				if($uk.hasOwn(attrs, key)) {
					var value = attrs[key];
					if(key == 'element') {
						element = value;
					} else {
						tag[key] = value;
					}
				}
			}
			tag.onload = function() {
				profilerStop(name);
				resolve();
			};
			$uk.append(element, tag);
		});
	}

	/**
	 * Load assets
	 *
	 * @param {Array} assets The assets to load.
	 * @param {Promise}
	 *
	 */
	function loadAssets(assets) {
		var promises = [];
		for(var i = 0; i < assets.length; i++) {
			var asset = assets[i];
			promises.push(
				($uk.isPlainObject(asset) ?
					(asset.src ? asset.src : (asset.href ? asset.href : '')) :
					asset
				).substr(-2) == 'js' ?
				loadScript(asset) : loadStyle(asset)
			);
		}
		return Promise.all(promises);
	}

	/**
	 * Load a script and append it to the body
	 *
	 * @param {(string | Object)} src The src url of the script to be loaded.
	 * @return {Promise}
	 *
	 */
	function loadScript(src) {
		return loadAsset(
			'script',
			($uk.isPlainObject(src) ? src : {src: src, async: true}),
			(arguments.length > 1 ? arguments[1] : 'body')
		);
	}

	/**
	 * Load a style and append it to the head
	 *
	 * @param {(string | Object)} src The src url of the style to be loaded.
	 * @return {Promise}
	 *
	 */
	function loadStyle(src) {
		var attrs = ($uk.isPlainObject(src) ? src : {href: src});
		attrs.rel = 'stylesheet';
		return loadAsset('link', attrs, (arguments.length > 1 ? arguments[1] : 'head'));
	}

	/**
	 * Make a string a tag if it is not already
	 *
	 * @param {string} str The string to be processed.
	 * @return {string}
	 *
	 */
	function makeTag(str) {
		return isTag(str) ? str :
			(str.substr(0, 1) == '<' ? '' : '<') +
				str + (str.substr(str.length - 1, 1) == '>' ? '' : '>');
	}

	/**
	 * Perform an asynchronous POST request
	 *
	 * @param {string} [url]
	 * @param {(Object | HTMLElement)} [data]
	 * @return {Promise}
	 *
	 */
	function post(url, data) {
		return ajax(url, {
			data: objectToFormData(data),
			method: 'POST'
		});
	}

	/**
	 * Start a ProfilerPro timer
	 *
	 * @param {string} name Name of your event.
	 * @return {(Array | null)} Event to be used for stop call.
	 *
	 */
	function profilerStart(name) {
		return 'profiler' in window ? profiler.start(name) : null;
	}

	/**
	 * Stop a ProfilerPro timer
	 *
	 * @param {string} name The event name.
	 * @return {number} Returns elapsed time since the start() call.
	 *
	 */
	function profilerStop(name) {
		return 'profiler' in window ? profiler.stop(name) : 0;
	}

	/**
	 * Punctuate a string if it is not already
	 *
	 * @param {string} str The string to be punctuated.
	 * @param {string} [punctuation] The punctuation mark to use.
	 * @return {string}
	 *
	 */
	function punctuateString(str, punctuation) {
		if(punctuation === void 0) punctuation = '.';
		if(!(/.*[.,\/!?\^&\*;:{}=]$/.test(str))) str = str + punctuation;
		return str;
	}

	/**
	 * Create a query string from a key:value object
	 *
	 * @param {Object} query The `key:value` object.
	 * @return {string}
	 *
	 */
	function queryString(query) {
		return '?' + Object.keys(query).map(function(key) {
			return key + '=' + query[key];
		}).join('&');
	}

	/**
	 * Set an option value
	 *
	 * @param {string} key The option name.
	 * @param {*} value The option value.
	 *
	 */
	function setOption(key, value) {
		if(key === void 0 || value === void 0) return;
		if(!(key in NB.options)) return;
		if($uk.isPlainObject(NB.options[key]) && $uk.isPlainObject(value)) {
			NB.options[key] = $uk.assign({}, NB.options[key], value);
		} else {
			NB.options[key] = value;
		}
	}

	/**
	 * Return a UIkit alert
	 *
	 * @param {string} message The alert message.
	 * @return {string}
	 *
	 */
	function ukAlert(message) {

		if(message === void 0) return;
		if($uk.isArray(message)) message = message.join('<br>');

		var style = 'primary';
		var options = {};
		var close = false;
		var attrs = {class: ['uk-alert']};

		// Get and set any other arguments provided
		for(var i = 1; i < arguments.length; i++) {
			var arg = arguments[i];
			if($uk.isBoolean(arg)) {
				close = arg;
			} else if($uk.isNumeric(arg)) {
				arg = $uk.toNumber(arg);
				if(i == 1) {
					style = arg < 100 || arg >= 400 ? 'danger' : 'success';
				} else {
					options.duration = arg;
				}
			} else if($uk.isString(arg)) {
				style = arg;
			} else if($uk.isArray(arg)) {
				for(var n = 0; n < arg.length; n++) attrs.class.push(arg[n]);
			} else if($uk.isPlainObject(arg)) {
				if('animation' in arg) {
					options = $uk.assign(options, arg);
				} else {
					if('class' in arg) {
						if(!$uk.isArray(arg.class)) arg.class = arg.class.split(' ');
						for(var n = 0; n < arg.class.length; n++) attrs.class.push(arg.class[n]);
						delete arg.class;
					}
					attrs = $uk.assign(attrs, arg);
				}
			}
		}

		// Add role=alert to 'danger' style
		if(style == 'danger') attrs.role = 'alert';

		// Set style class
		attrs.class.push('uk-alert-' + style);

		// Set options
		attrs['dataUkAlert'] = close || Object.keys(options).length ?
			$uk.assign({}, NB.options.ukAlert, options) : true;

		return wrap(
			(close ? attr({
				class: 'uk-alert-close',
				dataUkClose: true
			}, 'a', true) : '') +
			wrap(message, (isTag(message) ? '' : 'p')),
			attrs,
			'div'
		);
	}

	/**
	 * Return a UIkit icon
	 *
	 * @param {string} icon The UIkit icon to return.
	 * @return {string}
	 *
	 */
	function ukIcon(icon) {

		if(icon === void 0) return;
		var options = $uk.isString(icon) ? {icon: icon.replace('uk-', '')} : icon;
		if(!$uk.isPlainObject(options)) return;

		var a = 'dataUkIcon';
		var attrs = {};
		var tag = 'span';

		// Get and set any other arguments provided
		for(var i = 1; i < arguments.length; i++) {
			var arg = arguments[i];
			if($uk.isNumeric(arg)) {
				options.ratio = $uk.toNumber(arg);
			} else if($uk.isString(arg)) {
				if($uk.startsWith($uk.hyphenate(arg), 'data-uk')) {
					a = arg;
				} else {
					tag = arg;
				}
			} else if($uk.isArray(arg)) {
				attrs.class = arg;
			} else if($uk.isPlainObject(arg)) {
				attrs = $uk.assign(attrs, arg);
			}
		}

		attrs[a] = Object.keys(options).length ? options : true;

		return attr(attrs, tag, true);
	}

	/**
	 * Generate a UIkit notification
	 *
	 * @param {(Object | string)} options The UIkit Notification options.
	 *
	 */
	function ukNotification(options) {

		if(options === void 0) return;
		if($uk.isString(options)) options = {message: options};
		if(!$uk.isPlainObject(options)) return;

		// Get and set any other arguments provided
		for(var i = 1; i < arguments.length; i++) {
			var arg = arguments[i];
			if($uk.isNumeric(arg)) {
				options.timeout = $uk.toNumber(arg);
			} else if($uk.isString(arg)) {
				if(arg.includes('-')) {
					options.pos = arg;
				} else {
					options.status = arg;
				}
			} else if($uk.isPlainObject(arg)) {
				options = $uk.assign(arg, options);
			}
		}

		if(!$uk.isUndefined(options.message)) {
			UIkit.notification($uk.assign({}, NB.options.ukNotification, options));
		}
	}

	/**
	 * Return a UIkit spinner
	 *
	 * @return {string}
	 *
	 */
	function ukSpinner() {
		var args = [{}, 'dataUkSpinner'];
		for(var i = 0; i < arguments.length; i++) args.push(arguments[i]);
		return ukIcon.apply(null, args);
	}

	/**
	 * Get the UIkit container widths
	 *
	 * @param {Array} [classes] An array of uk-width classes to evaluate.
	 * @param {boolean} [child] Evaluate `uk-child-width` strings?
	 * @return {(Object | Array)}
	 *
	 */
	function ukWidths(classes, child) {

		var widths = {};
		var sizes = ['s', 'm', 'l', 'xl'];
		for(var i = 0; i < sizes.length; i++) {
			widths[sizes[i]] = $uk.toNumber($uk.getCssVar('breakpoint-' + sizes[i]).replace('px', ''));
		}

		if(classes === void 0) return widths;
		if(child === void 0) child = true;

		var search = 'uk-' + (child ? 'child-' : '') + 'width-1-';

		var sizes = [];
		for(var i = 0; i < classes.length; i++) {
			var cls = classes[i];
			if(cls.indexOf(search) !== -1) {
				var size = cls.indexOf('@') !== -1 ? cls.split('@')[1] : 0;
				var width = 100 / parseInt(cls.replace(search, ''));
				sizes.push(
					(size && (size in widths) ? '(min-width: ' + widths[size] + 'px) ' : '') +
					(width.toFixed(2) + 'vw')
				);
			}
		}

		return sizes;
	}

	/**
	 * Wrap a string, or strings, in an HTML tag
	 *
	 * @param {(string | Array)} str The string(s) to be wrapped.
	 * @param {(string | Array | Object)} wrapper The html tag(s) or tag attributes.
	 * @param {string} [tag] An optional tag, used if wrapper is an array/object.
	 * @return {string}
	 *
	 */
	function wrap(str, wrapper, tag) {

		profilerStart('nb.wrap');

		// If no wrapper is specified, return the string
		if((wrapper === void 0 || !wrapper) && tag === void 0) return str;

		// If the wrap is an array, either:
		// Render as attributes if associative and a tag is specified;
		// Render as a <div> with class attribute if sequential
		if($uk.isArray(wrapper) || $uk.isPlainObject(wrapper)) wrapper = attr(wrapper, tag);

		// If the wrap begins with a UIkit 'uk-' or NB 'nb-' class,
		// the wrap becomes a <div> with class attribute
		if($uk.isString(wrapper) && ($uk.startsWith(wrapper, 'uk-') || $uk.startsWith(wrapper, 'nb-'))) {
			wrapper = '<div class="' + wrapper + '">';
		}

		// Make sure the wrap is an html tag
		wrapper = makeTag(wrapper);

		// If the string is an array, implode by the wrapper tag
		if($uk.isArray(str)) {
			// Implode by joined wrap
			var e = wrapper.split('>')[0].replace('<', '');
			str = str.join('</' + e.split(' ')[0] + '><' + e + '>');
		}

		// Split the wrap for wrapping the string
		var parts;
		if($uk.includes(wrapper, '></') && !(/=['|\"][^']+(><\/)[^']+['|\"]/.test(wrapper))) {
			parts = wrapper.split('></');
			wrapper = parts[0] + '>' + str + '</' + parts.splice(1).join('></');
		} else {
			parts = wrapper.split('>', 2);
			wrapper = parts.length == 2 ?
				wrapper + str + '</' + (parts[0].split(' ')[0]).replace(/</gi, '') + '>' :
				str;
		}

		profilerStop('nb.wrap');

		return wrapper;
	}

	/**
	 * Polyfill for Element.closest();
	 *
	 */
	if(!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	}

	if(!Element.prototype.closest) {
		Element.prototype.closest = function(s) {
			var el = this;
			do {
				if (el.matches(s)) return el;
				el = el.parentElement || el.parentNode;
			} while (el !== null && el.nodeType === 1);
			return null;
		};
	}

	/**
	 * Polyfill for FormData.entries();
	 *
	 */
	var formDataEntries = function(form) {

		if(typeof FormData === 'function' && 'entries' in FormData.prototype) {

			return Array.from(new FormData(form).entries());

		} else {

			var entries = [];
			var elements = form.elements;

			for(var i = 0; i < elements.length; i++) {

				var el = elements[i];
				var tagName = el.tagName.toUpperCase();

				if(tagName === 'SELECT' || tagName === 'TEXTAREA' || tagName === 'INPUT') {

					var type = el.type;
					var name = el.name;

					if(
						name &&
						!el.disabled &&
						type !== 'submit' &&
						type !== 'reset' &&
						type !== 'button' &&
						((type !== 'radio' && type !== 'checkbox') || el.checked)
					) {
						if(tagName === 'SELECT') {
							var options = el.getElementsByTagName('option')
							for(var j = 0; j < options.length; j++) {
								var option = options[j];
								if(option.selected) entries.push([name, option.value])
							}
						} else if(type === 'file') {
							entries.push([name, '']);
						} else {
							entries.push([name, el.value]);
						}
					}
				}
			}

			return entries;
		}
	};

	/**
	 * Convert an object to FormData for sending.
	 *
	 * @param {Object} data The object to convert.
	 * @return {FormData}
	 *
	 */
	var objectToFormData = function(data, form, namespace) {

		if(!$uk.isPlainObject(data)) return new FormData(data);

		var formData = form || new FormData();
		for(var key in data) {
			if($uk.hasOwn(data, key)) {
				if($uk.isPlainObject(data[key])) {
					objectToFormData(data[key], formData, key);
				} else {
					formData.append((namespace ? namespace + '[' + key + ']' : key), data[key]);
				}
			}
		}

		return formData;
	}

	/**
	 * Obfuscate
	 *
	 */
	var Obfuscate = {

		args: 'text',

		props: ['text'],

		beforeConnect: function() {

			profilerStart('nbObfuscate.beforeConnect');

			var value = base64_decode(this.text);
			var text = value;

			if($uk.isPlainObject(value)) {
				text = value.text;
				for(var key in value) {
					if($uk.hasOwn(value, key)) {
						if(key !== 'text') {
							if(key == 'href' && !text) text = value[key];
							$uk.attr(this.$el, key, attrValue(value[key]));
						}
					}
				}
			}

			this.$el.innerHTML = text;
			$uk.removeAttr(this.$el, 'data-' + this.$name);

			profilerStop('nbObfuscate.beforeConnect');
		}
	};

	/**
	 * Form
	 *
	 */
	var Form = {

		args: 'msgConfirm',

		props: ['msgConfirm'],

		data: {
			button: null,
			buttonText: '',
			captcha: null,
			response: '',
			scroller: null,
			status: 0
		},

		beforeConnect: function() {

			profilerStart('nbForm.beforeConnect');

			var form = this.$el;

			// Update the form's CSRF post token
			var inputCSRF = $uk.$('input[type=hidden]._post_token', form);
			if(inputCSRF) {
				graphql('{CSRF {tokenName tokenValue}}').then(function(result) {
					if(result.status == 200) {
						var CSRF = result.response.CSRF;
						$uk.attr(inputCSRF, 'name', CSRF.tokenName);
						$uk.attr(inputCSRF, 'value', CSRF.tokenValue);
					}
				}, $uk.noop);
			}

			// Handle Inputfield conditionals
			this.conditionals('show');
			this.conditionals('required');

			// Add the scroller div
			this.scroller = $uk.$(attr({hidden: true}, 'div', true));
			$uk.append(form, this.scroller);

			profilerStop('nbForm.beforeConnect');
		},

		connected: function() {
			profilerStart('nbForm.connected');
			var form = this.$el;
			setTimeout(function() {
				$uk.trigger(form, 'onload', this);
				profilerStop('nbForm.connected');
			}, duration);
		},

		events: {

			submit: function(e) {

				profilerStart('nbForm.events.submit');

				e.preventDefault();
				e.stopPropagation();

				var form = this.$el;
				var errors = [];

				// Validate

				var previous = $$('nb-form-errors', form);
				if(previous) $uk.remove(previous);

				$uk.$$('input[required], select[required], textarea[required]', form).forEach(function(input) {
					$uk.attr(input, 'aria-invalid', false);
					$uk.remove($('nb-form-error', input.closest('.nb-form-content')));
				});

				$uk.$$('input[required], select[required], textarea[required]', form).forEach(function(input) {

					if(!input.validity.valid) {

						$uk.attr(input, 'aria-invalid', true);

						var error = $uk.attr(input, 'title'); if(!error) error = input.validationMessage;
						var id = input.id;
						var label = id ? $uk.$('label[for=' + id + ']', form) : null;

						error = punctuateString(error);
						errors.push(link(
							'#' + (id ? id : form.id),
							(label ? label.innerHTML + ': ' : '') + error,
							{
								class: 'uk-link-reset',
								dataUkScroll: {
									duration: NB.options.speed,
									offset: NB.options.offset
								}
							}
						));

						var e = wrap(ukIcon('warning', 0.75) + ' ' + error, 'uk-text-danger nb-form-error');
						var alert = $uk.$('[role=alert]', input.closest('.nb-form-content'));

						if(alert) {
							$uk.append(alert, e);
						} else {
							$uk.before(input, e);
						}
					}
				});

				if(errors.length) {

					$uk.trigger(form, 'invalid', this);

					this.reset();

					// Display errors
					$uk.before(
						$('uk-grid', form),
						ukAlert(wrap(wrap(errors, 'li'), 'ul'), 'danger', ['nb-form-errors'])
					);

					// Scroll to top of form
					UIkit.scroll(this.scroller, {
						duration: NB.options.speed,
						offset: NB.options.offset
					}).scrollTo(form);

					$uk.on('.nb-form-errors a[href^="#"]', 'click', function(e) {
						$uk.$($uk.attr(this, 'href')).focus();
					});

					return false;

				} else {

					// Set variables for later use
					this.button = $uk.$('button[type=submit]', form);

					// If a confirmation is required
					if(this.msgConfirm) {

						var this$1 = this;
						UIkit.modal.confirm(this.msgConfirm).then(function() {
							// Confirmed, send the data
							this$1.send();
						}, function() {
							// Not confirmed return
							return false;
						});

					} else {

						// No confirmation required, send the data
						this.send();
					}
				}

				profilerStop('nbForm.events.submit');
			}
		},

		methods: {

			complete: function() {

				// Handle form completion

				var form = this.$el;
				var message = this.response;

				$uk.trigger(form, 'complete', this);

				if($uk.isPlainObject(message)) {

					var timeout = 0;

					if(message.notification) {
						ukNotification(message.notification);
						timeout = 'timeout' in message.notification ? message.notification.timeout : duration;
					}

					if('callback' in message) {

						var keys = message.callback;
						var args = null;

						if($uk.isArray(keys)) {
							keys = message.callback[0];
							args = message.callback[1];
						}

						keys = keys.split('.');
						if($uk.isUndefined(args)) args = null;

						var callback = window[keys[0]];
						for(var i = 1; i < keys.length; i++) {
							if(keys[i] in callback) {
								callback = callback[keys[i]];
							}
						}

						callback.apply(this, args);
						timeout = duration;
						if(message.callback[2] === true) return;
					}

					if('redirect' in message) {
						if(message.redirect) {
							setTimeout(function() {
								if($uk.isString(message.redirect)) {
									window.location.href = message.redirect;
								} else {
									window.location.reload();
								}
							}, timeout);
						}
						this.reset();
						return;
					}

					message = message.message;
				}

				// Remove button / captcha
				$uk.remove(this.button);
				if(this.captcha) $uk.remove(this.captcha);

				// Disable inputs
				$uk.$$('input, select, textarea', form).forEach(function(input) {
					$uk.attr(input, 'disabled', true);
				});

				if(message) {

					var fieldsWrap = $('uk-grid', form);

					// Output message
					$uk.before((fieldsWrap ? fieldsWrap : form), ukAlert(message, this.status));

					// Scroll to top of form
					UIkit.scroll(this.scroller, {
						duration: NB.options.speed,
						offset: NB.options.offset
					}).scrollTo(form);
				}
			},

			conditional: function(value1, operator, value2) {

				// Evaluate Inputfield conditional

				var match = false;
				switch(operator) {
					case '=':
						match = value1 == value2;
						break;
					case '!=':
						match = value1 != value2;
						break;
					case '>':
						match = value1 > value2;
						break;
					case '<':
						match = value1 < value2;
						break;
					case '>=':
						match = value1 >= value2;
						break;
					case '<=':
						match = value1 <= value2;
						break;
					case '*=':
					case '%=':
						match = $uk.includes(value1, value2);
						break;
				}

				return match;
			},

			conditionals: function(type) {

				// Handle Inputfield conditionals

				var this$1 = this;
				var form = this.$el;
				var inputfields = $uk.$$('[data-' + type + '-if]', form); // Inputfields with if conditions
				if(!inputfields.length) return;

				var conditionals = [];
				var inputs = []; // All inputs to attach the onchange event to
				inputfields.forEach(function(inputfield) {

					var conditional = {
						inputfield: inputfield, // The inputfield with conditions
						inputs: [], // The field names of the inputs used in the conditions
						conditions: [] // The conditions
					};

					// Split conditions and cycle
					var parts = $uk.data(inputfield, type + '-if').match(/(^|,)([^,]+)/g);
					for(var n = 0; n < parts.length; n++) {

						// Match condition
						var match = parts[n].match(/^[,\s]*([_.|a-zA-Z0-9]+)(=|!=|<=|>=|<|>|%=)([^,]+),?$/);
						if(!match) continue;

						// Condition
						var field = match[1];
						var operator = match[2];
						var value = match[3];

						// Fields and values can be multiple
						var fields = $uk.includes(field, '|') ? field.split('|') : [field];
						var values = $uk.includes(value, '|') ? value.split('|') : [value];

						// Remove quotes from values
						for(var fv = 0; fv < values.length; fv++) {
							values[fv] = values[fv].replace(/^('|")|('|")$/g, '');
						}

						// Add to conditional data
						conditional.inputs = conditional.inputs.concat(fields);
						inputs = inputs.concat(fields);
						conditional.conditions.push({
							fields: fields,
							operator: operator,
							values: values,
						});
					}

					conditionals.push(conditional);
				});

				$uk.on(document, 'UIkit_initialized', function() {

					// Cycle through all the inputs used in conditions and attach the event handler
					for(var i = 0; i < inputs.length; i++) {

						var name = inputs[i];
						var input = $uk.$$('[name=' + name + ']', form);
						if(!input.length) input = $uk.$$('[name="' + name + '[]"]', form);

						if(input.length) {

							// Attach onchange event
							$uk.on(input, 'change', function() {

								for(var n = 0; n < conditionals.length; n++) {

									var conditional = conditionals[n];
									// If this input is not used in this inputfields conditions
									if(!$uk.includes(conditional.inputs, this.name.replace('[]', ''))) continue;

									var matches = 0;
									var required = conditional.conditions.length; // The number of conditions to be met
									for(var c = 0; c < required; c++) {

										var condition = conditional.conditions[c];
										var fields = condition.fields;
										var operator = condition.operator;
										var values = condition.values;

										for(var fn = 0; fn < fields.length; fn++) {

											var name = fields[fn];
											var inputs = $uk.$$('[name=' + name + ']', form);

											if(inputs.length == 1) {
												// Single input
												var input = inputs[0];
												for(var fv = 0; fv < values.length; fv++) {
													var value = values[fv];
													if(input.type == 'checkbox') {
														if(this$1.conditional((input.checked ? input.value : 0), operator, value)) matches++;
													} else if(this$1.conditional(input.value, operator, value)) {
														matches++;
													}
												}
											} else if(inputs.length > 1) {
												// Radio
												var checked = false;
												inputs.forEach(function(input) {
													if(input.checked) {
														checked = true;
														for(var fv = 0; fv < values.length; fv++) {
															if(this$1.conditional(input.value, operator, values[fv])) matches++;
														}
													}
												});
												if(!checked && this$1.conditional('', operator, values[fv])) matches++;
											} else {

												// Select Multiple / Checkboxes
												var inputs = $uk.$$('[name="' + name + '[]"]');
												if(inputs.length) {
													var inputValues = [];
													inputs.forEach(function(input) {
														if(input.type == 'checkbox') {
															if(input.checked) inputValues.push(input.value);
														} else {
															var options = input.options;
															for(var o = 0; o < options.length; o++) {
																var option = options[o];
																if(option.selected) inputValues.push(option.value);
															}
														}
													});
													if(!inputValues.length) inputValues.push('');
													var matchesMultiple = 0;
													for(var iv = 0; iv < inputValues.length; iv++) {
														for(var fv = 0; fv < values.length; fv++) {
															if(this$1.conditional(inputValues[iv], operator, values[fv])) {
																matchesMultiple++;
															}
														}
													}
													if(matchesMultiple) matches++;
												}
											}
										}
									}

									var inputfield = conditional.inputfield;
									var matched = matches >= required;
									switch(type) {
										case 'show':
											inputfield.style.display = matched ? '' : 'none';
											break;
										case 'required':
											$uk[(matched ? 'add' : 'remove') + 'Class'](inputfield, 'nb-form-required');
											$uk.$$('input, select, textarea', inputfield).forEach(function(input) {
												if(input.offsetWidth > 0 || input.offsetHeight > 0) {
													input.required = matches;
												}
											});
											break;
									}
								}
							});

							// Trigger change event when UIkit is initialised
							$uk.trigger(input, 'change');
						}
					}
				});
			},

			error: function(status, errors) {

				// Handle form error

				this.status = status;
				this.response = errors;

				$uk.trigger(this.$el, 'error', this);

				if($uk.includes([401, 412, 500], status)) {
					// Unauthorised || Precondition failed || Server Error
					this.reset();
					UIkit.modal.alert(ukAlert(errors, 'danger'));
				} else {
					this.complete();
				}
			},

			reset: function() {
				// Reset the form
				if(this.button) $uk.html(this.button, this.buttonText);
				if(this.captcha) grecaptcha.reset();
			},

			send: function() {

				// Send form data

				profilerStart('nbForm.send');

				var form = this.$el;
				var method = $uk.attr(form, 'method');

				// Set the button to loading
				this.buttonText = $uk.html(this.button);
				$uk.html(this.button, ukSpinner(0.467));

				// Captcha
				this.captcha = $('g-recaptcha', form);

				$uk.trigger(form, 'beforeSend', this);

				// Send the data
				var this$1 = this;
				ajax(form.action, {
					data: new FormData(form),
					method: (method ? method : 'POST')
				}).then(
					function(result) {
						this$1.status = result.status;
						this$1.response = result.response;
						if(result.response) {
							this$1.complete();
						} else {
							this$1.error(result.status, 'Error');
						}
						profilerStop('nbForm.send');
					},
					function(result) {
						this$1.error(result.status, result.response);
						profilerStop('nbForm.send');
					}
				);
			}
		}
	};

	/**
	 * JSON
	 *
	 */
	var Json = {

		args: 'renderData',

		props: {
			config: Object,
			clsMore: String,
			clsMoreButton: String,
			error: String,
			form: String,
			loadMore: String,
			message: String,
			noResults: String,
			query: String,
			render: String,
			renderData: String,
			variables: Object
		},

		data: {
			count: 0,
			config: {},
			clsMore: 'uk-text-center uk-margin-large-top',
			clsMoreButton: 'uk-button-primary',
			error: 'Error',
			errors: [],
			form: null,
			init: 0,
			initQuery: false,
			items: [],
			loadMore: 'More',
			message: '',
			noResults: '',
			query: '',
			remaining: 0,
			render: 'renderItems',
			renderData: '',
			response: {},
			selectors: '',
			start: 0,
			status: 0,
			total: 0,
			variables: {}
		},

		beforeConnect: function() {

			profilerStart('nbJson.beforeConnect');

			// Set init values
			var init = ['start', 'selectors'];
			for(var i = 0; i < init.length; i++) {
				var key = init[i];
				if(this.variables[key]) this[key] = this.variables[key];
			}
			this.init = this.start;

			// Default error
			this.errors = [this.error];

			// Make sure classes are present
			if(!$uk.includes(this.clsMore, 'nb-json-more')) {
				this.clsMore += ' nb-json-more';
			}
			if($uk.includes(this.clsMoreButton, 'uk-button-') && !$uk.includes(this.clsMoreButton, 'uk-button ')) {
				this.clsMoreButton += ' uk-button';
			}

			var this$1 = this;
			if(this.form && $uk.isUndefined(this._connected)) {

				// Form filters
				$uk.on(this.form, 'submit reset', function(e) {

					var selectors = [];
					if(e.type == 'submit') {

						e.preventDefault();
						e.stopPropagation();

						var formData = formDataEntries(this);
						for(var i = 0; i < formData.length; i++) {
							var value = formData[i][1];
							if(value) {
								var name = formData[i][0];
								var operator = '=';
								var selectorData = data($uk.$('[name=' + name + ']', this), 'json-selectors');
								if($uk.isPlainObject(selectorData)) {
									var selectorValues = selectorData.values[value];
									for(var selectorKey in selectorData.selectors) {
										if($uk.hasOwn(selectorData.selectors, selectorKey)) {
											selectors.push(selectorKey + selectorValues[selectorData.selectors[selectorKey]]);
										}
									}
								} else {
									if($uk.includes(name, operator)) operator = '';
									selectors.push(name + operator + value);
								}
							}
						}
					}

					this$1.get(selectors.join(','));
				});
			}

			// Button Filters
			var filters = $$('json-filter', '[data]');
			if(filters.length)  {
				$uk.on(filters, 'click', function(e) {
					e.preventDefault();
					var selectors = $uk.data(this, 'json-filter');
					$uk.removeClass(filters, 'uk-active');
					if(selectors) $uk.addClass(this, 'uk-active');
					this$1.get(selectors);
				});
			}

			profilerStop('nbJson.beforeConnect');
		},

		connected: function() {

			profilerStart('nbJson.connected');

			var el = this.$el;
			var this$1 = this;

			$uk.on(el, 'error', function() {
				$uk.html(el, ukAlert(this$1.errors, this$1.status));
			});

			if(this.renderData) {

				this.response = base64_decode(this.renderData);
				this.parse();

				if(this.count) {
					$uk.html(el, this.renderItems());
					$uk.trigger(el, 'render', this);
					$uk.trigger(el, 'complete', this);
				}

				// Remove attribute and destroy
				$uk.removeAttr(el, 'data-' + this.$name);
				this.$destroy();

			} else {

				var values = 0;
				if(this.form) {
					// Trigger submit if values present
					var inputs = $uk.$$('input, select, textarea', $uk.$(this.form));
					for(var i = 0; i < inputs.length; i++) {
						if(inputs[i].value) {
							values++;
						}
					}
				}

				if(values) {
					$uk.trigger(this$1.form, 'submit');
				} else {
					this.request();
				}
			}

			profilerStop('nbJson.connected');
		},

		events: [
			{
				name: 'click',

				delegate: function() {
					return '.nb-json-more button';
				},

				handler: function(e) {
					this.request();
				}
			}
		],

		methods: {

			get: function(selectors) {

				// Perform a new request with selectors

				var selectors = [selectors];
				if(this.selectors) selectors.push(this.selectors);

				this.initQuery = false;
				this.start = this.init;
				this.total = 0;
				this.variables.selectors = selectors.join(',');
				this.variables.start = this.start;

				$uk.html(this.$el, '');
				this.request();
			},

			parse: function() {

				// Parse a successful GraphQL JSON response

				for(var key in this.response) {
					if($uk.hasOwn(this.response, key)) {
						var data = this.response[key];
						if($uk.isArray(data)) {
							this.config.query = key;
							this.items = data;
							this.count = data.length;
						} else if(key == 'getTotal') {
							this.total = data;
						}
						// This can only handle a single query + getTotal;
						if(this.count && this.total) break;
					}
				}
			},

			renderItems: function(items) {

				// Render JSON items

				if(items === void 0) items = this.items;
				var render = window[this.render];
				if(!$uk.isFunction(render) || !$uk.isArray(items)) {
					this.status = 500;
					return '';
				}

				return render.call(this, items);
			},

			request: function() {

				// Request JSON data

				profilerStart('nbJson.request');

				var el = this.$el;
				var more = $('nb-json-more', el);

				// Reset counts
				this.count = 0;
				this.remaining = 0;

				// Remove previous errors
				$uk.remove('.uk-alert', el);

				// Create more element/button
				if(!more) {
					more = $uk.$(wrap(
						wrap(this.loadMore, {
							type: 'button',
							class: this.clsMoreButton
						}, 'button'),
						this.clsMore
					));
					$uk.append(el, more);
				}

				more.style.display = '';

				// Set button to loading
				var moreButton = $uk.$('button', more);
				$uk.attr(moreButton, 'disabled', true);
				$uk.html(moreButton, $uk.html(moreButton).replace(this.loadMore, ukSpinner(0.467)));

				// Set start
				this.variables.start = this.start;

				if(!this.initQuery) {
					this.initQuery = true;
					$uk.trigger(el, 'initQuery', this);
				}

				// Request
				var this$1 = this;
				graphql(this.query, this.variables).then(
					function(result) {

						this$1.status = result.status;
						this$1.response = result.response;

						var response = this$1.response;
						if(response) {

							// Set button back to active
							$uk.removeAttr(moreButton, 'disabled');
							var spinner = $('uk-spinner', moreButton);
							if(spinner) {
								$uk.before(spinner, this$1.loadMore)
								$uk.remove(spinner);
							}

							// Parse the data
							this$1.parse();

							// Get the number of results remaining
							this$1.remaining = this$1.total ? (this$1.total - this$1.start - this$1.count) : -1;

							// Display a message
							if(this$1.message) {

								var message = $('nb-json-message', el);
								if(!message) {
									message = $uk.$(wrap('', 'nb-json-message uk-margin-top uk-margin-bottom'));
									$uk.prepend(el, message);
								}

								var msg = this$1.message
									.replace('{count}', (this$1.count + this$1.start - this$1.init))
									.replace('{total}', (this$1.total - this$1.init));

								$uk.html(
									message,
									('jsonMessage' in window ?
										jsonMessage(msg) : ukAlert(msg, 'primary'))
								);
							}

							// Output
							if(this$1.count) {
								$uk.before(more, this$1.renderItems());
								$uk.trigger(el, 'render', this$1);
							} else {
								this$1.errors = [this$1.noResults];
								this$1.status = 404;
								$uk.trigger(el, 'error', this$1);
							}

							// Process
							if(this$1.remaining <= 0 || !this$1.count || !this$1.loadMore) {
								// If no/all results have been found, hide button
								more.style.display = 'none';
							} else {
								// Set the new start value
								this$1.start = this$1.start + this$1.count;
							}

							$uk.trigger(el, 'complete', this$1);

						} else {
							$uk.trigger(el, 'error', this$1);
						}

						profilerStop('nbJson.request');
					},
					function(result) {
						this$1.status = result.status;
						this$1.errors = result.response;
						$uk.trigger(el, 'error', this$1);
						profilerStop('nbJson.request');
					}
				);
			}
		}
	};

	/**
	 * Nav
	 *
	 */
	var Nav = {

		args: 'breakpoint',

		props: {
			arrow: String,
			back: String,
			breakpoint: Number,
			toggle: String
		},

		data: {
			arrow: 'chevron',
			active: undefined,
			back: 'Back',
			breakpoint: 960,
			clsBack: 'back',
			clsDesktop: 'desktop',
			clsDrop: 'uk-navbar-dropdown',
			clsHidden: 'uk-hidden',
			navbar: undefined,
			ns: undefined,
			toggle: '.uk-navbar-toggle',
			ukNavbar: {},
			ukNavbarToggle: {}
		},

		beforeConnect: function() {

			profilerStart('nbNav.beforeConnect');

			this.ns = getClassName(this);

			// Set up common classes
			this.clsBack = this.ns + '-' + this.clsBack;
			this.clsDesktop = this.ns + '-' + this.clsDesktop;

			// Get the uk-navbar element
			this.navbar = this.$el.closest('[data-uk-navbar]');
			if(!this.navbar) throw new Error('The UIkit Navbar component could not be found.');

			// Get the uk-navbar options
			this.ukNavbar = $uk.parseOptions($uk.data(this.navbar, 'uk-navbar'));

			// Get the toggle and its options
			this.ukNavbarToggle = {};
			if(this.toggle) {
				this.toggle = $(this.toggle);
				if(this.toggle) {
					this.ukNavbarToggle = $uk.parseOptions($uk.data(this.toggle, 'uk-toggle'));
				}
			}

			profilerStop('nbNav.beforeConnect');
		},

		connected: function() {

			profilerStart('nbNav.connected');

			var this$1 = this;
			var nav = this.$el.parentElement;
			var clsNavOpen = this.ns + '-open';
			var selDrop = '.' + this.clsDrop;

			// Add desktop class
			$uk.addClass(nav, this.clsDesktop);

			// Init dropdowns
			this.dropdowns();

			// Check the breakpoint
			this.checkBreakpoint();

			// Add nb-nav class
			$uk.addClass(nav, this.ns);

			// Get the active navigation item
			var a = $('.uk-active > a[href="' + window.location.pathname + '"]');
			this.active = a ? a.closest(selDrop) : null;

			// Assign the active screen when opened
			$$('.uk-parent > a').forEach(function(item) {
				$uk.on(item, 'click', function(e) {
					this$1.active = e.target.nextSibling;
				});
			});

			// Assign the active screen when closed
			$$(this.clsBack).forEach(function(item) {
				$uk.on(item, 'click', function(e) {
					var parent = e.target.closest(selDrop);
					this$1.active = null;
					if(parent) {
						parent = parent.parentElement;
						var screen = parent.closest('div');
						if(screen) $uk.trigger(screen, 'show');
						this$1.active = parent.closest(selDrop);
					}
				});
			});

			// Open the active screen when the mobile navigation is opened
			$uk.on(nav, 'beforeshow', function(e) {
				if(!isDesktop && e.target == nav) {
					$uk.addClass($uk.$('body'), clsNavOpen);
					if(this$1.active) {
						var active = this$1.active;
						var parents = [];
						do {
							if(active) parents.push(active);
							active = active.parentElement;
							active = active ? active.closest(selDrop) : null;
						} while (active);
						parents.reverse().forEach(function(item) {
							item[UIkit.data].drop.show();
						});
					}
				}
			});

			$uk.on(nav, 'hide', function(e) {
				$uk.removeClass($uk.$('body'), clsNavOpen);
			});

			// Add arrows
			$$('uk-parent', this.$el).forEach(function(li) {
				var a = $uk.$('a', li);
				if(a) $uk.append(a, this$1.arrow('right'));
			});

			// Check breakpoint when the window is resized
			$uk.on(window, 'resize', $nb.debounce(function() {
				this$1.checkBreakpoint();
			}, duration));

			profilerStop('nbNav.connected');
		},

		events: [
			{
				name: 'switch',

				handler: function(e) {

					profilerStart('nbNav.events.switch');

					var el = this.$el;
					var navbar = this.navbar;
					var target = el.parentElement;
					var toggle = this.toggle;
					var drops = $$('uk-drop', '[data]', el);
					var clsDesktop = this.clsDesktop;
					var clsMobile = this.ns + '-mobile';
					var clsTitle = this.ns + '-title';
					var clsBack = this.clsBack;
					var clsDropNav = 'uk-navbar-dropdown-nav';
					var clsHidden = this.clsHidden;

					// Get the toggle target
					if(toggle) {
						var toggleTarget = $uk.attr(toggle, 'href');
						if(!toggleTarget || toggleTarget == '#') {
							toggleTarget = $nb.data(toggle, 'uk-toggle').target;
						}
						if(toggleTarget) target = $uk.$(toggleTarget);
					}

					if(isDesktop) {

						// Desktop
						if(!$uk.hasClass(target, clsDesktop)) {

							// Set classes
							$uk.removeClass(target, clsMobile);
							$uk.addClass(target, clsDesktop);

							// Show Nav
							$uk.removeAttr(target, 'hidden', true);

							// Show uk-drop elements
							if(drops.length) $uk.removeAttr(drops, 'hidden');

							// Hide toggle
							if(toggle) $uk.attr(toggle, 'hidden');

							// Re-init navbar to set dropdown mode
							if(navbar) {
								UIkit.navbar(navbar).$destroy();
								UIkit.navbar(navbar, this.ukNavbar);
							}

							// Hide toggle
							$uk.addClass(toggle, clsHidden);

							// Remove Nav title and back button
							$$(clsDropNav, el).forEach(function(item) {
								$uk.remove($(clsBack));
								$uk.remove($(clsTitle));
							});
						}

					} else if(!$uk.hasClass(target, clsMobile)) {

						// Mobile/Tablet

						// Set classes
						$uk.removeClass(target, clsDesktop);
						$uk.addClass(target, clsMobile);

						// Hide Nav
						$uk.attr(target, 'hidden', true);

						// Hide uk-drop elements
						if(drops.length) $uk.attr(drops, 'hidden', true);

						// Show toggle
						if(toggle) $uk.removeAttr(toggle, 'hidden');

						// Re-init navbar to set dropdown mode
						if(navbar) {
							var ukNavbar = this.ukNavbar;
							UIkit.navbar(navbar).$destroy();
							ukNavbar.mode = 'click';
							ukNavbar.animation = this.ukNavbarToggle.animation;
							UIkit.navbar(navbar, ukNavbar);
						}

						// Show toggle
						$uk.removeClass(toggle, clsHidden);

						// Add title and back button
						var this$1 = this;
						var selDrop = '.' + this.clsDrop;
						$$(clsDropNav, el).forEach(function(item) {
							var a = getPreviousSibling(item.closest(selDrop), 'a');
							$uk.prepend(item, wrap(
								[
									link(
										$uk.attr(a, 'href'),
										(a.innerText || a.textContent),
										clsTitle
									),
									link(
										{
											class: clsBack,
											dataUkToggle: {
												animation: this$1.ukNavbarToggle.animation,
												cls: 'uk-open',
												target: '#' + item.closest(selDrop).id
											}
										},
										this$1.arrow('left') + this$1.back
									),
								],
								'li'
							));
						});
					}

					profilerStop('nbNav.events.switch');
				}
			}
		],

		methods: {

			arrow: function(dir) {
				// Render a navigation arrow
				if(dir === void 0) dir = 'right';
				return this.arrow ? (isTag(this.arrow) ? this.arrow : ukIcon(this.arrow + '-' + dir)) : '';
			},

			checkBreakpoint: function() {

				// Check the navigation breakpoint

				var isDesktopInit = isDesktop;
				var isDesktopWidth = window.innerWidth > this.breakpoint;

				if(isDesktop && isDesktopWidth) {

					// Check if nav items are wrapped/overflowed
					var test;
					$uk.$$('> li > a', this.$el).forEach(function(a) {

						test = document.createElement('div');
						test.style.position = 'absolute';
						test.style.left = '-99in';
						test.style.whiteSpace = 'nowrap';
						test.style.fontFamily = window.getComputedStyle(a, null).getPropertyValue('font-family');
						test.style.fontSize = window.getComputedStyle(a, null).getPropertyValue('font-size');
						test.style.paddingLeft = window.getComputedStyle(a, null).getPropertyValue('padding-left');
						test.style.paddingRight = window.getComputedStyle(a, null).getPropertyValue('padding-right');
						test.innerHTML = a.textContent;

						document.body.appendChild(test);
						var testWidth = test.clientWidth;
						document.body.removeChild(test);

						if(a.offsetWidth && a.offsetWidth < testWidth) {
							isDesktop = false;
						}
					});

					if(!isDesktop) {
						this.breakpoint = window.innerWidth;
					}

				} else {

					isDesktop = isDesktopWidth;
				}

				if(isDesktop !== isDesktopInit) {
					$uk.trigger(this.$el, 'switch');
				}
			},

			dropdowns: function(context) {

				// Initialise the navigation dropdowns

				if(context === void 0) context = this.$el;

				var this$1 = this;
				$uk.$$('> li > ul, > li > div', context).forEach(function(el) {

					// Get the id of the dropdown
					var id = [];
					if(this$1.$el.id) {
						id.push(this$1.$el.id)
					} else if(this$1.$el.parentElement.id) {
						id.push(this$1.$el.parentElement.id)
					}
					id.push(this$1.ns);

					if($uk.hasAttr(el, 'id')) {
						// Use the existing id
						id.push($uk.attr(el, 'id'));
					} else {
						// Infer
						var related = el.previousElementSibling
						if(!related) related = $uk.$('a', el.closest('.uk-parent'));
						var href = $uk.attr(related, 'href');
						if(href && href !== '#') {
							if(href.substr(0, 1) == '/') href = href.slice(1);
							id.push(href.replace(/\//g, '-'));
						} else {
							id.push($uk.hyphenate(related.textContent.replace(/\s/g, '')));
						}
					}

					// Wrap with the dropdown div
					$uk.wrapAll(el, $nb.attr({id: id.join('_'), class: this$1.clsDrop}, 'div', true));

					// Add the dropdown class
					$uk.addClass(el, 'uk-navbar-dropdown-nav');

					// Recurse
					this$1.dropdowns(el);
				});
			}
		}
	};

	/**
	 * Table
	 *
	 */
	var Table = {

		args: 'cls',

		props: {
			active: Number,
			cls: String,
			clsActive: String,
			desc: Boolean,
			sort: Object,
			usDate: Boolean,
		},

		data: {
			active: -1,
			cls: '',
			clsActive: 'uk-active',
			clsSorter: 'nb-table-sortable',
			desc: false,
			evaluate: 20,
			headers: [],
			sort: {},
			usDate: false
		},

		beforeConnect: function() {

			profilerStart('nbTable.beforeConnect');

			// Table requires a thead element to enable sorting
			var thead = $uk.$$('> thead tr', this.$el);
			if(!thead.length || $uk.isIE) this.sort = false;

			// Add UIkit/NB table classes
			var cls = this.cls ? this.cls.split(' ') : [];
			if(!cls.length || $uk.includes(this.cls, 'uk-table-')) {
				cls.push('uk-table');
			}
			var name = getClassName(this);
			cls.push(name);
			if(this.sort) cls.push(name + '-sort');
			$uk.addClass(this.$el, cls.join(' '));

			// Make sure the table is wrapped with .uk-overflow-auto
			if(!$uk.hasClass(this.$el.parentElement, 'uk-overflow-auto')) {
				$uk.wrapAll(this.$el, '<div class="uk-overflow-auto">');
			}

			// Map the table for sorting
			if(this.sort) {

				if(!$uk.isPlainObject(this.sort)) this.sort = {};

				var th = $uk.$$('> th', thead[thead.length - 1]);
				for(var i = 0; i < th.length; i++) {
					this.headers.push({$el: th[i], sort: false});
				}

				var rows = $uk.$$('> tbody > tr', this.$el);
				var evaluate = rows.length;
				if(evaluate > this.evaluate) {
					var len = evaluate.toString().length;
					this.evaluate = this.evaluate * len;
					evaluate = Math.round(evaluate / len);
					if(evaluate > this.evaluate) evaluate = this.evaluate;
				}

				for(var i = 0; i < this.headers.length; i++) {
					var sort = i in this.sort ? this.sort[i] : 0;
					if(sort !== false) {
						if($uk.isFunction(sort)) {
							this.headers[i].sort = sort;
						} else if($uk.isString(sort)) {
							var parser = [
								'string',
								'number',
								'currency',
								'percent',
								'date',
							].indexOf(sort);
							if(parser > 0) {
								this.headers[i].sort = parser;
							} else if(sort in window) {
								this.headers[i].sort = window[sort];
							}
						} else {
							for(var j = 0; j < evaluate; j++) {
								var value = $uk.$$('> td', rows[j])[i].textContent;
								var valueNumber = value.replace(/(,|\.|%)/g, '');
								if($uk.isNumeric(value) || $uk.isNumeric(valueNumber)) {
									// Number, Percent (1/3)
									sort++;
								} else if($uk.isNumeric(valueNumber.substr(1))) {
									// Currency (2)
									sort++; sort++;
								} else if((value.match(/\//g) || []).length == 2 && this.getDate(value)) {
									// Date, corrected (5)
									sort++; sort++; sort++; sort++; sort++;
								} else if(Date.parse(value)) {
									// Date (4)
									sort++; sort++; sort++; sort++;
								}
							}
							this.headers[i].sort = sort ? sort / evaluate : 0;
						}
						$uk.addClass(this.headers[i].$el, this.clsSorter);
					}
				}
			}

			profilerStop('nbTable.beforeConnect');
		},

		connected: function() {
			profilerStart('nbTable.connected');
			// Sort by active column
			if(this.sort && this.active >= 0) {
				var el = this.headers[this.active].$el;
				if(el) $uk.trigger(el, 'click');
			}
			profilerStop('nbTable.connected');
		},

		events: [
			{
				name: 'click',

				delegate: function() {
					return '.' + this.clsSorter;
				},

				handler: function(e) {

					profilerStart('nbTable.events.click');

					if(this.sort) {

						var this$1 = this;
						var table = this.$el;
						var tbody = $uk.$('> tbody', table);
						var rows = $uk.$$('> tr', tbody);
						var th = e.target;
						var cellIndex = th.cellIndex;
						var clsActive = this.clsActive;
						var clsAsc = 'asc';
						var clsDesc = 'desc';
						var desc = this.desc ? !$uk.hasClass(th, clsDesc) || !$uk.attr(th, 'class') : $uk.hasClass(th, clsAsc);

						// Toggle classes
						$uk.removeClass($uk.$$('> thead > tr > th, > tbody > tr > td', table), clsActive);
						$uk.removeClass($uk.$$('> thead > tr > th', table), clsDesc, clsAsc);
						if(desc) {
							$uk.addClass(th, clsDesc);
						} else {
							$uk.addClass(th, clsAsc);
						}

						// Add the active class to the column
						$uk.addClass(th, clsActive);
						rows.forEach(function(row) {
							$uk.addClass($uk.$$('> td', row)[cellIndex], clsActive);
						});

						var sort = this$1.headers[cellIndex].sort;
						rows.sort(function(a, b) {

							a = $uk.$$('td', a)[cellIndex].innerText;
							b = $uk.$$('td', b)[cellIndex].innerText;

							if($uk.isFunction(sort)) {
								return sort(a, b, desc);
							} else {
								if(sort == 2) {
									// Remove currency prefix
									a = a.substr(1);
									b = b.substr(1);
								}
								switch(sort) {
									case 0: // String
										a = a.toLowerCase();
										b = b.toLowerCase();
										break;
									case 1: // Number
									case 2: // Currency
									case 3: // Percent
										a = parseFloat(a.replace(/(,|%)/g, ''));
										b = parseFloat(b.replace(/(,|%)/g, ''));
										break;
									case 5: // Date, format corrected
										a = new Date(this$1.getDate(a)).getTime();
										b = new Date(this$1.getDate(b)).getTime();
										break;
									case 4: // Date
										a = new Date(a).getTime();
										b = new Date(b).getTime();
										break;
								}

								return desc ? (a < b ? 1 : -1) : (a > b ? 1 : -1);
							}
						});

						$uk.html(tbody, rows);
					}

					profilerStop('nbTable.events.click');
				}
			}
		],

		methods: {

			getDate: function(str) {
				// Convert a dd/mm/yyy or mm/dd/yyyy string to a Date compatible string
				if((str.match(/\//g) || []).length == 2) {
					var date = str.split('/');
					var ends = date[2].split(' ');
					if(ends.length) {
						date[2] = ends[0];
						str = [date[this.usDate ? 1 : 2], date[this.usDate ? 2 : 1], date[0]].join('-');
						if(ends.length == 2) str = [str, ends[1]].join('T');
						return Date.parse(str) ? str : '';
					}
				}
				return '';
			}
		}
	}

	/**
	 * Cookie Setting
	 *
	 */
	var CookieSetting = {

		props: {
			name: String,
			off: String,
			on: String,
		},

		data: {
			callbacks: {}
		},

		connected: function() {
			$uk.addClass(this.$el, getClassName(this));
			$uk.append(this.$el, this.renderInput() + this.renderInput(true));
		},

		events: [
			{
				name: 'change',

				delegate: function() {
					return 'input[type="radio"]';
				},

				handler: function(e) {
					var this$1 = this;
					var key = e.target.name;
					cookieConsent(key, e.target.value);
					if(key in this.callbacks) {
						this.callbacks[key].forEach(function(callback) {
							callback.call(this$1, nbCookie.settings[key]);
						});
					}
				}
			}
		],

		methods: {

			renderInput: function(type) {

				// Render a radio input

				var value = type ? 1 : 0;
				return wrap(
					wrap(
						attr({
							type: 'radio',
							name: this.name,
							id: [this.name, value].join('_'),
							class: 'uk-radio',
							value: ('' + value),
							checked: (this.name in nbCookie.settings && nbCookie.settings[this.name] == value)
						}, 'input') +
						wrap(
							this[type ? 'on' : 'off'],
							'span'
						),
						'label'
					),
					'div'
				);
			}
		}
	}

	UIkit.component('nbObfuscate', Obfuscate);
	UIkit.component('nbForm', Form);
	UIkit.component('nbJson', Json);
	UIkit.component('nbNav', Nav);
	UIkit.component('nbTable', Table);
	UIkit.component('nbCookieSetting', CookieSetting);

	/**
	 * API
	 *
	 */
	var NB = function() {};
	var duration = 256;

	// Options
	NB.options = {
		graphql: '/graphql',
		offset: 128,
		duration: duration,
		ukAlert: {
			animation: true,
			duration: duration
		},
		ukNotification: {
			status: 'primary',
			pos: 'top-right',
			timeout: (duration * 16)
		}
	};

	// Utilities
	NB.util = Object.freeze({
		$: $,
		$$: $$,
		ajax: ajax,
		attr: attr,
		attrValue: attrValue,
		base64_decode: base64_decode,
		base64_encode: base64_encode,
		cookieConsent: cookieConsent,
		data: data,
		debounce: debounce,
		formDataEntries: formDataEntries,
		getClassName: getClassName,
		getPreviousSibling: getPreviousSibling,
		getRequestResponse: getRequestResponse,
		graphql: graphql,
		hasStorage: hasStorage,
		img: img,
		imgBg: imgBg,
		isTag: isTag,
		link: link,
		loadAssets: loadAssets,
		loadStyle: loadStyle,
		loadScript: loadScript,
		makeTag: makeTag,
		post: post,
		profilerStart: profilerStart,
		profilerStop: profilerStop,
		punctuateString: punctuateString,
		queryString: queryString,
		setOption: setOption,
		ukAlert: ukAlert,
		ukIcon: ukIcon,
		ukNotification: ukNotification,
		ukSpinner: ukSpinner,
		ukWidths: ukWidths,
		wrap: wrap
	});

	/**
	 * Initialise
	 *
	 */
	function init(NB) {

		profilerStart('nb.init');

		// Cookie Consent Settings
		if($uk.hasAttr($uk.$('html'), 'data-nb-cookie')) {

			// Get the data
			nbCookie = data($uk.$('html'), 'nb-cookie', true);

			if(hasStorage) {

				var set = false;
				var settings = localStorage.getItem('nbCookie');
				if(settings) {
					try {
						// Consent Settings present, use them
						nbCookie.settings = JSON.parse(settings);
						set = true;
					} catch(e) {
						// Could not parse data, need to request again
					}
				}

				if(!set) {

					// Get the form
					ajax(nbCookie.url).then(function(result) {

						if(result.status == 200) {

							var timeout = duration * duration; // 65536

							// Set default settings before the notification closes
							setTimeout(function() {
								cookieConsent(false);
							}, timeout - 256);

							// Display the notification
							UIkit.notification({
								message: nbCookie.message,
								timeout: timeout,
								clsContainer: 'nb-cookie uk-notification'
							});

							// Handle accept all action
							$uk.once($uk.$('.all'), 'click', function() {
								cookieConsent(true);
							});

							// Handle set action, display form in modal
							$uk.once($uk.$('.set'), 'click', function() {
								cookieConsent(false);
								if(window.location.href.split('#')[0] == nbCookie.url) {
									// Already on cookies page, go to form
									window.location.href = nbCookie.id;
								} else {
									UIkit.modal.dialog(
										wrap(
											wrap(result.response.title, 'h2') +
											attr({
												type: 'button',
												class: 'uk-modal-close-default',
												dataUkClose: true
											}, 'button', true),
											'uk-modal-header'
										) +
										wrap(result.response.body, 'uk-modal-body')
									);
								}
							});

						} else {
							// Set all to false
							cookieConsent(false);
						}

					}, function(e) {
						cookieConsent(false);
					});
				}
			} else {
				// Set all to false
				cookieConsent(false);
			}
		}

		$uk.ready(function() {

			// Trigger an event when UIkit is initialised
			var initialized = setInterval(function() {
				if(UIkit._initialized) {
					$uk.trigger(document, 'UIkit_initialized');
					clearInterval(initialized);
				}
			}, duration);

			// Set offset option based on header height
			var header = $uk.$('header');
			if(header) setOption('offset', header.offsetHeight + 32);

			// Make sure external links have the appropriate rel attributes
			var links = $uk.$$('a[target=_blank]');
			if(links) {
				var protect = ['noopener'];
				links.forEach(function(link) {
					var rel = $uk.attr(link, 'rel');
					rel = $uk.isString(rel) ? rel.split(' ') : [];
					for(var i = 0; i < protect.length; i++) if(rel.indexOf(protect[i]) < 0) rel.push(protect[i]);
					$uk.attr(link, 'rel', rel.join(' '));
				});
			}

			profilerStop('nb.init');
		});
	}

	{
		init(NB);
	}

	return NB;

}));

/**
 * UIkit utilities
 *
 * https://github.com/uikit/uikit-site/blob/feature/js-utils/docs/pages/javascript-utilities.md
 *
 */
var $uk = UIkit.util;

/**
 * NB utilities
 *
 */
var $nb = NB.util;
