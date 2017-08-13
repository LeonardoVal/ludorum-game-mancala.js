/** Gruntfile for [ludorum-game-mancala.js](http://github.com/LeonardoVal/ludorum-game-mancala.js).
*/
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	require('creatartis-grunt').config(grunt, {
		sourceNames: ['__prologue__', 'Mancala', '__epilogue__'],
		deps: [
			{ name: 'creatartis-base', id: 'base',
				path: 'node_modules/creatartis-base/build/creatartis-base.min.js' },
			{ name: 'sermat', id: 'Sermat',
				path: 'node_modules/sermat/build/sermat-umd.js' },
			{ name: 'ludorum', id: 'ludorum',
				path: 'node_modules/ludorum/build/ludorum.min.js' }
		]
	});

	grunt.registerTask('default', ['build']);
};
