// =========================================================
// C PROGRAMMING HUB - Clinton Wafula Luswa
// Works on the homepage AND on all inner pages (every block
// checks that its elements exist before doing anything).
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    var WHATSAPP_NUMBER = "254748032315";

    // ---------------------------------------------------
    // MOBILE MENU
    // ---------------------------------------------------
    var menuToggle = document.getElementById("menuToggle");
    var navLinks = document.getElementById("navLinks");

    function setMenu(open) {
        if (!menuToggle || !navLinks) return;
        navLinks.classList.toggle("open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.textContent = open ? "×" : "☰";
        menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            setMenu(!navLinks.classList.contains("open"));
        });
        navLinks.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () { setMenu(false); });
        });
        document.addEventListener("click", function (e) {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false);
        });
    }

    // ---------------------------------------------------
    // ACTIVE NAV LINK WHILE SCROLLING (homepage only)
    // ---------------------------------------------------
    if (navLinks && "IntersectionObserver" in window) {
        var map = {};
        navLinks.querySelectorAll('a[href^="/#"], a[href^="#"]').forEach(function (a) {
            var id = a.getAttribute("href").replace("/", "").replace("#", "");
            if (id && document.getElementById(id)) map[id] = a;
        });
        var ids = Object.keys(map);
        if (ids.length) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        Object.keys(map).forEach(function (k) { map[k].classList.remove("active"); });
                        map[entry.target.id].classList.add("active");
                    }
                });
            }, { rootMargin: "-40% 0px -55% 0px" });
            ids.forEach(function (id) { observer.observe(document.getElementById(id)); });
        }
    }

    // ---------------------------------------------------
    // CLOSE MENU WITH ESCAPE
    // ---------------------------------------------------
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setMenu(false);
    });

    // ---------------------------------------------------
    // COPY CODE BUTTONS
    // ---------------------------------------------------
    function showCopied(button) {
        var original = button.dataset.label || button.textContent;
        button.dataset.label = original;
        button.textContent = "Copied! ✓";
        button.classList.add("copied");
        setTimeout(function () {
            button.textContent = original;
            button.classList.remove("copied");
        }, 1500);
    }

    document.querySelectorAll(".copy-btn").forEach(function (button) {
        button.addEventListener("click", async function () {
            var card = button.closest(".program-card");
            var codeEl = card && card.querySelector("pre code");
            if (!codeEl) return;
            var code = codeEl.innerText.trim();
            try {
                await navigator.clipboard.writeText(code);
                showCopied(button);
            } catch (err) {
                var ta = document.createElement("textarea");
                ta.value = code;
                ta.style.cssText = "position:fixed;left:-9999px;top:0";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                try { document.execCommand("copy"); showCopied(button); }
                catch (e2) { button.textContent = "Copy manually"; }
                ta.remove();
            }
        });
    });

    // ---------------------------------------------------
    // SEARCH PROGRAMS
    // ---------------------------------------------------
    var searchInput = document.getElementById("search");
    var clearSearch = document.getElementById("clearSearch");
    var resultCount = document.getElementById("resultCount");
    var noResults = document.getElementById("noResults");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".program-card"));

    function searchPrograms(value) {
        var query = value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.textContent + " " + (card.dataset.search || "")).toLowerCase();
            var match = query === "" || text.indexOf(query) !== -1;
            card.classList.toggle("is-hidden", !match);
            card.classList.toggle("search-match", query !== "" && match);
            if (match) visible++;
        });

        if (noResults) noResults.hidden = !(query !== "" && visible === 0);

        if (resultCount) {
            if (query === "") resultCount.textContent = "Showing all " + cards.length + " programs";
            else resultCount.textContent = visible + " program" + (visible === 1 ? "" : "s") + ' found for "' + value.trim() + '"';
        }
        if (clearSearch) clearSearch.classList.toggle("visible", query.length > 0);
    }

    if (cards.length) {
        searchPrograms("");

        if (searchInput) {
            searchInput.addEventListener("input", function (e) { searchPrograms(e.target.value); });
            searchInput.addEventListener("keydown", function (e) {
                if (e.key === "Escape") { searchInput.value = ""; searchPrograms(""); }
            });
        }
        if (clearSearch) {
            clearSearch.addEventListener("click", function () {
                if (searchInput) { searchInput.value = ""; searchInput.focus(); }
                searchPrograms("");
            });
        }
        document.querySelectorAll(".quick-search").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var term = btn.dataset.search || "";
                if (searchInput) searchInput.value = term;
                searchPrograms(term);
            });
        });
    }

    // ---------------------------------------------------
    // YOUTUBE (click-to-load: no video code loads until tapped)
    // ---------------------------------------------------
    document.querySelectorAll(".yt-embed").forEach(function (box) {
        var id = (box.dataset.videoId || "").trim();
        var valid = /^[A-Za-z0-9_-]{11}$/.test(id);
        if (!valid) return; // placeholder: link falls back to the YouTube search page

        box.href = "https://www.youtube.com/watch?v=" + id;
        box.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";

        box.addEventListener("click", function (e) {
            e.preventDefault();
            var iframe = document.createElement("iframe");
            iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
            iframe.title = box.dataset.title || "YouTube video";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            box.replaceChildren(iframe);
        });
    });

    // ---------------------------------------------------
    // CONTACT FORM -> WhatsApp (no backend needed)
    // ---------------------------------------------------
    var form = document.getElementById("contactForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var data = new FormData(form);
            var lines = [
                "Hello Clinton, I found your website.",
                "Name: " + (data.get("name") || ""),
                "Phone: " + (data.get("phone") || ""),
                "Interested in: " + (data.get("interest") || ""),
            ];
            var message = (data.get("message") || "").toString().trim();
            if (message) lines.push("Message: " + message);

            var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
            window.open(url, "_blank", "noopener");
        });
    }

    // ---------------------------------------------------
    // YEAR (for any page that has <span id="year">)
    // ---------------------------------------------------
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
});
