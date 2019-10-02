if (typeof module === 'object') {
	module.exports = logify;
}

/**
 * Stringify target object.
 * When empty string is passed as `spacer`, output will not be "prettyfied",
 * so it will look like output from `JSON.stringify(target)`, but with
 * references/circulars/etc... replaced.
 *
 * @param {object|bigint|number|string|null} target
 * @param {string}                           [spacer='\t']
 * @return {string}
 */
function logify (target, spacer) {
	if (typeof target !== 'object' || target === null) {
		return target;
	}

	var margin = '';
	var seen = new WeakMap();

	var marginStep = spacer || (spacer !== '' && '\t') || '';
	if (marginStep) {
		margin = '\n';
	}

	var space = marginStep ? ' ' : '';

	var marginStepLength = marginStep.length * -1;
	var supportBuffer = typeof Buffer !== 'undefined' && typeof Buffer.from === 'function';

	/**
	 * @private
	 * @param {object} o
	 * @param {string} currentPath
	 */
	function toJSON (o, currentPath = '') {
		var firstSeen = seen.get(o);
		if (firstSeen || firstSeen === '') {
			return `"@${(currentPath.startsWith(firstSeen) && '@') || ''}${firstSeen}"`;
		}

		seen.set(o, currentPath);

		var isArray = Array.isArray(o);
		var keys = Object.keys(o);

		if (!keys || keys.length < 1) {
			return isArray ? '[]' : '{}';
		}

		var result = '';
		margin += marginStep;

		var value = null;
		var type = '';
		for (var key of keys) {
			value = o[key];
			type = typeof value;

			if (type === 'function') {
				continue;
			}

			result += isArray ? margin : `${margin}"${key}":${space}`;

			if (value === Infinity) {
				result += '"Infinity",';
				continue;
			}

			if (type === 'undefined') {
				result += '"",';
				continue;
			}

			if (type === 'bigint') {
				result += `"${value.toString()}n",`;
				continue;
			}

			if (type === 'number' && isNaN(value)) {
				result += '"NaN",';
				continue;
			}

			if (type === 'string') {
				result += `"<${JSON.stringify(value).substring(1)},`;
				continue;
			}

			if (type !== 'object' || value === null) {
				result += `${JSON.stringify(value)},`;
				continue;
			}

			if (supportBuffer && value instanceof Buffer) {
				result += `"[${value.toString('hex')}]",`;
				continue;
			}

			result += `${toJSON(value, `${currentPath}${(currentPath && '.') || ''}${key}`)},`;
		}

		margin = margin.slice(0, marginStepLength);
		return (isArray ? '[' : '{')
			+ (result ? result.substring(0, result.length - 1) + margin : '')
			+ (isArray ? ']' : '}');
	}

	return toJSON(target);
}
