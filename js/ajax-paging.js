// params = {
// 	body: "Page body jquery element",
// 	pages: "Page numbers jquery element",
// 	maxPageNumbers: "Maximum number of page numbers to show",
// 	itemsPerPage: "Number of item per page",
// 	dataSource: "Where to request for data. Example: data/updates/updates-*.json",
// 	createItem: function(item) {},
// 	onRequestStart: function() {},
// 	onRequestEnd: function() {},
// 	onPageChanged: function() {}
// }

function AjaxPaging(params) {
	var nothing = function() {};

	var self = this;
	var items = [];
	var size = 0;
	var itemsPerRequest = 0;
	var itemsPerPage = params.itemsPerPage;
	var maxPageNumbers = params.maxPageNumbers;
	var dataSource = params.dataSource;
	var createItem = params.createItem;
	var onRequestStart = params.onRequestStart || nothing;
	var onRequestEnd = params.onRequestEnd || nothing;
	var onPageChanged = params.onPageChanged || nothing;

	var $body = params.body;
	var $pages = params.pages;

	// this is so we can have the current page number right in the middle
	if (maxPageNumbers % 2 === 0)
		maxPageNumbers++;

	// request data information (total count and items per request)
	function init() {
		onRequestStart();

		$.ajax({
			url: dataSource.replace("*", "info"),
			dataType: "json",
			cache: false
		}).done(function(response) {
			onRequestEnd();
			size = response.size;
			itemsPerRequest = response.itemsPerRequest;
			self.setPage(0);
		}).fail(function() {
			setTimeout(function() { init(); }, 1000);
		});

		$pages.on("click", "span:not(.current,.disabled)", function() {
			self.setPage($(this).data("page-index"));
		}).attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
	};

	// updates the numbers to reflect the current page
	function updatePageNumber(page) {
		var i;
		var nPages = Math.ceil(size / itemsPerPage);
		var first = Math.max(0, page - Math.floor(maxPageNumbers / 2));
		var last = Math.min(nPages - 1, first + maxPageNumbers - 1);

		if (last - first + 1 < maxPageNumbers )
			first = Math.max(0, last - maxPageNumbers + 1);

		$pages.empty();
		$pages.removeClass("one-page");
		$pages.append($("<span>").text("«").data("page-index", page - 1).attr("title", "Anterior").addClass(page > 0 ? "" : "disabled"));

		for (i = first; i < page; i++)
			$pages.append($("<span>").text(i + 1).data("page-index", i));

		$pages.append($("<span>").addClass("current").text(page + 1));

		for (i = page + 1; i <= last; i++)
			$pages.append($("<span>").text(i + 1).data("page-index", i));

		$pages.append($("<span>").text("»").data("page-index", page + 1).attr("title", "Siguiente").addClass(page < nPages - 1 ? "" : "disabled"));

		if (nPages === 1)
			$pages.addClass("one-page");
	}

	this.setPage = function(page) {
		if (size === 0)
			return;

		var nPages = Math.ceil(size / itemsPerPage);
		page = Math.min(nPages - 1, Math.max(0, page));

		updatePageNumber(page);

		var index = page * itemsPerPage;
		$body.empty();

		var itemsLen = items.length;

		if (index + itemsPerPage > itemsLen && itemsLen < size) {
			var n = Math.floor(items.length / itemsPerRequest);

			onRequestStart();

			$.ajax({
				url: dataSource.replace("*", n),
				dataType: "json",
				cache: false
			}).done(function(response) {
				onRequestEnd();

				if (itemsLen === items.length)
				{
					var retrievedItems = response.items;
					var len = retrievedItems.length;

					for (var i = 0; i < len; i++) {
						items.push(retrievedItems[i]);
					}
				}

				self.setPage(page);
			}).fail(function() {
				setTimeout(function() { self.setPage(page); }, 1000);
			});

			return;
		}

		for (var i = 0; i < itemsPerPage && index + i < itemsLen && index + i < size; i++) {
			$body.append(createItem(index + i, items[index + i], size));
		}

		onPageChanged();
	};

	$(function() { init(); });
}
