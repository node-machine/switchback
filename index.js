/**
 * Module dependencies
 */
var _ = require('lodash');
var util = require('util');




/**
 * `switchback`
 *
 * Switching utility which builds and returns a handler which is capable
 * calling one of several callbacks.
 *
 * @param {Object|Function} callback
 *			- a handler object or a standard 1|2-ary node callback.
 * @param {Object} [defaultHandlers]
 *			- '*': supply a special callback for when none of the other handlers match
 *			- a string can be supplied, e.g. {'invalid': 'error'}, to "forward" a handler to another
 *			- otherwise a function should be supplied, e.g. { 'error': res.serverError }
 * @param {Object} [callbackContext]
 *			- optional `this` context for callbacks
 */

module.exports = function switchback( callback, defaultHandlers, callbackContext ) {


	// Default handler + statuses-- can be called as a function.
	var Handler = function( /* err, arg1, arg2, ..., argN */ ) {
		var args = Array.prototype.slice.call(arguments);
		
		var err = args[0];
		if (err) {
			return Handler.error.apply(callbackContext || this, args);
		}
		return Handler.success.apply(callbackContext || this, args.slice(1));
	};



	// If callback is provided as a function, transform it into an object
	// w/ multiple copies of the callback-- one to handle an error, and one
	// to handle a success.
	if ( _.isFunction(callback) ) {
		var _originalCallbackFn = callback;
		callback = {
			success: function () {
				// shift arguments over to make sure the first arg won't be perceived as an `err`
				var args = Array.prototype.slice.call(arguments);
				args.unshift(null);
				_originalCallbackFn.apply(callbackContext || this, args);
			},
			error: function () {
				// ensure a first arg exists (err)-- default to simple `unexpected error`
				var args = Array.prototype.slice.call(arguments);
				if (!args[0]) {
					args[0] = new Error();
				}
				_originalCallbackFn.apply(callbackContext || this, args);
			}
		};
	}
	callback = callback || {};



	// Mix-in custom handlers from callback.
	_.extend(Handler, callback );



	// Supply a handful of default handlers to provide better error messages.
	var unknownCaseHandler = function ( caseName, err ) {
		return function unknownCase ( /* ... */ ) {
			var args = Array.prototype.slice.call(arguments);
			err = (args[0] ? util.inspect(args[0])+'        ' : '') + (err ? '('+(err||'')+')' : '');

			// OLD WAY:
			// 
			// if ( _.isFunction(defaultHandlers) ) {
			// 	return defaultHandlers(err);
			// }
			// 

			// NEW WAY:
			if ( _.isObject(defaultHandlers) && _.isFunction(defaultHandlers['*']) ) {
				return defaultHandlers['*'](err);
			}
			else throw new Error(err);
		};
	};

	// redirect any handler defaults specified as strings
	if (_.isObject(defaultHandlers)) {
		defaultHandlers = _.mapValues(defaultHandlers, function (handler, name) {
			if (_.isFunction(handler)) return handler;

			// Closure which will resolve redirected handler
			return function () {
				var runtimeHandler = handler;
				var runtimeArgs = Array.prototype.slice.call(arguments);
				var runtimeCtx = callbackContext || this;

				// Track previous handler to make usage error messages more useful.
				var prevHandler;

				// No more than 5 "redirects" allowed (prevents never-ending loop)
				var MAX_FORWARDS = 5;
				var numIterations = 0;
				do {
					prevHandler = runtimeHandler;
					runtimeHandler = Handler[runtimeHandler];
					// console.log('redirecting '+name+' to "'+prevHandler +'"-- got ' + runtimeHandler);
					numIterations++;
				}
				while ( _.isString(runtimeHandler) && numIterations <= MAX_FORWARDS);
				
				if (numIterations > MAX_FORWARDS) {
					throw new Error('Default handlers object ('+util.inspect(defaultHandlers)+') has a cyclic redirect.');
				}

				// Redirects to unknown handler
				if (!_.isFunction(runtimeHandler)) {
					runtimeHandler = unknownCaseHandler(runtimeHandler, '`' + name + '` case triggered, but no handler was implemented.');
				}

				// Invoke final runtime function
				runtimeHandler.apply(runtimeCtx, runtimeArgs);
			};
		});
	}

	_.defaults(Handler, defaultHandlers, {
		success: unknownCaseHandler('success', '`success` case triggered, but no handler was implemented.'),
		error: unknownCaseHandler('error', '`error` case triggered, but no handler was implemented.'),
		invalid: unknownCaseHandler('invalid', '`invalid` case triggered, but no handler was implemented.')
	});

	return Handler;
};
