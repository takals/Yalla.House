/* ============================================================
   YALLA.HOUSE — App JS
   Dashboard navigation + shared utilities
   ============================================================ */

'use strict';

/* ── Toast Notification System ── */
function showToast(msg, type) {
  type = type || 'success';
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { t.classList.add('show'); });
  });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { t.remove(); }, 350);
  }, 2600);
}

/* ── Dashboard View Switcher ── */
function showView(viewId, triggerEl) {
  document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });

  const target = document.getElementById('view-' + viewId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.sidebar-link').forEach(function (link) { link.classList.remove('active'); });
  if (triggerEl) triggerEl.classList.add('active');

  var _lang = (typeof localStorage !== 'undefined' && localStorage.getItem('yh_lang')) || 'en';
  var _t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[_lang]) || {};
  var titles = {
    dashboard: _t['dnav.dashboard']      || 'Dashboard',
    listings:  _t['dash.nav.listings']   || 'My Listings',
    inquiries: _t['dash.nav.inquiries']  || 'Buyer Inquiries',
    inbox:     _t['dnav.inbox']          || 'Inbox',
    analytics: _t['dash.nav.analytics']  || 'Analytics',
    documents: _t['dash.nav.documents']  || 'Documents',
    calendar:  _t['dash.nav.calendar']   || 'Viewing Calendar',
    settings:  _t['dnav.settings']       || 'Settings',
  };
  const titleEl = document.getElementById('topbar-title');
  if (titleEl && titles[viewId]) titleEl.textContent = titles[viewId];

  const rail = document.getElementById('app-rail');
  if (rail) {
    const showRail = viewId === 'dashboard' || viewId === 'calendar';
    rail.style.display = showRail ? '' : 'none';
  }

  const canvas = document.querySelector('.app-canvas');
  if (canvas) canvas.scrollTop = 0;

  history.replaceState(null, '', '#' + viewId);
}

/* ── Owner Dashboard Interactions ── */
function initDashboardInteractions() {

  // Generic delegation for demo buttons
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button, a.btn');
    if (!btn) return;
    const txt = btn.textContent.trim();

    if (txt === 'Confirm' || txt.includes('Confirm Viewing')) {
      showToast('Viewing confirmed and buyer notified');
    } else if (txt === 'Decline') {
      showToast('Viewing declined', 'error');
    } else if (txt === 'Approve Offer' || txt === 'Accept') {
      showToast('Offer accepted — conveyancing checklist sent');
    } else if (txt === 'Reject' || txt === 'Reject Offer') {
      showToast('Offer declined — buyer notified', 'error');
    } else if (txt === 'Download' || txt === 'Upload Document') {
      showToast('Download started');
    } else if (txt === 'Upload') {
      showToast('Upload panel would open here', 'info');
    } else if (txt.includes('Add Availability')) {
      showToast('Availability slot added');
    } else if (txt === 'Save Changes' || txt === 'Save Settings' || txt === 'Change') {
      showToast('Changes saved');
    } else if (txt === 'Export CSV' || txt === 'Request Export') {
      showToast('Export queued — you\'ll receive an email when ready');
    } else if (txt === 'Edit Listing') {
      showToast('Listing editor opening…', 'info');
    } else if (txt === 'View Offers' || txt === 'View Offer') {
      const link = document.querySelector('.sidebar-link[onclick*="inquiries"]');
      showView('inquiries', link);
    } else if (txt === 'Review Offer') {
      showToast('Opening offer review…', 'info');
    } else if (txt === 'View Details' || txt === 'View Thread') {
      showToast('Loading details…', 'info');
    } else if (txt === 'Enable 2FA') {
      showToast('2FA setup email sent to your inbox', 'info');
    } else if (txt === 'My Listings') {
      const link = document.querySelector('.sidebar-link[onclick*="listings"]');
      showView('listings', link);
    } else if (txt.includes('New Inquiries') || txt.includes('Buyer Inquiries')) {
      const link = document.querySelector('.sidebar-link[onclick*="inquiries"]');
      showView('inquiries', link);
    } else if (txt === 'Viewing Calendar') {
      const link = document.querySelector('.sidebar-link[onclick*="calendar"]');
      showView('calendar', link);
    } else if (txt === 'Add a Listing') {
      window.location = '../list.html';
    /* inquiry filter tabs */
    } else if (txt === 'All (8)') {
      showToast('Showing all inquiries', 'info');
    } else if (txt.includes('Viewing Requests')) {
      showToast('Showing viewing requests', 'info');
    } else if (txt === 'Offers (3)') {
      showToast('Showing offers', 'info');
    } else if (txt.includes('Enquiries')) {
      showToast('Showing enquiries', 'info');
    /* pagination */
    } else if (txt === '← Prev' || txt === 'Next →') {
      showToast('Page navigation', 'info');
    } else if (txt === 'Book Viewing') {
      showToast('Viewing request sent to Sarah B.', 'success');
    } else if (txt === 'Send') {
      var inboxReply = document.getElementById('inbox-reply');
      if (btn.id === 'inbox-send-btn' || btn.closest('#view-inbox')) {
        if (inboxReply && inboxReply.value.trim()) {
          showToast('Message sent', 'success');
          inboxReply.value = '';
          inboxReply.style.height = '';
        }
      } else {
        var textarea = btn.closest('.msg-composer, form')
                         && btn.closest('.msg-composer, form').querySelector('textarea');
        if (textarea && textarea.value.trim()) {
          appendMessage(btn, textarea.value.trim());
          textarea.value = '';
          textarea.style.height = '';
          showToast('Message sent');
        }
      }
    }
  });
}

/* ── Append a message bubble to an inbox thread ── */
function appendMessage(btn, text) {
  const thread = btn.closest('.section-card, [id^="view-"]') &&
                 (btn.closest('.section-card, [id^="view-"]').querySelector('.msg-thread'));
  if (!thread) return;
  const now = new Date();
  const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
  const bubble = document.createElement('div');
  bubble.style.alignSelf = 'flex-end';
  bubble.style.textAlign = 'right';
  bubble.innerHTML =
    '<div class="msg-bubble outbound">' + escHtml(text) + '</div>' +
    '<div class="msg-meta" style="text-align:right;">You &middot; ' + timeStr + '</div>';
  thread.appendChild(bubble);
  thread.scrollTop = thread.scrollHeight;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Init dashboard on DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  const hash = window.location.hash.replace('#', '');
  const validViews = ['dashboard', 'listings', 'inquiries', 'inbox', 'analytics', 'documents', 'calendar', 'settings'];
  const startView = validViews.includes(hash) ? hash : 'dashboard';
  const triggerEl = document.querySelector('.sidebar-link[onclick*="' + startView + '"]');
  showView(startView, triggerEl);

  initDashboardInteractions();
});
