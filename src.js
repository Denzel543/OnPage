// Minimal loader: safely load the assistant from static so this file stays syntactically valid
;(function(){
  try {
    var s = document.createElement('script');
    s.src = '/static/assistant.js';
    s.defer = true;
    s.async = true;
    document.head.appendChild(s);
  } catch (e) {
    console.error('Failed to load assistant script', e);
  }
})();