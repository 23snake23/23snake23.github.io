(function () {
  var knownLanguages = ['en-GB'];
  var globalFeedStoreKey = '__homeFeedDatabase';

  function normalizeLanguageTag(value) {
    if (typeof value !== 'string') {
      return '';
    }

    var trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    return trimmed.replace('_', '-');
  }

  function getLanguageFromPathname(pathname) {
    if (typeof pathname !== 'string') {
      return '';
    }

    var match = pathname.match(/\/(en-GB)(?:\/|$)/i);
    return match ? match[1] : '';
  }

  function buildLanguageCandidates(activeScript) {
    var candidates = [];

    function add(value) {
      var normalized = normalizeLanguageTag(value);
      if (normalized && candidates.indexOf(normalized) === -1) {
        candidates.push(normalized);
      }
    }

    add(activeScript && activeScript.getAttribute('data-home-feed-lang'));
    add(document.documentElement.lang);
    add(getLanguageFromPathname(window.location.pathname));
    add('en-GB');

    return candidates.filter(function (lang) {
      return knownLanguages.indexOf(lang) !== -1;
    });
  }

  function fetchFeed(url) {
    return fetch(url, { cache: 'no-store' }).then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load home feed file: ' + url);
      }
      return response.json();
    });
  }

  function getFeedStore() {
    if (!window[globalFeedStoreKey]) {
      window[globalFeedStoreKey] = {};
    }

    return window[globalFeedStoreKey];
  }

  function loadFeedScript(url, lang) {
    return new Promise(function (resolve, reject) {
      var store = getFeedStore();

      if (store[lang]) {
        resolve(store[lang]);
        return;
      }

      var script = document.createElement('script');
      script.src = url;
      script.async = true;

      script.onload = function () {
        var feed = getFeedStore()[lang];

        if (feed) {
          resolve(feed);
          return;
        }

        reject(new Error('Home feed script loaded but no data was registered for ' + lang));
      };

      script.onerror = function () {
        reject(new Error('Failed to load home feed script: ' + url));
      };

      document.head.appendChild(script);
    });
  }

  function loadFeedForLanguage(lang, rootPath) {
    var jsonUrl = rootPath + '/database/home-sections/' + lang + '.json';
    var scriptUrl = rootPath + '/database/home-sections/' + lang + '.js';
    var shouldPreferScript = window.location.protocol === 'file:';

    if (shouldPreferScript) {
      return loadFeedScript(scriptUrl, lang).catch(function () {
        return fetchFeed(jsonUrl);
      });
    }

    return fetchFeed(jsonUrl).catch(function () {
      return loadFeedScript(scriptUrl, lang);
    });
  }

  function loadFirstAvailableFeed(candidates, rootPath) {
    var index = 0;

    function tryNext() {
      if (index >= candidates.length) {
        throw new Error('No home feed file could be loaded. Tried: ' + candidates.join(', '));
      }

      var lang = candidates[index++];
      return loadFeedForLanguage(lang, rootPath).catch(function () {
        return tryNext();
      });
    }

    return tryNext();
  }

  function renderSection(container, items) {
    container.innerHTML = '';

    items.forEach(function (item) {
      var li = document.createElement('li');

      if (item && typeof item.href === 'string' && item.href) {
        var link = document.createElement('a');
        link.href = item.href;

        var text = document.createElement('span');
        text.textContent = item.text || '';
        link.appendChild(text);
        li.appendChild(link);
      } else {
        li.textContent = item && item.text ? item.text : '';
      }

      container.appendChild(li);
    });
  }

  function applyFeed(feed) {
    var containers = document.querySelectorAll('[data-home-feed-section]');

    containers.forEach(function (container) {
      var section = container.getAttribute('data-home-feed-section');
      var items = feed && feed[section];

      if (Array.isArray(items)) {
        renderSection(container, items);
      } else {
        console.warn('Missing home feed section:', section);
      }
    });
  }

  var activeScript = document.currentScript;
  if (!activeScript) {
    return;
  }

  var rootPath = activeScript.getAttribute('data-home-feed-root') || '..';
  var candidates = buildLanguageCandidates(activeScript);

  if (candidates.length === 0) {
    candidates = ['en-GB'];
  }

  function runFeed() {
    loadFirstAvailableFeed(candidates, rootPath)
      .then(applyFeed)
      .catch(function (error) {
        console.error(error.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFeed, { once: true });
  } else {
    runFeed();
  }
})();