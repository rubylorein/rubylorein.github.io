$(function() {
	$(".updates-list").mCustomScrollbar({
		theme: "dark-thick",
		scrollInertia: 0,
		scrollButtons: {
			enable: true,
			scrollSpeed: 20
		}
	});

	var months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

	function getDateText(date) {
		var dateComponents = date.split("-");
		date = new Date(parseInt(dateComponents[0]), parseInt(dateComponents[1]) - 1, parseInt(dateComponents[2]), 0, 0, 0, 0);
		return date.getDate() + " de " + months[date.getMonth()] + " de " + date.getFullYear();
	}

	Updates = new AjaxPaging({
		body: $(".updates-list .mCSB_container"),
		pages: $(".updates .pages"),
		maxPageNumbers: 5,
		itemsPerPage: 5,
		dataSource: "data/actualizaciones/data-*.json",

		createItem: function(index, item) {
			var $item = $("<div>").addClass("update");
			var $date = $("<span>").addClass("date");
			var $title = $("<h2>");
			var $text = $("<p>");

			$date.append($("<b>").text(getDateText(item.date)));

			if (item.link.length > 0)
				$title.append($("<a>").attr("href", item.link).text(item.title));
			else
				$title.text(item.title);

			$text.text(item.text);
			$item.append($date, $title, $text);

			if (item.readmore)
				$text.append(" ", $("<a>").addClass("readmore").attr("href", item.link).text("(Leer más)"));

			return $item;
		},

		onRequestStart: function() {
			$(".updates").addClass("loading");
		},

		onRequestEnd: function() {
			$(".updates").removeClass("loading");
		},

		onPageChanged: function() {
			$(".updates-list").mCustomScrollbar("update");
			$(".updates-list").mCustomScrollbar("scrollTo", 0);
		}
	});

});
