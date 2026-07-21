/**
 * Yalla.House — listings@yalla.house inbound forwarder (Google Apps Script)
 * ------------------------------------------------------------------------
 * Agents paste listings@yalla.house into their property mailouts. That address
 * is a Google Group that delivers into this Workspace mailbox. This script runs
 * on a time trigger, finds new messages sent to listings@yalla.house, and POSTs
 * each one to the Yalla.House inbound webhook, which parses listing candidates
 * into the admin review queue (/admin/listings).
 *
 * Why this instead of a paid inbound-parse vendor: it uses the Google Workspace
 * you already pay for, needs no new account, and needs no DNS/MX change (mail
 * for yalla.house already routes to Google).
 *
 * SETUP (see README.md in this folder for the full runbook):
 *   1. Create the Group listings@yalla.house in Google Admin, with this
 *      mailbox as a member (so the mail lands here).
 *   2. script.google.com → New project → paste this file.
 *   3. Project Settings → Script properties → add:
 *        WEBHOOK_URL     = https://yalla.house/api/inbound/agent-listings
 *        INBOUND_SECRET  = <the shared secret from the Notion access register>
 *   4. Run `forwardListings` once to grant the Gmail/UrlFetch permissions.
 *   5. Triggers (clock icon) → Add trigger → forwardListings →
 *      Time-driven → Minutes timer → Every 5 minutes.
 */

var FORWARDED_LABEL = 'yalla-forwarded';
var SEARCH_QUERY = 'to:listings@yalla.house newer_than:30d -label:' + FORWARDED_LABEL;
var MAX_THREADS = 50;

function forwardListings() {
  var props = PropertiesService.getScriptProperties();
  var webhookUrl = props.getProperty('WEBHOOK_URL');
  var secret = props.getProperty('INBOUND_SECRET');
  if (!webhookUrl || !secret) {
    Logger.log('Missing WEBHOOK_URL or INBOUND_SECRET script properties — aborting.');
    return;
  }

  var label = GmailApp.getUserLabelByName(FORWARDED_LABEL) || GmailApp.createLabel(FORWARDED_LABEL);
  var threads = GmailApp.search(SEARCH_QUERY, 0, MAX_THREADS);
  var sent = 0, failed = 0;

  for (var t = 0; t < threads.length; t++) {
    var thread = threads[t];
    var messages = thread.getMessages();
    var threadOk = true;

    for (var m = 0; m < messages.length; m++) {
      var msg = messages[m];
      var payload = {
        from: msg.getFrom(),
        to: msg.getTo(),
        subject: msg.getSubject(),
        text: msg.getPlainBody(),
        html: msg.getBody(),
        MessageID: msg.getId()          // stable Gmail id — server de-dupes on it
      };
      try {
        var res = UrlFetchApp.fetch(webhookUrl, {
          method: 'post',
          contentType: 'application/json',
          headers: { 'x-inbound-secret': secret },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
        var code = res.getResponseCode();
        if (code >= 200 && code < 300) {
          sent++;
        } else {
          failed++; threadOk = false;
          Logger.log('Webhook ' + code + ' for "' + payload.subject + '": ' + res.getContentText().slice(0, 200));
        }
      } catch (e) {
        failed++; threadOk = false;
        Logger.log('Fetch error for "' + payload.subject + '": ' + e);
      }
    }

    // Only mark the thread done if every message posted OK, so failures retry
    // next run (the server de-dupes, so a re-send of a delivered message is safe).
    if (threadOk) thread.addLabel(label);
  }

  Logger.log('listings forwarder: ' + sent + ' sent, ' + failed + ' failed, ' + threads.length + ' threads scanned');
}
