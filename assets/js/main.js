(function () {
  "use strict";

  var USERNAME = "spoomyfly";

  // Theme toggle
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    }
  }

  try {
    var saved = localStorage.getItem("theme");
    if (saved) applyTheme(saved);
  } catch (e) {
    /* localStorage unavailable (private mode etc.) */
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Live GitHub stats
  fetch("https://api.github.com/users/" + USERNAME)
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (user) {
      if (!user) return;
      var repos = document.getElementById("stat-repos");
      var followers = document.getElementById("stat-followers");
      if (repos && typeof user.public_repos === "number") repos.textContent = user.public_repos;
      if (followers && typeof user.followers === "number") followers.textContent = user.followers;
    })
    .catch(function () { /* keep static fallback values */ });

  // Live project list
  var grid = document.getElementById("projects-grid");
  var note = document.getElementById("projects-note");

  fetch("https://api.github.com/users/" + USERNAME + "/repos?per_page=100&sort=pushed")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("bad response")); })
    .then(function (repos) {
      if (!Array.isArray(repos) || !grid) return;

      var items = repos
        .filter(function (r) { return !r.fork && r.name !== USERNAME + ".github.io"; })
        .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); })
        .slice(0, 9);

      if (items.length === 0) return;

      grid.innerHTML = "";
      items.forEach(function (repo) {
        var card = document.createElement("article");
        card.className = "card";

        var h3 = document.createElement("h3");
        var a = document.createElement("a");
        a.href = repo.html_url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = repo.name;
        h3.appendChild(a);

        var lang = document.createElement("p");
        lang.className = "card__lang";
        lang.textContent = repo.language || "—";

        var desc = document.createElement("p");
        desc.className = "card__desc";
        desc.textContent = repo.description || "No description provided.";

        var meta = document.createElement("p");
        meta.className = "card__meta";
        var stars = repo.stargazers_count ? "★ " + repo.stargazers_count + " · " : "";
        meta.textContent = stars + "updated " + new Date(repo.pushed_at).toLocaleDateString();

        card.appendChild(h3);
        card.appendChild(lang);
        card.appendChild(desc);
        card.appendChild(meta);
        grid.appendChild(card);
      });

      if (note) note.textContent = "Live list — fetched from the GitHub API, sorted by most recently updated.";
    })
    .catch(function () {
      if (note) note.textContent = "Showing a static snapshot — live GitHub data could not be loaded right now.";
    });
})();
