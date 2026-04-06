// devices-tooltip.js
// Tooltip & card-patch overlay for devices page
// Requires: devices-tooltip.css loaded on the page
// Load AFTER devices-page-handler.js

(() => {
	var TOOLTIP_ID = "devices-tooltip";
	var listeners = [];

	// =====================
	// Helpers
	// =====================

	function addListener(el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);
		listeners.push([el, type, fn, !!capture]);
	}

	function cleanupListeners() {
		for (var i = 0; i < listeners.length; i++) {
			var e = listeners[i];
			if (e[0]) e[0].removeEventListener(e[1], e[2], !!e[3]);
		}
		listeners = [];
	}

	// =====================
	// Convert <a> cards → <div> cards
	// =====================

	function patchCards(root) {
		var cards = (root || document).querySelectorAll(
			'a.device-card[href], a[class*="device-card"][href]'
		);
		cards.forEach(function (a) {
			var div = document.createElement("div");

			for (var i = 0; i < a.attributes.length; i++) {
				var attr = a.attributes[i];
				if (
					attr.name === "href" ||
					attr.name === "target" ||
					attr.name === "rel"
				)
					continue;
				div.setAttribute(attr.name, attr.value);
			}

			div.setAttribute("data-link", a.getAttribute("href"));
			div.innerHTML = a.innerHTML;

			var desc = div.querySelector("p.line-clamp-2");
			if (desc && !desc.hasAttribute("data-desc")) {
				desc.setAttribute("data-desc", desc.textContent.trim());
				desc.classList.add("desc-clickable");
			}

			a.parentNode.replaceChild(div, a);
		});
	}

	// =====================
	// Tooltip element
	// =====================

	function getTooltip() {
		var el = document.getElementById(TOOLTIP_ID);
		if (el) return el;

		el = document.createElement("div");
		el.id = TOOLTIP_ID;
		el.className = "devices-tooltip";
		el.innerHTML =
			'<button class="devices-tooltip-close" aria-label="Close">' +
			'<svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
			'<path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
			'<div class="devices-tooltip-arrow"></div>' +
			'<p class="devices-tooltip-text"></p>';

		document.body.appendChild(el);
		return el;
	}

	// =====================
	// Positioning
	// =====================

	function showTooltip(tooltip, anchor) {
		var text = anchor.getAttribute("data-desc");
		if (!text) return;

		var textEl = tooltip.querySelector(".devices-tooltip-text");
		var arrowEl = tooltip.querySelector(".devices-tooltip-arrow");
		if (!textEl || !arrowEl) return;

		textEl.textContent = text;

		tooltip.style.top = "0px";
		tooltip.style.left = "0px";
		tooltip.classList.add("tt-visible");

		var rect = anchor.getBoundingClientRect();
		var tw = tooltip.offsetWidth;
		var th = tooltip.offsetHeight;
		var vw = window.innerWidth;

		var centerX = rect.left + rect.width / 2;
		var left = centerX - tw / 2;
		if (left < 10) left = 10;
		if (left + tw > vw - 10) left = vw - tw - 10;

		var top, above;
		if (rect.top > th + 20) {
			top = rect.top - th - 12;
			above = true;
		} else {
			top = rect.bottom + 12;
			above = false;
		}

		var arrowLeft = centerX - left - 6;
		if (arrowLeft < 16) arrowLeft = 16;
		if (arrowLeft > tw - 28) arrowLeft = tw - 28;

		arrowEl.style.left = arrowLeft + "px";
		if (above) {
			arrowEl.style.bottom = "-6px";
			arrowEl.style.top = "auto";
			arrowEl.style.transform = "rotate(45deg)";
		} else {
			arrowEl.style.top = "-6px";
			arrowEl.style.bottom = "auto";
			arrowEl.style.transform = "rotate(-135deg)";
		}

		tooltip.style.top = top + "px";
		tooltip.style.left = left + "px";
	}

	function hideTooltip() {
		var el = document.getElementById(TOOLTIP_ID);
		if (el) el.classList.remove("tt-visible");
	}

	// =====================
	// Event wiring
	// =====================

	function init() {
		cleanupListeners();

		var tooltip = getTooltip();

		patchCards();

		addListener(
			document,
			"click",
			function (e) {
				var desc = e.target.closest("[data-desc]");
				var isTooltip = e.target.closest("#" + TOOLTIP_ID);

				if (desc) {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();

					if (tooltip.classList.contains("tt-visible")) {
						hideTooltip();
						setTimeout(function () {
							showTooltip(tooltip, desc);
						}, 50);
					} else {
						showTooltip(tooltip, desc);
					}
					return false;
				}

				if (isTooltip) {
					var closeBtn = e.target.closest(".devices-tooltip-close");
					if (closeBtn) {
						e.preventDefault();
						e.stopPropagation();
						hideTooltip();
					}
					return;
				}

				if (tooltip.classList.contains("tt-visible")) {
					hideTooltip();
				}
			},
			true
		);

		addListener(
			document,
			"click",
			function (e) {
				if (e.target.closest("[data-desc]")) return;
				if (e.target.closest("#" + TOOLTIP_ID)) return;

				var card = e.target.closest(".device-card[data-link]");
				if (card) {
					var link = card.getAttribute("data-link");
					if (link) window.open(link, "_blank", "noopener,noreferrer");
				}
			},
			false
		);

		addListener(window, "scroll", hideTooltip, true);
		addListener(window, "resize", hideTooltip);

		setupObserver();
	}

	// =====================
	// MutationObserver
	// =====================

	var observer = null;

	function setupObserver() {
		if (observer) observer.disconnect();

		observer = new MutationObserver(function (mutations) {
			var needsPatch = false;
			for (var i = 0; i < mutations.length; i++) {
				var nodes = mutations[i].addedNodes;
				if (!nodes) continue;
				for (var j = 0; j < nodes.length; j++) {
					var n = nodes[j];
					if (n.nodeType !== 1) continue;
					if (
						(n.matches && n.matches("a.device-card")) ||
						(n.querySelector && n.querySelector("a.device-card"))
					) {
						needsPatch = true;
						break;
					}
				}
				if (needsPatch) break;
			}
			if (needsPatch) {
				setTimeout(patchCards, 10);
			}
		});

		var container = document.getElementById("devices-container");
		var target = container || document.body;
		observer.observe(target, { childList: true, subtree: true });
	}

	// =====================
	// Bootstrap
	// =====================

	function boot() {
		if (!document.getElementById("devices-container")) return;
		init();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}

	var events = [
		"swup:contentReplaced",
		"swup:pageView",
		"astro:page-load",
		"astro:after-swap",
		"mizuki:page:loaded",
	];
	for (var i = 0; i < events.length; i++) {
		document.addEventListener(events[i], function () {
			setTimeout(boot, 150);
		});
	}
})();