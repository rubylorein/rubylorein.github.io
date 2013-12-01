$(window).load(function() {
	(function() {
		var bookWrapper = $(".book-wrapper");
		var next = bookWrapper.find(".next");
		var prev = bookWrapper.find(".prev");
		var topNext = $(".book-nav .right");
		var topPrev = $(".book-nav .left");
		var pageNumbers = $(".book-nav .middle");

		var source = $("#source");

		// add links to post headers
		source.find(".post-header").each(function() {
			var element = $(this);
			var section = element.attr("data-section-id");
			var link = $("<a>");

			link.attr("href", location.protocol + "//" + location.host + location.pathname + "#" + section);
			link.text(element.text());

			element.empty();
			element.append(link);
		});

		var book = new Book();
		book.hyphenation({ minLength: 6 });
		book.lang("es");
		book.append(source);
		book.cleared(function() {
			bookWrapper.addClass("processing");
			book.dom().detach();
		});
		book.ready(function() {
			bookWrapper.removeClass("processing");
			bookWrapper.append(book.dom());
			onPageChanged();
		});
		book.ready(onFirstLoad);

		function onFirstLoad() {
			book.goto(window.location.hash.substring(1));
			onPageChanged();
			book.unbind("ready", onFirstLoad);
		}

		function onPageChanged() {
			if (book.current() < book.size() - 1) {
				next.show();
				topNext.removeClass("disabled");
			}
			else {
				next.hide();
				topNext.addClass("disabled");
			}

			if (book.current() > 0) {
				prev.show();
				topPrev.removeClass("disabled");
			}
			else {
				prev.hide();
				topPrev.addClass("disabled");
			}

			var leftPage = book.current() * 2 + 1;
			pageNumbers.text(leftPage + " - " + (leftPage + 1));
		}

		// avoid selection on buttons
		next.attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
		prev.attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
		topNext.attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
		topPrev.attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);

		next.add(topNext).click(function() {
			book.next();
			onPageChanged();
		});

		prev.add(topPrev).click(function() {
			book.prev();
			onPageChanged();
		});

		$(window).bind("hashchange", function() {
			function gotoHash() {
				book.goto(window.location.hash.substring(1));
				onPageChanged();
				book.unbind("ready", gotoHash);
			}
			
			if (bookWrapper.hasClass("processing"))
				book.ready(gotoHash);
			else
				gotoHash();
		});
	})();
});
