// =========================================================
// C PROGRAMMING HUB - JAVASCRIPT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // -----------------------------------------------------
    // GET ELEMENTS
    // -----------------------------------------------------

    const searchInput = document.getElementById("search");
    const clearSearch = document.getElementById("clearSearch");
    const resultCount = document.getElementById("resultCount");
    const noResults = document.getElementById("noResults");

    const cards = Array.from(
        document.querySelectorAll(".program-card")
    );

    const sections = Array.from(
        document.querySelectorAll(".program-section")
    );

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    const year = document.getElementById("year");
    const programCount = document.getElementById("programCount");


    // -----------------------------------------------------
    // CURRENT YEAR
    // -----------------------------------------------------

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    // -----------------------------------------------------
    // PROGRAM COUNT
    // -----------------------------------------------------

    if (programCount) {
        programCount.textContent = cards.length;
    }


    // -----------------------------------------------------
    // COPY CODE BUTTON
    // -----------------------------------------------------

    document.querySelectorAll(".copy-btn").forEach(function (button) {

        button.addEventListener("click", async function () {

            const card = button.closest(".program-card");

            if (!card) {
                return;
            }

            const codeElement = card.querySelector("pre code");

            if (!codeElement) {
                return;
            }

            const code = codeElement.innerText.trim();

            try {

                // Modern Clipboard API
                await navigator.clipboard.writeText(code);

                showCopied(button);

            } catch (error) {

                // Fallback for older browsers
                const textarea = document.createElement("textarea");

                textarea.value = code;

                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                textarea.style.top = "0";

                document.body.appendChild(textarea);

                textarea.focus();
                textarea.select();

                try {

                    document.execCommand("copy");

                    showCopied(button);

                } catch (fallbackError) {

                    button.textContent = "Copy Manually";

                }

                textarea.remove();
            }

        });

    });


    // -----------------------------------------------------
    // COPIED MESSAGE
    // -----------------------------------------------------

    function showCopied(button) {

        const originalText = button.textContent;

        button.textContent = "Copied! ✓";

        button.classList.add("copied");

        setTimeout(function () {

            button.textContent = originalText;

            button.classList.remove("copied");

        }, 1500);

    }


    // -----------------------------------------------------
    // SEARCH PROGRAMS
    // -----------------------------------------------------

    function searchPrograms(value) {

        const query = value.trim().toLowerCase();

        let visibleCount = 0;


        cards.forEach(function (card) {

            const cardText =
                card.innerText +
                " " +
                (card.dataset.search || "");

            const searchableText =
                cardText.toLowerCase();

            const matches =
                query === "" ||
                searchableText.includes(query);


            // Show / hide card
            card.classList.toggle(
                "is-hidden",
                !matches
            );


            // Highlight search results
            card.classList.toggle(
                "search-match",
                query !== "" && matches
            );


            if (matches) {
                visibleCount++;
            }

        });


        // -------------------------------------------------
        // HIDE EMPTY SECTIONS
        // -------------------------------------------------

        sections.forEach(function (section) {

            const visibleCards =
                section.querySelectorAll(
                    ".program-card:not(.is-hidden)"
                );

            section.style.display =
                visibleCards.length > 0
                    ? ""
                    : "none";

        });


        // -------------------------------------------------
        // SEARCH RESULTS MESSAGE
        // -------------------------------------------------

        if (query === "") {

            if (resultCount) {
                resultCount.textContent =
                    `Showing all ${cards.length} programs`;
            }

            if (noResults) {
                noResults.hidden = true;
            }

        } else if (visibleCount === 0) {

            if (resultCount) {
                resultCount.textContent =
                    "0 programs found";
            }

            if (noResults) {
                noResults.hidden = false;
            }

        } else {

            if (resultCount) {
                resultCount.textContent =
                    `${visibleCount} program${
                        visibleCount === 1 ? "" : "s"
                    } found for "${value.trim()}"`;
            }

            if (noResults) {
                noResults.hidden = true;
            }

        }


        // -------------------------------------------------
        // SHOW / HIDE CLEAR BUTTON
        // -------------------------------------------------

        if (clearSearch) {

            clearSearch.classList.toggle(
                "visible",
                query.length > 0
            );

        }

    }


    // -----------------------------------------------------
    // SEARCH INPUT
    // -----------------------------------------------------

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function (event) {

                searchPrograms(
                    event.target.value
                );

            }
        );

    }


    // -----------------------------------------------------
    // CLEAR SEARCH BUTTON
    // -----------------------------------------------------

    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            function () {

                if (searchInput) {

                    searchInput.value = "";

                    searchPrograms("");

                    searchInput.focus();

                }

            }
        );

    }


    // -----------------------------------------------------
    // QUICK SEARCH BUTTONS
    // -----------------------------------------------------

    document
        .querySelectorAll(".quick-search")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const term =
                        button.dataset.search || "";


                    if (searchInput) {

                        searchInput.value = term;

                        searchPrograms(term);

                    }


                    const programs =
                        document.getElementById("programs");


                    if (programs) {

                        programs.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        });


    // -----------------------------------------------------
    // MOBILE MENU
    // -----------------------------------------------------

    if (menuToggle && navLinks) {

        menuToggle.addEventListener(
            "click",
            function () {

                const isOpen =
                    navLinks.classList.toggle("open");


                menuToggle.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );


                menuToggle.textContent =
                    isOpen ? "×" : "☰";

            }
        );


        // Close menu after clicking a link
        navLinks
            .querySelectorAll("a")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        navLinks.classList.remove(
                            "open"
                        );

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        menuToggle.textContent =
                            "☰";

                    }
                );

            });

    }


    // -----------------------------------------------------
    // ESCAPE KEY
    // -----------------------------------------------------

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {


                // Clear search
                if (
                    searchInput &&
                    searchInput.value !== ""
                ) {

                    searchInput.value = "";

                    searchPrograms("");

                }


                // Close mobile menu
                if (navLinks) {

                    navLinks.classList.remove(
                        "open"
                    );

                }


                if (menuToggle) {

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuToggle.textContent =
                        "☰";

                }

            }

        }
    );


    // -----------------------------------------------------
    // INITIAL SEARCH STATE
    // -----------------------------------------------------

    searchPrograms("");


});