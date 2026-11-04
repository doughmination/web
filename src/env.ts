/* src/env.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Runtime environment variables, see .env.example. All optional: without the
// SSO ones the admin page reports itself unconfigured, and without the
// Turnstile key the guestbook posts with no captcha.

import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	SSO_ISSUER: { schema: optional, description: 'SSO issuer, defaults to authUrl' },
	SSO_CLIENT_ID: { schema: optional, description: "This site's SSO application client id" },
	SSO_CLIENT_SECRET: { schema: optional, description: "This site's SSO application secret" },
	SESSION_SECRET: {
		schema: (value) => {
			if (value && value.length < 32) throw new Error('SESSION_SECRET must be 32+ characters');
			return optional(value);
		},
		description: 'Signs the admin session cookie'
	},
	GUESTBOOK_ADMIN_KEY: {
		schema: optional,
		description: "Sent as X-Guestbook-Key, one of the API's GUESTBOOK_ADMIN_KEYS"
	},
	PUBLIC_TURNSTILE_SITE_KEY: {
		public: true,
		schema: optional,
		description: 'Cloudflare Turnstile site key for the guestbook form'
	}
});
