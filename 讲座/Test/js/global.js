// JavaScript Document
jpjs.config({
	basepath: window.CONFIG.HOST + window.CONFIG.COMBOPATH,
	comboHost: window.CONFIG.HOST + '',
	comboPath: window.CONFIG.COMBOPATH,
	normailzeNames: window.VERSION,
	charset: window.CONFIG.CHARSET,
	combos: {
		'@two': 'module.two',
		'@three': [
			'module.three0', 'module.three1'
		],
		'@one': [
			'@three', '@two', 'module.one'
		],
		'@single': 'module.single'
	}
});