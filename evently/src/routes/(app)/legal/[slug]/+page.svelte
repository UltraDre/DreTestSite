<script>
	import { page } from '$app/state';
	import Icon from '$comp/Icon.svelte';
	import PageHead from '$comp/PageHead.svelte';

	const DOCS = {
		terms: {
			title: 'Terms of service',
			updated: 'Last updated 26 September 2026',
			body: [
				[
					'1. Using Evently',
					'Evently lets you discover events, buy tickets and run your own events. You must be at least 18 to create an account, or have the consent of a parent or guardian. You are responsible for the accuracy of the information you publish and for keeping your login credentials secure.'
				],
				[
					'2. Tickets and entry',
					'A ticket is a revocable licence to attend an event. Each ticket carries a unique, rotating QR code; the first valid scan at the door admits the holder. Screenshots and copied codes are void. Tickets may be transferred for free until check-in unless the organiser disables transfers.'
				],
				[
					'3. Payments and fees',
					'Prices are shown in your selected currency and may include taxes and service fees, which are itemised before you pay. Payments are processed by our payment providers; we never store full card numbers. Payouts to organisers settle on the schedule shown in their dashboard, minus the platform fee.'
				],
				[
					'4. Refunds and cancellations',
					'Refunds follow each event’s refund policy, shown on the event page and on your ticket. If an organiser cancels an event, you receive a full refund of the ticket price automatically. If an event is postponed, your ticket remains valid for the new date and you may request a refund up to 7 days before it.'
				],
				[
					'5. Organiser obligations',
					'Organisers must deliver the event as described, comply with local laws, licensing, safety and accessibility requirements, and honour the refund policy they publish. Organisers are responsible for their own tax obligations on payouts.'
				],
				[
					'6. Your content',
					'You keep ownership of what you post. You grant Evently a non-exclusive licence to host, display and distribute that content so the product can work. You must not post content that is unlawful, misleading, infringing or harmful.'
				],
				[
					'7. Safety and enforcement',
					'We may remove content, suspend accounts, withhold payouts or cancel tickets where we detect fraud, safety risks or breaches of these terms. Serious or repeated breaches may result in permanent removal from the platform.'
				],
				[
					'8. Liability',
					'Evently provides the marketplace and ticketing technology. We are not the organiser of events listed and are not responsible for how an event is run. To the extent permitted by law, our liability is limited to the amount you paid for the affected tickets.'
				],
				[
					'9. Changes and contact',
					'We may update these terms; material changes are announced in-app and by email. Questions: legal@evently.app.'
				]
			]
		},
		privacy: {
			title: 'Privacy policy',
			updated: 'Last updated 26 September 2026',
			body: [
				[
					'What we collect',
					'Account details (name, email, phone), profile information you choose to add, tickets and orders, device and app diagnostics, and — with your permission — precise location, camera (for QR scanning) and notification tokens.'
				],
				[
					'How we use it',
					'To issue and validate tickets, process payments and payouts, personalise event discovery, send service messages (reminders, changes, receipts), keep the platform safe, and improve the product. We do not sell personal data.'
				],
				[
					'Sharing',
					'With the organiser of an event you register for (name, ticket type, check-in status and any registration answers you gave), with payment providers to process transactions, and with service providers who host, message and analyse on our behalf under contract.'
				],
				[
					'Your choices',
					'Control notification channels in Settings, manage location and camera permissions in your device settings, export your data, and delete your account (30-day grace period before permanent erasure).'
				],
				[
					'Retention',
					'Tickets and order records are kept for 7 years for financial and tax compliance. Audit logs are retained for 2 years. Everything else is kept only as long as needed for the purpose it was collected.'
				],
				[
					'Security',
					'Encryption in transit and at rest, scoped staff access with audit logging, rotating QR signatures, and rate-limited authentication. Report suspected vulnerabilities to security@evently.app.'
				],
				[
					'Your rights',
					'Depending on where you live you may have rights of access, correction, deletion, portability and objection (GDPR / NDPA). Email privacy@evently.app and we will respond within 30 days.'
				]
			]
		},
		licenses: {
			title: 'Licenses & attributions',
			updated: 'Version 2.4.0 (build 2418)',
			body: [
				[
					'Product',
					'Evently © 2026. All rights reserved. The Evently name, logo and interface design are trademarks and may not be used without written permission.'
				],
				[
					'Svelte & SvelteKit',
					'MIT License — Copyright (c) 2016-2026 the Svelte contributors. Used under the MIT License.'
				],
				[
					'Vite',
					'MIT License — Copyright (c) 2019-present Evan You & Vite contributors.'
				],
				[
					'qrcode',
					'MIT License — node-qrcode by Ryan Day. Used to render ticket QR codes.'
				],
				[
					'Iconography',
					'Interface icons are original vector artwork drawn on a 24px grid for this product, styled after the Lucide/Feather conventions (ISC/MIT-compatible conventions). No third-party icon fonts are bundled.'
				],
				[
					'Typography',
					'Interface text uses system font stacks (Inter, SF Pro, Segoe UI, Roboto). No web fonts are loaded, so the app renders instantly and works offline.'
				],
				[
					'Maps & directions',
					'Venue coordinates are used to deep-link into the device’s mapping application. Map tiles are not bundled or served by Evently.'
				]
			]
		}
	};

	const doc = $derived(DOCS[page.params.slug] ?? DOCS.terms);
</script>

<div class="page">
	<PageHead title={doc.title} back />

	<div class="shell">
		<p class="tiny muted-2" style="margin:4px 0 14px">{doc.updated}</p>

		<div class="col gap-20">
			{#each doc.body as [h, p]}
				<section>
					<h3 style="margin-bottom:6px">{h}</h3>
					<p class="muted" style="line-height:1.7">{p}</p>
				</section>
			{/each}
		</div>

		<div class="soft pad-16 row gap-10" style="margin-top:26px">
			<Icon name="info" size={17} />
			<div class="col grow">
				<span class="b small">Questions about this document?</span>
				<span class="tiny muted-2">Contact support and we’ll point you to the right clause.</span>
			</div>
			<a class="btn btn-sm btn-outline" href="/support">Get help</a>
		</div>
	</div>
</div>

<style>
	.gap-20 {
		gap: 20px;
	}
</style>
