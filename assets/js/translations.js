// Translation module
const TranslationManager = (function() {
  let currentLanguage = 'en';
  let translations = {};
  
  // Load translations from JSON file
  function loadTranslations(lang) {
    return new Promise((resolve, reject) => {
      // Show loading state
      $('body').addClass('translations-loading');
      
      $.getJSON(`translations/${lang}.json`)
        .done(function(data) {
          translations[lang] = data;
          currentLanguage = lang;
          resolve(data);
        })
        .fail(function(jqxhr, textStatus, error) {
          console.error(`Error loading ${lang} translations:`, error);
          reject(error);
        })
        .always(function() {
          $('body').removeClass('translations-loading');
        });
    });
  }
  
  // Apply translations to the page
  function applyTranslations(translationData) {
    $('[data-key]').each(function() {
      const key = $(this).data('key');
      if (translationData[key]) {
        $(this).html(translationData[key]);
      }
    });
    
    // Update lang attribute on html element
    $('html').attr('lang', currentLanguage);
    
    // Save language preference
    localStorage.setItem('site-lang', currentLanguage);
  }
  
  // Public methods
  return {
    init: function(defaultLang = 'en') {
      const savedLang = localStorage.getItem('site-lang') || defaultLang;
      
      return this.setLanguage(savedLang);
    },
    
    setLanguage: function(lang) {
      if (translations[lang]) {
        // Translations already loaded
        currentLanguage = lang;
        applyTranslations(translations[lang]);
        return Promise.resolve();
      } else {
        // Need to load translations
        return loadTranslations(lang)
          .then(applyTranslations)
          .catch(() => {
            console.warn(`Failed to load ${lang} translations, falling back to English`);
            if (lang !== 'en' && translations['en']) {
              return this.setLanguage('en');
            }
          });
      }
    },
    
    getCurrentLanguage: function() {
      return currentLanguage;
    }
  };
})();