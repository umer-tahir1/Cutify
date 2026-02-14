/**
 * Cutify WhatsApp Messaging Service
 *
 * Uses the Meta WhatsApp Cloud API to send automated messages.
 *
 * Setup instructions:
 * 1. Go to https://developers.facebook.com and create an app (Business type)
 * 2. Add WhatsApp product to your app
 * 3. In WhatsApp > Getting Started, get your Phone Number ID and temporary access token
 * 4. For production, generate a permanent System User token
 * 5. Register your business phone number (+923306387976)
 * 6. Create a message template named "welcome_registration" in WhatsApp Manager
 * 7. Set the env variables: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN
 *
 * Message Template (create in Meta Business Manager > WhatsApp > Message Templates):
 *   Name: welcome_registration
 *   Category: UTILITY
 *   Language: en
 *   Body: "Welcome to Cutify, {{1}}! 🎀✨ Your account has been created successfully.
 *          📍 Location: {{2}}
 *          Thank you for joining our kawaii family! 💖
 *          Shop the cutest items at cutify.com"
 *   Variables: {{1}} = customer name, {{2}} = location
 */

import config from '../config';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const BUSINESS_PHONE = '+923306387976';

interface WhatsAppMessagePayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template' | 'text';
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: string;
      parameters: Array<{ type: string; text: string }>;
    }>;
  };
  text?: {
    body: string;
  };
}

interface SendWhatsAppOptions {
  to: string;
  userName: string;
  location?: string;
}

/**
 * Normalize a phone number to WhatsApp format (country code + number, no +, no spaces)
 */
const normalizePhoneNumber = (phone: string): string => {
  // Strip all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, assume Pakistan and prepend 92
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.slice(1);
  }

  // If too short (no country code), prepend 92 (Pakistan)
  if (cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }

  return cleaned;
};

/**
 * Send a welcome WhatsApp message using a pre-approved template.
 * Templates must be approved by Meta before they can be sent to users
 * who haven't messaged you first (Business-Initiated conversations).
 */
export const sendWhatsAppWelcome = async (options: SendWhatsAppOptions): Promise<boolean> => {
  const { to, userName, location } = options;
  const phoneNumberId = config.whatsapp.phoneNumberId;
  const accessToken = config.whatsapp.accessToken;

  // If WhatsApp is not configured, log to console and return
  if (!phoneNumberId || !accessToken) {
    console.log('=== WHATSAPP MESSAGE (console mode — not configured) ===');
    console.log(`To: ${to}`);
    console.log(`From: ${BUSINESS_PHONE}`);
    console.log(`Message: Welcome to Cutify, ${userName}! 🎀✨`);
    console.log(`Your account has been created successfully.`);
    if (location) console.log(`📍 Location: ${location}`);
    console.log(`Thank you for joining our kawaii family! 💖`);
    console.log('========================================================');
    return true;
  }

  const normalizedPhone = normalizePhoneNumber(to);

  try {
    // Attempt to send pre-approved template message first
    const templatePayload: WhatsAppMessagePayload = {
      messaging_product: 'whatsapp',
      to: normalizedPhone,
      type: 'template',
      template: {
        name: 'welcome_registration',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: userName },
              { type: 'text', text: location || 'Not specified' },
            ],
          },
        ],
      },
    };

    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templatePayload),
      }
    );

    const data: any = await response.json();

    if (!response.ok) {
      // If template not found/approved, fall back to text message
      // (text messages only work if user has messaged you within 24 hours)
      if (data.error?.code === 132000 || data.error?.code === 132001) {
        console.warn('WhatsApp template not found, attempting text message fallback...');
        return await sendWhatsAppText(normalizedPhone, userName, location);
      }

      console.error('WhatsApp API error:', JSON.stringify(data.error, null, 2));
      return false;
    }

    console.log(`✅ WhatsApp welcome message sent to ${normalizedPhone} (ID: ${data.messages?.[0]?.id})`);
    return true;
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
};

/**
 * Fallback: Send a plain text WhatsApp message.
 * Note: Text messages can only be sent within a 24-hour customer service window
 * (after the user has messaged you first). For first-contact, use templates.
 */
const sendWhatsAppText = async (
  to: string,
  userName: string,
  location?: string,
): Promise<boolean> => {
  const phoneNumberId = config.whatsapp.phoneNumberId;
  const accessToken = config.whatsapp.accessToken;

  if (!phoneNumberId || !accessToken) return false;

  const message = [
    `🎀 Welcome to Cutify, ${userName}! ✨`,
    ``,
    `Your account has been created successfully! 🎉`,
    location ? `📍 Location: ${location}` : '',
    ``,
    `Thank you for joining our kawaii family! 💖`,
    `Shop the cutest items at cutify.com`,
    ``,
    `— Team Cutify 🌸`,
  ].filter(Boolean).join('\n');

  const payload: WhatsAppMessagePayload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message },
  };

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data: any = await response.json();

    if (!response.ok) {
      console.error('WhatsApp text fallback error:', JSON.stringify(data.error, null, 2));
      return false;
    }

    console.log(`✅ WhatsApp text message sent to ${to} (ID: ${data.messages?.[0]?.id})`);
    return true;
  } catch (error) {
    console.error('WhatsApp text send error:', error);
    return false;
  }
};
