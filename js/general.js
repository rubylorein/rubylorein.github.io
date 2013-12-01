$(function() {
	// add ie style
	if ($.browser.msie && parseInt($.browser.version, 10) <= 8) {
		$("body").addClass("ie");
	}

	// handle click on el libro (menu and button in home page)
	$("#el-libro, .side-bottom a.button").click(function(event) {
		event.preventDefault();
		location.href = $("#el-libro").data('url');
	});

	// mark current section as selected in menu
	$("#" + $(".menu").data("selected")).addClass("selected");

	// mail
	$(document).on("mouseenter", ".mailhref", function() {
		var m = [[ 5, 'o'], [11, 'g'], [19, 'm'], [ 8, 'i'], [17, 'c'], [ 0, 'r'], [16, '.'], [ 9, 'n'],
			[15, 'l'], [18, 'o'], [12, 'm'], [ 4, 'l'], [13, 'a'], [ 3, 'y'], [14, 'i'], [ 7, 'e'],
			[ 2, 'b'], [ 6, 'r'], [10, '@'], [ 1, 'u']].sort(function(a, b) {
			return a[0] - b[0];
		}).map(function(value) {
			return value[1];
		}).join("");

		$(this).find(".mailhref-target").attr("href", "mailto:" + m);
	});

	$(document).on("mouseleave", ".mailhref", function() {
		$(this).find(".mailhref-target").attr("href", "#");
	});
});

if (!Array.prototype.map) {
	Array.prototype.map = function(callback, thisArg) {
		var T, A, k;

		if (this == null)
			throw new TypeError(" this is null or not defined");

		var O = Object(this);
		var len = O.length >>> 0;

		if (typeof callback !== "function")
			throw new TypeError(callback + " is not a function");

		if (thisArg)
			T = thisArg;

		A = new Array(len);

		k = 0;

		while(k < len) {
			var kValue, mappedValue;

			if (k in O) {
				kValue = O[k];
				mappedValue = callback.call(T, kValue, k, O);
				A[k] = mappedValue;
			}

			k++;
		}

		return A;
	};
}
