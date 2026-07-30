"use strict";

(function () {
  var KEY = "site-lang";

  function read() {
    var q = new URLSearchParams(window.location.search).get("lang");
    if (q === "zh" || q === "en") return q;
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "zh" || saved === "en") return saved;
    } catch (e) {}
    return (navigator.language || "en").toLowerCase().indexOf("zh") === 0
      ? "zh"
      : "en";
  }

  function apply(lang) {
    var root = document.documentElement;
    root.dataset.lang = lang;
    root.lang = lang === "zh" ? "zh-CN" : "en";
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {}
    var t = document.querySelector("title");
    if (t && t.dataset.zh && t.dataset.en) {
      document.title = lang === "zh" ? t.dataset.zh : t.dataset.en;
    }
  }

  window.addEventListener("DOMContentLoaded", function () {
    apply(read());
    var btn = document.querySelector(".lang-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        apply(document.documentElement.dataset.lang === "zh" ? "en" : "zh");
      });
    }
  });
})();
