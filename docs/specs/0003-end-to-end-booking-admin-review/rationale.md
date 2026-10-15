# Rationale: 0003. End to end booking & admin review

## Context

Braids by Helen operates in Ibadan, Oyo State, Nigeria, where WhatsApp is the primary commercial channel for customer conversation, styling consultations, and deposit confirmations.

While Feature 2 established the backend persistence schema and authentication foundations, the operational loop between a customer submitting a request and Helen acting on that request is incomplete. Customers need immediate feedback with clear reference codes after booking, and Helen needs a structured review workspace where she can view client details, confirm slots, propose alternative times, decline conflicting requests with clear reasons, and contact clients immediately.

Building this communication workflow without introducing paid cloud messaging services, Meta developer verifications, or complex phone gateways is essential for keeping operating expenses at zero Naira.

## Options considered

### Option 1: Direct Supabase persistence with prefilled wa.me WhatsApp links and interactive review modals

Store booking requests directly in Supabase with pending status. Provide Helen with an authenticated dashboard featuring action buttons for Confirm, Reschedule, and Decline. Each action updates database state and opens WhatsApp with tailored, prefilled message templates.

**Pros**:
- Zero recurring cost: uses standard public WhatsApp web and mobile URLs (`https://wa.me/...`).
- No Facebook or Meta Business Cloud API verification required.
- Keeps Helen in personal control: she can inspect or personalize the message text before clicking send.
- Structured modal dialogs capture concrete reschedule dates and decline reasons, maintaining audit history.

**Cons**:
- Sending the WhatsApp message requires Helen to click the link and hit send, rather than dispatching silently in the background.

### Option 2: Meta WhatsApp Business Cloud API automated messaging

Integrate Meta Graph API to send automated WhatsApp template messages upon status changes directly from a server webhook.

**Pros**:
- Messages dispatch automatically without Helen needing to open WhatsApp.

**Cons**:
- Incurs per conversation messaging fees in US dollars or Naira.
- Requires registered business entity verification and Meta developer approval.
- Rigid template approval process limits custom messages and informal Nigerian salon conversational style.
- Exceeds the zero budget and zero maintenance constraints of the master project brief.

### Option 3: Manual copy and paste clipboard workflow

Present customer telephone numbers on appointment cards without automated template generation, requiring Helen to manually copy numbers, create contacts, and write text messages.

**Pros**:
- Simplest code implementation with minimal utility functions.

**Cons**:
- Error prone and slow during busy salon hours in Ibadan.
- Inconsistent client communication without standardized confirmation or reschedule templates.

## Rationale

We choose Option 1. In Nigeria, hair salon clients expect prompt, friendly, and personal WhatsApp communication. Generating prefilled `wa.me` links with structured templates gives Helen the speed of automation with the personal touch of direct owner chat, while incurring zero monthly cost. Pairing this with database state transitions guarantees reliable appointment tracking and prevents double bookings under Policy B.
