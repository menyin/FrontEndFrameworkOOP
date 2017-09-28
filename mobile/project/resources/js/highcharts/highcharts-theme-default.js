/**
 * Dark theme for Highcharts JS
 * @author Torstein Honsi
 */

// Load the fonts
Highcharts.theme = {
	colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
	chart: {
		style: {
			fontFamily: ""
		}
	},
	credits: {
		 enabled:false
	}
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);