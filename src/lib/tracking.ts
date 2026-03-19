'use client';

import { trackEvent as trackCrm, identifyLead } from '@/lib/tracking-crm';

type TrackingEvent =
	| 'lead_view'
	| 'lead_submit'
	| 'whatsapp_click'
	| 'imovel_view';

type TrackingPayload = Record<string, unknown>;

declare global {
	interface Window {
		dataLayer?: unknown[];
		fbq?: (...args: unknown[]) => void;
		gtag?: (...args: unknown[]) => void;
	}
}

export function trackEvent(event: TrackingEvent, payload: TrackingPayload = {}): void {
	// GTM / dataLayer
	if (typeof window !== 'undefined') {
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({
			event,
			...payload,
		});
	}

	// GA4 fallback (optional)
	if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
		window.gtag('event', event, payload);
	}

	// Meta Pixel fallback (optional)
	if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
		window.fbq('trackCustom', event, payload);
	}

	if (process.env.NODE_ENV !== 'production') {
		// eslint-disable-next-line no-console
		console.debug('[trackEvent]', event, payload);
	}
}

export function trackLeadView(context?: TrackingPayload): void {
	trackEvent('lead_view', context);
}

export function trackLeadSubmit(context?: TrackingPayload): void {
	trackEvent('lead_submit', context);
}

export function trackWhatsappClick(context?: TrackingPayload): void {
	trackEvent('whatsapp_click', context);
	trackCrm('CLICK_WHATSAPP', context ?? {});
	// Cria/atualiza lead para este visitante (identificação mesmo sem formulário)
	identifyLead();
}

export function trackImovelView(context?: TrackingPayload): void {
	trackEvent('imovel_view', context);
}


