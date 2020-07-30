/**
 * proj 관련
 */

(function(window, $){
	"use strict";

	var Proj = function(){
		this._init();
	}

	Proj.prototype = {

		_code : {
			5181 : '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs',
			5183 : '+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
			5185 : '+proj=tmerc +lat_0=38 +lon_0=125 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs',
			5186 : '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs',
			5187 : '+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs',
			5188 : '+proj=tmerc +lat_0=38 +lon_0=131 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs',
			5174 : '+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43',
			5179 : '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs',
			4019 : '+proj=longlat +ellps=GRS80 +no_defs',
		},

		_init: function(){
			var arrSrsCode = ["EPSG:", "http://www.opengis.net/gml/srs/epsg.xml#"];

			$.each(this._code, function(srsCode, def){
				$.each(arrSrsCode, function(idx){
					proj4.defs(this + srsCode, def);
				});
			});
			
			ol.proj.proj4.register(proj4);
		},

		getProj: function(epsg){
			return ol.proj.get(epsg);
		}
	}

	window.Proj = Proj;

})(window, jQuery);