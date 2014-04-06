$(function() {
	function getDateText(date) {
		var dateComponents = date.split("-");
		date = new Date(parseInt(dateComponents[0]), parseInt(dateComponents[1]) - 1, parseInt(dateComponents[2]), 0, 0, 0, 0);
		return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
	}

	function getLink(id, section) {
		return "escritos/" + id + "/" + (section ? "#" + section : "");
	}

	Escritos = new AjaxPaging({
		body: $(".escritos .list"),
		pages: $(".escritos .pages"),
		maxPageNumbers: 9,
		itemsPerPage: 10,
		dataSource: "data/escritos/data-*.json",

		createItem: function(index, item, itemsCount) {
			var $item = $("<div>").addClass("item");
			var $image = $("<div>").addClass("item-image");
			var $details = $("<div>").addClass("item-details");
			var $body = $("<div>").addClass("item-body");

			var $lastUpdatedOrCompleted = $("<div>");

			if (item["complete"]) {
				$lastUpdatedOrCompleted.append($("<b>").text("COMPLETADO:"), " ", $("<div>").text(getDateText(item["last-updated"])).html());
			}
			else {
				$lastUpdatedOrCompleted.append(
					$("<b>").text("ÚLTIMA ACTUALIZACIÓN:"),
					" ",
					$("<a>").text(getDateText(item["last-updated"])).attr("href", getLink(item["id"], item["last-section"]))
				);
			}

			$item.append($image, $details, $body);
			$image.text(itemsCount - index);
			$body.text(item["text"]);
			$details.append(
				$("<h2>").append($("<a>").text(item["title"]).attr("href", getLink(item["id"]))),
				$("<div>").append($("<b>").text("INICIO:"), " ", $("<div>").text(getDateText(item["start-date"])).html()),
				$lastUpdatedOrCompleted
			);

			$body.append(" ", $("<a>").addClass("readmore").attr("href", getLink(item["id"])).html("(Leer&nbsp;más)"));

			return $item;
		},

		onRequestStart: function() {
			$(".updates").addClass("loading");
		},

		onRequestEnd: function() {
			$(".updates").removeClass("loading");
		},

		onPageChanged: function() {
			$(".escritos .list .item:not(:last-child)").after($("<div>").addClass("fadeline"));
		}
	});
});
