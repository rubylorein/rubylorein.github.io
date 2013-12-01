/*
 * Book DOM
 *
 *   Assuming you don't change the default class, the following DOM is generated:
 *
 *   <div class="book">
 *       <div class="book-content">
 *           <div class="book-page-wrapper">
 *               <div class="book-page"></div>
 *           </div>
 *           <div class="book-page-wrapper">
 *               <div class="book-page"></div>
 *           </div>
 *       </div>
 *       <div class="book-content">...</div>
 *       ...
 *   </div>
 *
 *   Each `book-content` element contains two pages, wrapped inside another div which should
 *   have overflow set to hidden.
 *
 *   When you set the class of the book with setClass, all the classes used will be prefixed
 *   with the new class. If you specify more than one class, the first one will be used as the
 *   prefix. For example, if you do `book.setClass("mybook crazy-style")`, the classes will look
 *   like `mybook`, `mybook-content`, `mybook-page-wrapper` and `mybook-page`.
 * 
 * Content structure
 *
 *   The content you append to the book should be an element where all its childrens are div
 *   elements. Each element is thought as a paragraph but is not necessarily a paragraph (it can
 *   be a header, an image, etc). Example:
 *
 *   <div id="content">
 *       <div class="page-break-right full-page middle">
 *       	<h1>My Title</h1>
 *       </div>
 *       <div class="normalize">
 *       	<h2>Some header</h2>
 *       </div>
 *       <div>First paragraph...</div>
 *   </div>
 *
 *   <script>
 *       book = new Book();
 *       book.append($("#content"));
 *       book.dom().appendTo("body");
 *   </script>
 *
 * Paragraph classes
 * 
 *   The next classes are available to be used in paragraphs:
 * 
 *   - full-page: the paragraph takes a whole page.
 *   - middle: can be used with full-page to center vertically.
 *   - page-break: paragraph starts in a blank page.
 *   - page-break-left: paragraph starts in a blank page on the left.
 *   - page-break-right: paragraph starts in a blank page on the right.
 *   - stick-with-next: moves paragraph to the next page if it's the last on the page.
 *   - dont-split: prevents the paragraph from splitting through different pages.
 *   - normalize: adds a bottom margin to match an height multiple of the normal line height.
 *   - dont-hyphenate: prevents hyphenation on current element and all descendants (can be used on any element).
 *
 * Sections
 *
 *   To create a section add an attribute with the name `data-section-id` to a paragraph.
 *   The value of the attribute can be passed to the goto() method to navigate to that section: `book.goto("mysection")`.
 *
 * API Reference
 *
 *   The following are all methods of the Book object.
 *
 *   General
 *
 *   - dom()
 *     Returns a jQuery object that holds the DOM of the book.
 *
 *   - append(content)
 *     Adds content to the book. `content` can be a DOM element or a jQuery collection.
 *
 *   - setClass(className)
 *     Specifies the class and prefix that will be used in the generated DOM elements.
 *     The root node will get exactly what is passed in className. The rest of the elements
 *     will have classes prefixed by the first class in className. For example, if you pass
 *     "mybook other", a page element will have the class "mybook-page". Check Book DOM to
 *     see the different classes that are used.
 *     The default class if you never call this method is "book".
 *
 *   - prefix()
 *     Returns the class prefix used in the DOM of the book.
 *
 *   - lang([lang])
 *     If no parameter is passed it returns the default language of the book. Otherwise it sets
 *     the default language to `lang`. The language is used merely for hyphenation. By default,
 *     the language is retrieved from `document.documentElement.lang`, which can be changed by
 *     setting the `lang` attribute in the `html` element. Example: `<html lang="es">`.
 *
 *   - hyphenation(options)
 *     Configures the hyphenation of the book. `options` should be an object that currently can
 *     contain the `minLength` property, which will specify the minimum length a word should be
 *     to apply hyphenation to it. Example: `book.hyphenation({ minLength: 6 })`.
 *     The default `minLength` value is 4.
 *
 *   Navigation
 *
 *   - next()
 *     Switches to the next page. Returns false if there is no next page.
 *
 *   - prev()
 *     Switches to the previous page. Returns false if there is no previous page.
 *
 *   - goto(index)
 *     Navigates to the given index. The first 2 pages have index 0, the following 2 pages have
 *     index 1, and so on. If a string with a section id is passed, it will navigate to wherever
 *     that section is.
 *
 *   - current()
 *     Returns the index of the current page. Note that if you switch the page manually (using
 *     DOM methods or jQuery), that won't be reflected in this method. This will always return
 *     a stored index which is updated when the navigation methods are called.
 *
 *   - size()
 *     Returns the size of the book, which is measured in amount of elements that contain 2 pages.
 *
 *   Events
 *
 *   - bind(eventType, callback)
 *     Binds the given event to the passed callback. Available events are `cleared`, `building` and
 *     `ready`. This method behaves exactly like the one in jQuery because it's using jQuery bind/unbind
 *     under the hood.
 *
 *   - unbind(eventType, callback)
 *     Unbinds an event. This method behaves exactly like the one in jQuery because it's using jQuery
 *     bind/unbind under the hood.
 *
 *   - cleared(callback)
 *     Binds the `cleared` event. This is triggered before the book starts processing the content.
 *
 *   - building(callback)
 *     Binds the `building` event. This is triggered as the book content is being processed. Every time
 *     it's called, one or more elements containing 2 pages have been added to the DOM of the book.
 *
 *   - ready(callback)
 *     Binds the `ready` event. This is triggered when the book content is ready (finished processing).
 *     The whole book should be available in the DOM.
 * 
 */

(function() {

// helper functions

function arrIndexOf(array, needle, i) {
	if (Array.prototype.indexOf)
		return Array.prototype.indexOf.call(array, needle, i);

	var len = array.length;
	i = i || 0;

	for (; i < len; i++) {
		if(array[i] === needle)
			return i;
	}

	return -1;
};

function strIndexOfAny(str, anyOf, startIndex, endIndex) {
	for (var i = startIndex; i < endIndex; i++) {
		if (anyOf.indexOf(str[i]) > -1)
			return i;
	}
	return -1;
}

function strLastIndexOfAny(str, anyOf, startIndex, endIndex) {
	for (var i = startIndex; i > endIndex; i--) {
		if (anyOf.indexOf(str[i]) > -1)
			return i;
	}
	return -1;
}

function createOffscreenElement() {
	return $("<div>").css({
		position: "absolute",
		left: "-1000px",
		width: "1px",
		height: "1px",
		overflow: "hidden"
	}).appendTo("body");
}

function elementInDocument(element) {
	return $.contains(document.documentElement, element);
}

function isFirstChildDeep(node, parent) {
	if (node === parent)
		return false;

	while (node !== parent && node.parentNode !== null) {
		if (node !== node.parentNode.firstChild)
			break;

		node = node.parentNode;
	}

	if (node === parent)
		return true;

	return false;
}

function getDeepestLastChild(node) {
	while (node.lastChild !== null)
		node = node.lastChild;

	return node;
}

// copy handler (singleton)

var CopyHandler = (function() {
	var books_ = [];

	$(function() {
		$("body").on("copy", handler);
	});

	function handler(event) {
		var selection = rangy.getSelection();
		var books = getBooks();
		books = filterBooks(books, selection);

		if (books.length === 0)
			return;

		var container = $("<div>");
		var ranges = selection.getAllRanges();

		for (var i = 0; i < ranges.length; i++) {
			var range = ranges[i];
			var selectedBooks = filterBooks(books, range);

			var wrapper = $("<div>");

			if (selectedBooks.length === 0) {
				wrapper.append(range.cloneContents());
				wrapper.appendTo(container);
			}
			else {
				var contents = processRange(range, selectedBooks);
				container.append(contents.children());
			}
		}

		// note: scroll is saved & restored because IE8 is shit
		
		var wnd = $(window);
		var scrollTop = wnd.scrollTop();
		var scrollLeft = wnd.scrollLeft();
		var offscreen = createOffscreenElement();

		offscreen.css({ top: scrollTop });
		offscreen.append(container);

		selection.selectAllChildren(container[0]);
		event.stopPropagation();

		setTimeout(function() {
			selection.setRanges(ranges);
			offscreen.detach(); // offscreen.remove() will remove events attached to the original elements (not cloned elements) on IE8
			wnd.scrollTop(scrollTop);
			wnd.scrollLeft(scrollLeft);

			var len = books.length;
			for (var i = 0; i < len; i++) {
				var dom = books[i].dom();
				var visibleContent = $("." + books[i].prefix() + "-content:visible", dom);
				visibleContent.children().prop("scrollTop", 0);
			}
		}, 0);
	}

	function getBooks() {
		var books = [];
		var len = books_.length;

		for (var i = 0; i < len; i++) {
			var dom = books_[i].dom();
			if (elementInDocument(dom[0]))
				books.push(books_[i]);
		}

		books.sort(compareDomPosition);
		return books;
	}

	function compareDomPosition(a, b) {
		var aDom = a.dom();
		var bDom = b.dom();
		var aRange = rangy.createRange();
		var bRange = rangy.createRange();

		aRange.selectNode(aDom[0]);
		bRange.selectNode(bDom[0]);

		return aRange.compareBoundaryPoints(aRange.START_TO_START, bRange);
	}

	function filterBooks(books, range) {
		var filteredBooks = [];
		var len = books.length;

		for (var i = 0; i < len; i++) {
			var dom = books[i].dom();
			if (range.containsNode(dom[0], true))
				filteredBooks.push(books[i]);
		}

		return filteredBooks;
	}

	function processRange(range, books) {
		var container = $("<div>");
		var currentRange = null;
		var wrapper = null;

		// range before books
		
		currentRange = rangy.createRange();
		currentRange.setStartBefore($("body")[0]);
		currentRange.setEndBefore(books[0].dom()[0]);
		currentRange = currentRange.intersection(range);

		if (currentRange) {
			wrapper = $("<div>");
			wrapper.append(currentRange.cloneContents());
			wrapper.appendTo(container);
		}

		var len = books.length;

		for (var i = 0; i < len; i++) {
			// range intersecting book
			
			var dom = books[i].dom();
			var contentDom = dom.children(":visible");
			currentRange = rangy.createRange();
			currentRange.selectNodeContents(contentDom[0]);
			currentRange = currentRange.intersection(range);

			if (currentRange) {
				var clonedContent = contentDom.clone(true);
				var splittedParagraphs = clonedContent.find("." + books[i].prefix() + "-splitted-paragraph");
				var serializedRange = rangy.serializeRange(currentRange, true, contentDom[0]);
				currentRange = rangy.deserializeRange(serializedRange, clonedContent[0]);

				splittedParagraphs.each(function() {
					var extraChars = $(this).data("extra-chars");

					if (extraChars) {
						var node = getDeepestLastChild(this);
						node.nodeValue = node.nodeValue.substr(0, node.nodeValue.length - extraChars);
						
						if (node.nodeValue[node.nodeValue.length - 1] === String.fromCharCode(173))
							node.nodeValue += '-';

						// when calling range.setStart and start node = end node, range gets collapsed, so store offsets before
						var start = currentRange.startOffset;
						var end = currentRange.endOffset;
						
						if (currentRange.startContainer === node)
							currentRange.setStart(node, Math.min(start, node.nodeValue.length - 1));
						
						if (currentRange.endContainer === node)
							currentRange.setEnd(node, Math.min(end, node.nodeValue.length - 1));
					}
				});

				wrapper = $("<div>");
				wrapper.append(currentRange.cloneContents());
				wrapper.appendTo(container);
				wrapper.find("*").andSelf().hyphenate(false);
			}
			
			// range between two different books
			
			if (i < len - 1) {
				currentRange = rangy.createRange();
				currentRange.setStartAfter(dom[0]);
				currentRange.setEndBefore(books[i + 1].dom()[0]);
				currentRange = currentRange.intersection(range);

				if (currentRange) {
					wrapper = $("<div>");
					wrapper.append(currentRange.cloneContents());
					wrapper.appendTo(container);
				}
			}
		}

		// range after books
		
		currentRange = rangy.createRange();
		currentRange.setStartAfter(books[len - 1].dom()[0]);
		currentRange.setEndAfter($("body")[0]);
		currentRange = currentRange.intersection(range);

		if (currentRange) {
			wrapper = $("<div>");
			wrapper.append(currentRange.cloneContents());
			wrapper.appendTo(container);
		}

		return container;
	}

	return {
		register: function(book) {
			if (book instanceof Book && arrIndexOf(books_, book) === -1)
				books_.push(book);
		}
	};
})();

// book class

function Book() {
	// private
	
	var className_ = "book";
	var classPrefix_ = "book";
	var dom_ = $("<div>").addClass(className_);
	var paragraphs_ = [];
	var lang_ = document.documentElement.lang || "en-us";
	var hypherMinLength_ = 4;
	var currentIndex_ = 0;
	var sections_ = {};
	var events_ = $(this);

	$(window).resize(function() {
		// this timeout fixes a bug in firefox where this event is triggered in the middle of bookBuilder process() function (when calling page.height())
		setTimeout(function() {
			bookBuilder_.restart();
		}, 0);
	});

	CopyHandler.register(this);

	var bookBuilder_ = (function() {
		var timerId_ = null;
		var bookDom_ = null;
		var pageDom_ = null;
		var pageMetrics_ = null;
		var pageIndex_ = null;
		var paragraphIndex_ = null;

		function init() {
			dom_.empty();
			sections_ = {};
			bookDom_ = $("<div>");
			bookDom_.addClass(className_);
			bookDom_.appendTo(createOffscreenElement());
			pageMetrics_ = calculatePageMetrics();
			pageIndex_ = -1;
			paragraphIndex_ = 0;

			addPage();

			// This timeout is so you can instantiate a book, append content to
			// it and set callbacks in any order. Otherwise the cleared event
			// will be triggered as soon as you call book.append, which might
			// be before adding the callbacks. Also, the timeout may never be
			// called because it can get cleared, but in that case init should
			// be called again so the cleared event will be triggered eventually.
			
			timerId_ = setTimeout(function() {
				events_.triggerHandler("cleared");
				timerId_ = setTimeout(process, 0);
			}, 0);
		}

		function finalize() {
			bookDom_.closest("body > div").remove();

			timerId_ = null;
			bookDom_ = null;
			pageDom_ = null;
			pageMetrics_ = null;
			pageIndex_ = 0;
			paragraphIndex_ = 0;
		}

		function process() {
			while (paragraphIndex_ < paragraphs_.length) {
				var paragraph = $(paragraphs_[paragraphIndex_]).clone(true);

				hyphenate(paragraph, lang_);

				var isPageEmpty = !pageDom_[0].hasChildNodes();
				var sectionPageIndex = pageIndex_;
				var sectionParagraph = paragraph;

				var isFullPage = paragraph.hasClass("full-page");
				var shouldBreakPageLeft = paragraph.hasClass("page-break-left");
				var shouldBreakPageRight = paragraph.hasClass("page-break-right");
				var shouldBreakPage = isFullPage || shouldBreakPageLeft || shouldBreakPageRight || paragraph.hasClass("page-break");

				if (!isPageEmpty && shouldBreakPage) {
					addPage();
					isPageEmpty = true;
				}

				if (shouldBreakPageLeft && shouldBreakPageRight && window.console) {
					console.log("Warning: using page-break-left & page-break-right on the same element, style will be ignored.");
				}
				else if (shouldBreakPageLeft && (pageIndex_ % 2) !== 0) {
					addPage();
				}
				else if (shouldBreakPageRight && (pageIndex_ % 2) === 0) {
					addPage();
				}

				if (isFullPage) {
					sectionPageIndex = pageIndex_;

					var wrapper = $("<div>");
					wrapper.append(paragraph);
					wrapper.appendTo(pageDom_);

					if (paragraph.hasClass("middle")) {
						var padding = Math.max(0, Math.round((pageMetrics_.height - paragraph.height()) / 2));
						wrapper.css("padding-top", padding + "px");
					}

					addPage();
				}
				else {
					var shouldNormalize = paragraph.hasClass("normalize");

					if (paragraph.hasClass("dont-split")) {
						paragraph.appendTo(pageDom_);

						if (!isPageEmpty && pageDom_.height() > pageMetrics_.height) {
							addPage();
							paragraph.appendTo(pageDom_);
						}

						sectionPageIndex = pageIndex_;

						if (shouldNormalize)
							normalize(paragraph);
					}
					else {
						var leftover = null;
						var originalParagraph = paragraph;

						sectionPageIndex = pageIndex_;

						while (leftover = addParagraph(paragraph, pageDom_)) {
							if (isPageEmpty && !paragraph[0].hasChildNodes()) {
								leftover.appendTo(pageDom_);

								if (paragraph === originalParagraph)
									sectionParagraph = leftover;

								break;
							}

							addPage();
							isPageEmpty = true;
							
							if (paragraph === originalParagraph && !paragraph[0].hasChildNodes()) {
								sectionPageIndex = pageIndex_;
								sectionParagraph = leftover;
							}

							paragraph = leftover;
						}

						if (shouldNormalize)
							normalize(paragraph);

						paragraph = originalParagraph;
					}

					if (paragraph.hasClass("stick-with-next") && paragraphIndex_ + 1 < paragraphs_.length &&
						paragraph[0] !== pageDom_[0].firstChild && !paragraph.hasClass(classPrefix_ + "-splitted-paragraph")) {
						var nextParagraph = $(paragraphs_[paragraphIndex_ + 1]).clone(true);

						addParagraph(nextParagraph, pageDom_);
						nextParagraph.detach();

						if (!nextParagraph[0].hasChildNodes()) {
							paragraph.detach();
							paragraph.removeAttr("data-section-id");
							addPage();
							paragraphIndex_--;
						}
					}
				}

				var sectionId = paragraph.attr("data-section-id");

				if (sectionId) {
					sections_[sectionId] = ({
						index: Math.floor(sectionPageIndex / 2),
						dom: sectionParagraph
					});
				}

				paragraphIndex_++;

				if (bookDom_[0].childNodes.length > 1) {
					apply(bookDom_.children().slice(0, -1));
					timerId_ = setTimeout(process, 0);

					events_.triggerHandler("building");

					return;
				}
			}

			apply(bookDom_.children());
			finalize();

			events_.triggerHandler("ready");
		}

		function apply(content) {
			content.hide();
			content.appendTo(dom_);

			if (content.index() === currentIndex_)
				content.show();
		}

		// paragraph must be already inserted in the DOM so it can be measured
		function normalize(paragraph) {
			var paragraphHeight = paragraph.height();
			var element = $("<div>");
			element.appendTo(paragraph.parent());

			while (element.height() < paragraphHeight)
				element.append("&nbsp;<br />");

			var margin = element.height() - paragraphHeight;
			paragraph.css("margin-bottom", margin + "px");
			element.remove();
		}

		function addParagraph(paragraph, page) {
			var leftover = null;

			if (fitsInPage(paragraph, page)) {
				paragraph.appendTo(page);
			}
			else {
				leftover = split(paragraph, page);

				if (paragraph[0].hasChildNodes()) {
					paragraph.appendTo(page);
					paragraph.addClass(classPrefix_ + "-splitted-paragraph");
				}
			}

			return leftover ? $(leftover) : null;
		}

		function fitsInPage(paragraph, page) {
			var result = false;
			paragraph.appendTo(page);

			if (page.height() <= pageMetrics_.height)
				result = true;

			paragraph.detach();
			return result;
		}

		function split(paragraph, page, node) {
			node = node || paragraph[0];

			switch (node.nodeType) {
				case 1:
					return splitElementNode(paragraph, page, node);

				case 3:
					return splitTextNode(paragraph, page, node);

				default:
					return null;
			}
		}

		function splitElementNode(paragraph, page, node) {
			if (!node.hasChildNodes()) {
				if (node.parentNode)
					node.parentNode.removeChild(node);

				return node;
			}

			var leftover = node.cloneNode(false);
			var removedNodes = document.createDocumentFragment();
			var bottom = 0;
			var top = node.childNodes.length;

			while (top - bottom > 1) {
				var splitIndex = bottom + Math.floor((top - bottom) / 2);

				while (node.childNodes.length > splitIndex) {
					var removedNode = node.removeChild(node.childNodes[splitIndex]);
					removedNodes.appendChild(removedNode);
				}
				
				if (fitsInPage(paragraph, page)) {
					bottom = splitIndex;
					node.appendChild(removedNodes);
				}
				else {
					top = splitIndex;
					leftover.insertBefore(removedNodes, leftover.firstChild);
				}
			}

			if (node.lastChild) {
				var innerLeftover = split(paragraph, page, node.lastChild);
				
				if (innerLeftover)
					leftover.insertBefore(innerLeftover, leftover.firstChild);
			}
			
			return leftover;
		}

		function splitTextNode(paragraph, page, node) {
			if (node.nodeValue.length === 0) {
				if (node.parentNode)
					node.parentNode.removeChild(node);

				return node;
			}

			var leftover = "";
			var hyphen = String.fromCharCode(173);
			var breakingChars = " \t\n" + hyphen + String.fromCharCode(8203);
			var bottom = 0;
			var top = node.nodeValue.length;

			while (strIndexOfAny(node.nodeValue, breakingChars, bottom, top) > -1) {
				var splitIndex = bottom + Math.floor((top - bottom) / 2);
				var breakIndex = strIndexOfAny(node.nodeValue, breakingChars, splitIndex, top);

				if (breakIndex > -1) {
					breakIndex++;

					while (breakIndex < top && breakingChars.indexOf(node.nodeValue[breakIndex]) > -1)
						breakIndex++;

					if (breakIndex === top)
						breakIndex = -1;
				}
				
				if (breakIndex === -1) {
					breakIndex = strLastIndexOfAny(node.nodeValue, breakingChars, splitIndex - 1, bottom - 1);

					if (breakIndex > -1)
						breakIndex++;
					else
						break;
				}

				splitIndex = breakIndex;

				var removedText = node.nodeValue.substr(splitIndex);
				node.nodeValue = node.nodeValue.substr(0, splitIndex);
				
				if (fitsInPage(paragraph, page)) {
					bottom = splitIndex;
					node.nodeValue = node.nodeValue + removedText;
				}
				else {
					top = splitIndex;
					leftover = removedText + leftover;
				}
			}

			var nodeLength = bottom;
			leftover = node.nodeValue.substr(nodeLength) + leftover;
			node.nodeValue = node.nodeValue.substr(0, nodeLength);

			// Now that the text is splitted, the first word* of the leftover
			// text has to be added to the original text node. This will fix
			// text justification and hyphenation. This may cause a bug in
			// some browsers if the text was broken on an hyphen, because
			// without the whole word the hyphen doesn't get measured, which
			// can result in the whole word moving to the next line instead of
			// showing the expected part of the word with the hyphen. To fix
			// this problem I measure the text again with a leading '-'. If the
			// whole word overflows it gets added at the beginning of leftover.
			// * Word can be a whole word or a part of it (broken on an hyphen).
			
			// If the node is empty and it's the first child, the node has to be
			// removed to avoid an empty paragraph at the bottom of a page, which
			// can lead to wrong section pointers.
			
			if (nodeLength > 0 || !isFirstChildDeep(node, paragraph[0])) {
				// When using different font sizes the overflowing text might become visible.
				// This will fix that.
				paragraph.appendTo(page);
				page.parent().height(page.height() + pageMetrics_.topPadding);
				paragraph.detach();

				var firstWordLength = strIndexOfAny(leftover, breakingChars, 0, leftover.length) + 1;

				if (firstWordLength === 0)
					firstWordLength = leftover.length;

				var firstWord = leftover.substr(0, firstWordLength);

				if (!$.browser.opera && node.nodeValue[nodeLength - 1] === hyphen) {
					var nodeText = node.nodeValue.substr(0, nodeLength - 1);
					node.nodeValue = nodeText + '-';
					
					if (fitsInPage(paragraph, page)) {
						node.nodeValue = nodeText + hyphen + firstWord;
						paragraph.data("extra-chars", firstWordLength);
					}
					else {
						node.nodeValue = nodeText + hyphen;
						var lastWordIndex = strLastIndexOfAny(node.nodeValue, breakingChars, nodeLength - 2, -1) + 1;
						var lastWord = node.nodeValue.substr(lastWordIndex);
						node.nodeValue += firstWord;
						leftover = lastWord + leftover;
						paragraph.data("extra-chars", node.nodeValue.length - lastWordIndex);
					}
				}
				else {
					node.nodeValue += firstWord;
					paragraph.data("extra-chars", firstWordLength);
				}
			}
			else {
				node.parentNode.removeChild(node);
			}
			
			return document.createTextNode(leftover);
		}

		function addPage() {
			var bookContent = null;

			if (pageIndex_ % 2 != 0) {
				bookContent = $("<div>");
				bookContent.addClass(classPrefix_ + "-content");
				bookContent.appendTo(bookDom_);
			}
			else {
				bookContent = pageDom_.closest("." + classPrefix_ + "-content");
			}

			var page = $("<div>");
			var pageWrapper = $("<div>");

			page.addClass(classPrefix_ + "-page");
			pageWrapper.addClass(classPrefix_ + "-page-wrapper");

			page.appendTo(pageWrapper);
			pageWrapper.appendTo(bookContent);

			page.css("padding-top", pageMetrics_.topPadding + "px");
			pageWrapper.height(pageMetrics_.height + pageMetrics_.topPadding);

			pageDom_ = page;
			pageIndex_++;
		}

		function calculatePageMetrics() {
			var result = { height: 0, topPadding: 0 };

			var bookContent = $("<div>");
			var pageWrapper = $("<div>");
			var page = $("<div>");
			var text = $("<div>");

			bookContent.addClass(classPrefix_ + "-content");
			pageWrapper.addClass(classPrefix_ + "-page-wrapper");
			page.addClass(classPrefix_ + "-page");

			text.appendTo(page);
			page.appendTo(pageWrapper);
			pageWrapper.appendTo(bookContent);
			bookContent.appendTo(bookDom_);

			text.append("&nbsp;");

			var maxHeight = pageWrapper.height();
			var height = text.height();
			
			while (height < maxHeight) {
				result.height = height;
				text.append("<br />&nbsp;");
				height = text.height();
			}

			result.topPadding = Math.round((maxHeight - result.height) / 2);
			bookContent.remove();

			return result;
		}

		function hyphenate(element, lang) {
			if (!element.hasClass("dont-hyphenate")) {
				lang = element.attr("lang") || lang;
				element.hyphenate(lang, hypherMinLength_);
				element.children(":not(.dont-hyphenate)").each(function() {
					hyphenate($(this), lang);
				});
			}
		}

		return {
			start: function() {
				if (timerId_ === null && paragraphs_.length > 0) {
					init();
				}
			},

			stop: function() {
				if (timerId_ !== null) {
					clearTimeout(timerId_);
					finalize();
				}
			},

			restart: function() {
				this.stop();
				this.start();
			},

			running: function() {
				return timerId_ !== null;
			}
		};
	})(); // bookBuilder

	// public
	
	this.append = function(content) {
		var children = $(content).children();
		var len = children.length;

		for (var i = 0; i < len; i++)
			paragraphs_.push(children[i]);

		if (!bookBuilder_.running())
			bookBuilder_.start();
	};

	this.setClass = function(className) {
		if (className_ !== className) {
			className_ = className;
			classPrefix_ = className.split(" ").shift();
			dom_.removeClass();
			dom_.addClass(className_);
			bookBuilder_.restart();
		}
	};

	this.lang = function(lang) {
		if (lang) {
			if (lang_ !== lang) {
				lang_ = lang;
				bookBuilder_.restart();
			}
		}
		else {
			return lang_;
		}
	};

	this.hyphenation = function(options) {
		if (options && options.minLength && hypherMinLength_ !== options.minLength) {
			hypherMinLength_ = options.minLength;
			bookBuilder_.restart();
		}
	};

	this.goto = function(index) {
		if (typeof index === "number" && (index < 0 || index >= this.size()) ||
			typeof index === "string" && !sections_[index])
			return false;

		if (typeof index === "string")
			index = sections_[index].index;

		var children = dom_.children();
		children.hide();
		children.eq(index).show();

		currentIndex_ = index;

		return true;
	};

	this.next = function() {
		var current = dom_.children(":visible");
		var next = current.next();

		if (!next.length)
			return false;

		current.hide();
		next.show();
		currentIndex_ = next.index();

		return true;
	};

	this.prev = function() {
		var current = dom_.children(":visible");
		var prev = current.prev();

		if (!prev.length)
			return false;

		current.hide();
		prev.show();
		currentIndex_ = prev.index();

		return true;
	};

	this.current = function() {
		return currentIndex_;
	};

	this.size = function() {
		return dom_[0].childNodes.length;
	};

	this.dom = function() {
		return dom_;
	};

	this.prefix = function() {
		return classPrefix_;
	}

	// event handling
	
	this.bind = function(eventType, callback) {
		events_.bind(eventType, callback);
	};

	this.unbind = function(eventType, callback) {
		events_.unbind(eventType, callback);
	};

	this.cleared = function(callback) {
		events_.bind("cleared", callback);
	};

	this.building = function(callback) {
		events_.bind("building", callback);
	};

	this.ready = function(callback) {
		events_.bind("ready", callback);
	};
} // Book

window["Book"] = Book;

})();
