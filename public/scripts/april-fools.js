(function () {
    var storageKey = "april-fools-mode";
    var searchParams = new URLSearchParams(window.location.search);
    var queryOverride = searchParams.get("april-fools");
    var storedOverride = null;

    try {
        storedOverride = window.localStorage.getItem(storageKey);
    } catch (error) {
        storedOverride = null;
    }

    if (queryOverride === "on") {
        try {
            window.localStorage.setItem(storageKey, "on");
        } catch (error) {
            // Ignore storage failures and keep the in-memory override.
        }
        storedOverride = "on";
    } else if (queryOverride === "off") {
        try {
            window.localStorage.setItem(storageKey, "off");
        } catch (error) {
            // Ignore storage failures and keep the in-memory override.
        }
        storedOverride = "off";
    } else if (queryOverride === "reset") {
        try {
            window.localStorage.removeItem(storageKey);
        } catch (error) {
            // Ignore storage failures and fall back to date-based behavior.
        }
        storedOverride = null;
    }

    var now = new Date();
    var isAprilFools = now.getMonth() === 3 && now.getDate() === 1;

    if (storedOverride === "on") {
        isAprilFools = true;
    } else if (storedOverride === "off") {
        isAprilFools = false;
    }

    if (!isAprilFools) {
        return;
    }

    document.documentElement.classList.add("april-fools-mode");

    if (document.body) {
        document.body.classList.add("april-fools-mode");
    } else {
        document.addEventListener("DOMContentLoaded", function () {
            document.body.classList.add("april-fools-mode");
        }, { once: true });
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/april-fools.css";
    link.dataset.aprilFools = "true";
    document.head.appendChild(link);
}());
