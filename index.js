if (typeof module === 'object') {
	module.exports = logify;
}

/**
 * Stringify target object.
 *
 * @param {object|bigint|number|string|null} target
 * @param {string}                           [space='\t']
 * @return {string}
 */
function logify (target, space) {
	var margin = '';
	var path = [];
	var seen = new WeakMap();

	if (!space) {
		space = '\t';
	}
	var spaceLength = space.length * -1;

	if (typeof target !== 'object' || target === null) {
		return target;
	}

	function toJSON (o) {
		var currentPath = '@' + path.join('.');
		var firstSeen = seen.get(o);
		if (firstSeen || firstSeen === '') {
			return `"[${currentPath.startsWith(firstSeen) ? 'circular' : 'reference'}: ${firstSeen}]"`;
		}

		firstSeen = currentPath;
		seen.set(o, firstSeen);

		var result = '{';
		margin += space;

		var keys = Object.keys(o);
		var value = null;
		var type = '';
		for (var key of keys) {
			value = o[key];
			type = typeof value;

			if (type === 'function') {
				// result += `${JSON.stringify(value.toString())},`;
				continue;
			}

			result += `\n${margin}"${key}": `;

			if (type === 'undefined') {
				result += `"[undefined]",`;
				continue;
			}

			if (type === 'bigint') {
				result += `"${value.toString()}n",`;
				continue;
			}

			if (type !== 'object' || value === null) {
				result += `${JSON.stringify(value)},`;
				continue;
			}

			path.push(key);
			result += `${toJSON(value)},`;
			path.pop();
		}

		margin = margin.slice(0, spaceLength);
		return result.substring(0, result.length - 1) + `\n${margin}}`;
	}

	return toJSON(target);
}
