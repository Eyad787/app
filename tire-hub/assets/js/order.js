/* order.html: live summary, validation, submit (email via FormSubmit, optional JSON endpoint) */
(function () {
  'use strict';

  var cfg = window.TIREHUB || {};
  var $ = function (id) { return document.getElementById(id); };

  var form = $('orderForm');
  var grid = $('orderGrid');
  var head = $('orderHead');
  var confirmBox = $('confirm');
  var submitBtn = $('submitBtn');
  var formError = $('formError');

  var f = {
    name: $('name'),
    phone: $('phone'),
    governorate: $('governorate'),
    district: $('district'),
    address: $('address'),
    landmark: $('landmark'),
    width: $('width'),
    aspect: $('aspect'),
    rim: $('rim'),
    unsure: $('unsure'),
    date: $('date'),
    notes: $('notes')
  };

  var MIN_QTY = 1;
  var MAX_QTY = 4;
  var qty = 1;
  var attempted = false;
  var sending = false;

  /* ---------- size options ---------- */

  function fillSelect(select, from, to, step, prefix) {
    for (var v = from; v <= to; v += step) {
      var o = document.createElement('option');
      o.value = String(v);
      o.textContent = (prefix || '') + v;
      select.appendChild(o);
    }
  }
  fillSelect(f.width, 155, 315, 10);
  fillSelect(f.aspect, 30, 80, 5);
  fillSelect(f.rim, 13, 22, 1, 'R');

  /* ---------- date: min = today (local) ---------- */

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  f.date.min = todayISO();

  /* ---------- helpers ---------- */

  function val(el) { return el.value.trim(); }

  function radioValue(name) {
    var r = form.querySelector('input[name="' + name + '"]:checked');
    return r ? r.value : '';
  }

  function toLatinDigits(s) {
    return s
      .replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 0x0660); })
      .replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 0x06F0); });
  }

  function qtyText(n) {
    if (n === 1) return 'كاوتش واحد';
    if (n === 2) return '2 كاوتش';
    return n + ' كاوتشات';
  }

  function sizeComplete() {
    return !!(f.width.value && f.aspect.value && f.rim.value);
  }

  function sizeText() {
    return f.width.value + '/' + f.aspect.value + ' R' + f.rim.value;
  }

  function formatDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function whenText() {
    var d = formatDate(f.date.value);
    var slot = radioValue('slot');
    if (d && slot) return d + ' – ' + slot;
    return d || slot;
  }

  function firstName(name) {
    return name.split(/\s+/)[0] || name;
  }

  /* ---------- live summary ---------- */

  function setDD(el, text, ltr) {
    el.textContent = '';
    if (!text) {
      el.textContent = 'لسه';
      el.classList.add('is-empty');
      return;
    }
    el.classList.remove('is-empty');
    if (ltr) {
      var s = document.createElement('span');
      s.className = 'ltr';
      s.textContent = text;
      el.appendChild(s);
    } else {
      el.textContent = text;
    }
  }

  function updateSummary() {
    var size = $('sumSize');
    if (f.unsure.checked) {
      size.textContent = '؟؟؟';
      size.classList.remove('is-empty');
    } else {
      size.textContent = (f.width.value || '---') + '/' + (f.aspect.value || '--') + ' R' + (f.rim.value || '--');
      size.classList.toggle('is-empty', !sizeComplete());
    }
    $('sumQty').textContent = qtyText(qty);

    setDD($('sumName'), val(f.name));
    setDD($('sumPhone'), val(f.phone), true);

    var parts = [val(f.district), f.governorate.value].filter(Boolean);
    setDD($('sumAddress'), parts.join('، '));

    setDD($('sumBrand'), radioValue('brand'));
    setDD($('sumWhen'), whenText());
  }

  /* ---------- quantity stepper ---------- */

  function setQty(n) {
    qty = Math.min(MAX_QTY, Math.max(MIN_QTY, n));
    $('qty').textContent = String(qty);
    $('qtyMinus').disabled = qty <= MIN_QTY;
    $('qtyPlus').disabled = qty >= MAX_QTY;
    updateSummary();
  }
  $('qtyMinus').addEventListener('click', function () { setQty(qty - 1); });
  $('qtyPlus').addEventListener('click', function () { setQty(qty + 1); });

  /* ---------- phone sanitising ---------- */

  f.phone.addEventListener('input', function () {
    var clean = toLatinDigits(f.phone.value).replace(/\D/g, '').slice(0, 11);
    if (clean !== f.phone.value) f.phone.value = clean;
  });

  /* ---------- unsure toggle ---------- */

  function applyUnsure() {
    var off = f.unsure.checked;
    [f.width, f.aspect, f.rim].forEach(function (s) { s.disabled = off; });
  }
  f.unsure.addEventListener('change', function () {
    applyUnsure();
    if (attempted) { check('size'); check('notes'); }
  });

  /* ---------- validation ---------- */

  var rules = {
    name: {
      el: f.name,
      test: function () { return val(f.name).length >= 3; },
      msg: 'اكتب اسمك (3 حروف على الأقل).'
    },
    phone: {
      el: f.phone,
      test: function () { return /^01[0125][0-9]{8}$/.test(val(f.phone)); },
      msg: 'اكتب رقم موبايل مصري من 11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015.'
    },
    governorate: {
      el: f.governorate,
      test: function () { return !!f.governorate.value; },
      msg: 'اختار المحافظة.'
    },
    district: {
      el: f.district,
      test: function () { return val(f.district).length >= 2; },
      msg: 'اكتب المنطقة أو الحي.'
    },
    address: {
      el: f.address,
      test: function () { return val(f.address).length >= 6; },
      msg: 'اكتب العنوان بالتفصيل عشان الفني يوصل.'
    },
    size: {
      el: function () {
        return [f.width, f.aspect, f.rim].filter(function (s) { return !s.value; })[0] || f.width;
      },
      inputs: [f.width, f.aspect, f.rim],
      test: function () { return f.unsure.checked || sizeComplete(); },
      msg: 'اختار العرض والارتفاع ومقاس الجنط، أو علّم إنك مش عارف المقاس.'
    },
    date: {
      el: f.date,
      test: function () { return !!f.date.value && f.date.value >= f.date.min; },
      msg: 'اختار اليوم المناسب.'
    },
    notes: {
      el: f.notes,
      test: function () { return !f.unsure.checked || val(f.notes).length > 0; },
      msg: 'اكتب نوع العربية وموديلها في الملاحظات عشان نحدد المقاس.'
    }
  };
  var order = ['name', 'phone', 'governorate', 'district', 'address', 'size', 'date', 'notes'];

  function check(key) {
    var r = rules[key];
    var ok = r.test();
    var err = $('err-' + key);
    err.textContent = ok ? '' : r.msg;
    err.hidden = ok;
    (r.inputs || [r.el]).forEach(function (el) {
      if (ok) el.removeAttribute('aria-invalid');
      else el.setAttribute('aria-invalid', 'true');
    });
    if (r.inputs && !ok) {
      // only flag the empty parts of the size
      r.inputs.forEach(function (el) {
        if (el.value) el.removeAttribute('aria-invalid');
      });
    }
    return ok;
  }

  function validateAll() {
    var firstBad = null;
    order.forEach(function (key) {
      if (!check(key) && !firstBad) firstBad = key;
    });
    return firstBad;
  }

  function focusField(key) {
    var r = rules[key];
    var el = typeof r.el === 'function' ? r.el() : r.el;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var target = el.closest('.field') || el;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    el.focus({ preventScroll: true });
  }

  // which rule(s) each input belongs to
  var owner = {
    name: ['name'], phone: ['phone'], governorate: ['governorate'],
    district: ['district'], address: ['address'],
    width: ['size'], aspect: ['size'], rim: ['size'],
    date: ['date'], notes: ['notes']
  };

  function revalidateFor(el, onlyIfShown) {
    var keys = owner[el.id];
    if (!attempted || !keys) return;
    keys.forEach(function (k) {
      if (onlyIfShown && $('err-' + k).hidden) return;
      check(k);
    });
  }

  form.addEventListener('input', function (e) {
    updateSummary();
    revalidateFor(e.target, true);
  });
  form.addEventListener('change', function (e) {
    updateSummary();
    revalidateFor(e.target, e.target.tagName !== 'SELECT' && e.target.type !== 'date');
  });
  form.addEventListener('focusout', function (e) { revalidateFor(e.target, false); });

  /* ---------- submit ---------- */

  function collect() {
    var unsure = f.unsure.checked;
    return {
      name: val(f.name),
      phone: val(f.phone),
      governorate: f.governorate.value,
      district: val(f.district),
      address: val(f.address),
      landmark: val(f.landmark),
      sizeUnknown: unsure,
      width: unsure ? '' : f.width.value,
      aspect: unsure ? '' : f.aspect.value,
      rim: unsure ? '' : 'R' + f.rim.value,
      size: unsure ? 'مش عارف المقاس (هيتحدد من نوع العربية)' : sizeText(),
      quantity: qty,
      quantityText: qtyText(qty),
      brand: radioValue('brand') || 'أي ماركة',
      date: f.date.value,
      slot: radioValue('slot'),
      when: whenText(),
      notes: val(f.notes)
    };
  }

  function buildMessage(d, ref) {
    var lines = [
      'طلب تغيير كاوتش — ' + ref,
      'الاسم: ' + d.name,
      'الموبايل: ' + d.phone,
      'العنوان: ' + [d.governorate, d.district, d.address].join('، ')
    ];
    if (d.landmark) lines.push('علامة مميزة: ' + d.landmark);
    lines.push(
      'المقاس: ' + d.size,
      'العدد: ' + d.quantityText,
      'الماركة: ' + d.brand,
      'الميعاد: ' + d.when
    );
    if (d.notes) lines.push('ملاحظات: ' + d.notes);
    return lines.join('\n');
  }

  function setSending(on) {
    sending = on;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'بيتبعت…' : 'ابعت الطلب';
  }

  function showConfirmation(d, ref) {
    var msg = $('confirmMsg');
    msg.textContent = '';
    var add = function (text, bold) {
      var n = bold ? document.createElement('b') : document.createTextNode(text);
      if (bold) n.textContent = text;
      msg.appendChild(n);
    };
    add('شكرًا يا ' + firstName(d.name) + '. ');
    if (d.sizeUnknown) {
      add('طلبت ');
      add(d.quantityText, true);
      add('، والمقاس هنحدده معاك من نوع العربية. ');
    } else {
      add('طلبت ');
      add(d.quantityText, true);
      add(' مقاس ');
      var s = document.createElement('b');
      s.className = 'sw';
      s.textContent = d.size;
      msg.appendChild(s);
      add('. ');
    }
    add('هنتصل بيك على ');
    var p = document.createElement('b');
    p.dir = 'ltr';
    p.textContent = d.phone;
    msg.appendChild(p);
    add(' عشان نأكد العنوان والميعاد.');

    $('confirmRef').textContent = ref;

    grid.hidden = true;
    head.hidden = true;
    confirmBox.hidden = false;
    window.scrollTo(0, 0);
    confirmBox.focus({ preventScroll: true });
  }

  function postJSON(url, payload) {
    // Google Apps Script can't answer a CORS preflight, so send it as a "simple" request
    var simple = /script\.google(usercontent)?\.com/.test(url);
    return fetch(url, {
      method: 'POST',
      headers: simple
        ? { 'Content-Type': 'text/plain;charset=utf-8' }
        : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res;
    });
  }

  // Emails the order to config.email through FormSubmit (no account needed;
  // the very first order sends an activation link to that inbox).
  function sendEmail(to, d, ref, message) {
    var fields = {
      _subject: 'طلب تغيير كاوتش جديد — ' + ref,
      _template: 'table',
      _captcha: 'false',
      'رقم الطلب': ref,
      'الاسم': d.name,
      'الموبايل': d.phone,
      'المحافظة': d.governorate,
      'المنطقة': d.district,
      'العنوان': d.address,
      'علامة مميزة': d.landmark || '—',
      'المقاس': d.size,
      'العدد': d.quantityText,
      'الماركة': d.brand,
      'الميعاد': d.when,
      'ملاحظات': d.notes || '—',
      'الرسالة كاملة': message
    };
    return postJSON('https://formsubmit.co/ajax/' + encodeURIComponent(to), fields)
      .then(function (res) { return res.json(); })
      .then(function (body) {
        if (body && String(body.success) === 'false') throw new Error(body.message || 'not sent');
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    attempted = true;
    formError.hidden = true;

    var bad = validateAll();
    if (bad) { focusField(bad); return; }

    var d = collect();
    var ref = 'TH-' + String(Date.now()).slice(-6);
    var message = buildMessage(d, ref);


    var finish = function () {
      showConfirmation(d, ref);
    };

    var requests = [];
    var email = String(cfg.email || '').trim();
    if (email) requests.push(sendEmail(email, d, ref, message));
    var endpoint = String(cfg.formEndpoint || '').trim();
    if (endpoint) requests.push(postJSON(endpoint, Object.assign({ ref: ref, message: message }, d)));
    if (!requests.length) { finish(); return; }

    setSending(true);
    Promise.all(requests)
      .then(function () {
        setSending(false);
        finish();
      })
      .catch(function () {
        setSending(false);
        formError.textContent = 'الطلب ما اتبعتش بسبب مشكلة في الاتصال. اتأكد من النت وجرّب تاني.';
        formError.hidden = false;
        formError.scrollIntoView({ block: 'center' });
      });
  });

  /* ---------- new order ---------- */

  $('newOrder').addEventListener('click', function () {
    form.reset();
    attempted = false;
    formError.hidden = true;
    order.forEach(function (k) {
      var err = $('err-' + k);
      err.hidden = true;
      err.textContent = '';
    });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    f.date.min = todayISO();
    applyUnsure();
    setQty(1);
    confirmBox.hidden = true;
    head.hidden = false;
    grid.hidden = false;
    window.scrollTo(0, 0);
    f.name.focus({ preventScroll: true });
  });

  /* ---------- init ---------- */

  applyUnsure();
  setQty(1);
})();
