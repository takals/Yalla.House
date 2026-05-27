/**
 * MQL → Slack ping.
 *
 * Triggered by `marketing/mql.created` event, fired by the HubSpot webhook
 * handler (apps/web/src/app/api/webhooks/hubspot/route.ts) when a contact
 * crosses lifecyclestage = marketingqualifiedlead.
 *
 * Posts a formatted Slack message to SLACK_MQL_WEBHOOK_URL. Skip silently
 * if the URL isn't configured (dev / pre-launch).
 */

import { inngest } from '@/lib/inngest/client'

const WEBHOOK = process.env['SLACK_MQL_WEBHOOK_URL']
const HUBSPOT_BASE = 'https://app-eu1.hubspot.com/contacts/148557344/record/0-1'

export const mqlSlackNotify = inngest.createFunction(
  { id: 'marketing.mql.slack-notify', retries: 2 },
  { event: 'marketing/mql.created' },
  async ({ event, step }) => {
    if (!WEBHOOK) {
      return { skipped: true, reason: 'SLACK_MQL_WEBHOOK_URL not set' }
    }

    const { contactId, email, firstName, lastName, role, market, source } = event.data
    const name = [firstName, lastName].filter(Boolean).join(' ') || email

    const message = {
      text: `🟠 New MQL: ${name}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `🟠 New MQL — ${name}` },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Email*\n${email}` },
            { type: 'mrkdwn', text: `*Persona*\n${role ?? '—'}` },
            { type: 'mrkdwn', text: `*Market*\n${market ?? '—'}` },
            { type: 'mrkdwn', text: `*Source*\n${source ?? '—'}` },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Open in HubSpot' },
              url: `${HUBSPOT_BASE}/${contactId}`,
              style: 'primary',
            },
          ],
        },
      ],
    }

    await step.run('post-to-slack', async () => {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })
      if (!res.ok) {
        throw new Error(`Slack webhook returned ${res.status}`)
      }
    })

    return { sent: true, contactId }
  },
)
