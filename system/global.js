exports.initVariable = () => {
	global.cermai = {}
}

exports.setVariable = (options) => {
	if (!cermai) {
		return console.error("Please call initVariable() to use setVariable")
	}

	return cermai[options['key']] = options['value']
}