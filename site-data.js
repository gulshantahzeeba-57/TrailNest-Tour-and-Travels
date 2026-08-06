/* ============================================
   StreamVault — shared admin data helper
   Handles contact form submissions and plan
   order requests. Backed by localStorage.
   Swap for real API calls when you hook up
   a backend + payment processor.
   ============================================ */
(function (global) {
  const MSG_KEY = 'sv_contact_messages';
  const ORDER_KEY = 'sv_plan_orders';

  function _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function _save(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
      // storage unavailable — fail silently
    }
  }

  function addMessage(msg) {
    const list = _get(MSG_KEY);
    msg.id = 'msg-' + Date.now();
    msg.date = new Date().toISOString().slice(0, 16).replace('T', ' ');
    msg.replied = false;
    list.push(msg);
    _save(MSG_KEY, list);
    return list;
  }

  function getMessages() { return _get(MSG_KEY); }

  function deleteMessage(id) {
    const list = _get(MSG_KEY).filter(function (m) { return m.id !== id; });
    _save(MSG_KEY, list);
    return list;
  }

  function markMessageReplied(id) {
    const list = _get(MSG_KEY);
    const msg = list.find(function (m) { return m.id === id; });
    if (msg) msg.replied = true;
    _save(MSG_KEY, list);
    return list;
  }

  function addOrder(order) {
    const list = _get(ORDER_KEY);
    order.id = 'order-' + Date.now();
    order.date = new Date().toISOString().slice(0, 16).replace('T', ' ');
    order.status = 'Pending payment';
    list.push(order);
    _save(ORDER_KEY, list);
    return list;
  }

  function getOrders() { return _get(ORDER_KEY); }

  function deleteOrder(id) {
    const list = _get(ORDER_KEY).filter(function (o) { return o.id !== id; });
    _save(ORDER_KEY, list);
    return list;
  }

  function updateOrderStatus(id, status) {
    const list = _get(ORDER_KEY);
    const order = list.find(function (o) { return o.id === id; });
    if (order) order.status = status;
    _save(ORDER_KEY, list);
    return list;
  }

  global.SVData = {
    addMessage: addMessage,
    getMessages: getMessages,
    deleteMessage: deleteMessage,
    markMessageReplied: markMessageReplied,
    addOrder: addOrder,
    getOrders: getOrders,
    deleteOrder: deleteOrder,
    updateOrderStatus: updateOrderStatus
  };

  /* ============================================
     Validation helpers
     - emailFormatValid: strict syntax check
     - checkEmailDomain: REAL check — asks Google's
       public DNS-over-HTTPS API whether the domain
       has mail servers (MX records). No API key
       needed, works from any browser. This confirms
       the domain can receive email; it can't confirm
       the specific mailbox exists (that needs a real
       confirmation-email flow with a backend).
     - phonePlausible: catches obviously fake numbers
       (too short/long, all-repeated digits, etc).
       True phone verification needs an SMS OTP
       service (e.g. Twilio) on a backend.
     ============================================ */
  function emailFormatValid(email) {
    const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!pattern.test(email)) return false;
    const domain = email.split('@')[1] || '';
    if (domain.indexOf('..') !== -1) return false;
    const lastPart = domain.split('.').pop();
    return !!(lastPart && lastPart.length >= 2);
  }

  // Returns a Promise<'valid'|'invalid'|'unknown'>.
  // 'unknown' means the check itself failed (offline, blocked, etc.) —
  // callers should NOT reject the user's email in that case.
  function checkEmailDomain(email) {
    const domain = (email.split('@')[1] || '').trim();
    if (!domain) return Promise.resolve('invalid');
    return fetch('https://dns.google/resolve?name=' + encodeURIComponent(domain) + '&type=MX')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.Status === 3) return 'invalid'; // NXDOMAIN — domain doesn't exist
        if (data.Answer && data.Answer.length > 0) return 'valid';
        return 'invalid'; // resolves but has no mail servers
      })
      .catch(function () { return 'unknown'; });
  }

  function phonePlausible(phone) {
    const cleaned = phone.replace(/[\s()-]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(cleaned)) return false;
    const digitsOnly = cleaned.replace(/^\+/, '');
    if (/^(\d)\1+$/.test(digitsOnly)) return false; // e.g. 0000000000
    return true;
  }

  global.SVValidate = {
    emailFormatValid: emailFormatValid,
    checkEmailDomain: checkEmailDomain,
    phonePlausible: phonePlausible
  };
})(window);
