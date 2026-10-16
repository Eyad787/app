/* Shared by index.html and order.html: fills the footer phone from config. */
(function () {
  'use strict';

  var cfg = window.TIREHUB || {};
  var phone = String(cfg.phone || '').trim();
  var PLACEHOLDER = '01X XXXX XXXX';

  document.querySelectorAll('[data-phone]').forEach(function (el) {
    if (!phone) {
      el.textContent = PLACEHOLDER;
      el.classList.add('is-placeholder');
      return;
    }
    var link = document.createElement('a');
    link.href = 'tel:' + phone.replace(/[^\d+]/g, '');
    link.textContent = phone;
    link.setAttribute('data-phone', '');
    el.replaceWith(link);
  });
})();
