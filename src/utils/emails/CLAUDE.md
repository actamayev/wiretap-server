# Emails Directory

This directory contains email sending utilities for user communications using the Resend email service.

## Structure

```
emails/
├── send-new-user-email.ts       # Welcome email for new registrations
├── send-feedback-email.ts       # Feedback submission confirmation
└── send-launch-email.ts         # Launch/announcement emails
```

## Overview

All email functions:
- Use Resend email service API
- Render React email templates from `../../emails/` directory
- Retrieve API keys from AWS Secrets Manager
- Log successes and errors
- Throw errors on failure (never silent)

**General pattern**:
```typescript
async function sendEmail(data): Promise<void> {
  // 1. Get API key from Secrets Manager
  // 2. Create Resend client
  // 3. Render React email template
  // 4. Send via Resend API
  // 5. Handle errors
}
```

---

## Files

### send-new-user-email.ts
Sends welcome email to newly registered users.

**Function**: `sendNewUserEmail(email: string): Promise<void>`

**Input**: Recipient email address

**Email details**:
- From: `Wiretap <hello@updates.wiretap.pro>`
- Reply-to: `hello@wiretap.pro`
- Template: `WelcomeEmail` component from `../../emails/welcome-email`
- Subject: "Welcome to Wiretap"

**Process**:
1. Retrieve Resend API key from AWS Secrets Manager
2. Initialize Resend client
3. Render `WelcomeEmail()` React component to HTML
4. Send email via Resend API
5. Check for errors and throw if failed

**Error handling**:
- Logs Resend API errors
- Throws with message: "Internal Server Error: Unable to send email"
- Never silently fails

**Usage**:
```typescript
await sendNewUserEmail("user@example.com")
```

**Used by**:
- Auth controllers after successful user registration

---

### send-feedback-email.ts
Forwards user feedback to the team.

**Function**: `sendFeedbackEmail(data: FeedbackEmailData): Promise<void>`

**Input**:
```typescript
interface FeedbackEmailData {
  userEmail: string      // User's email for reply-to
  feedback: string       // User's feedback content
}
```

**Email details**:
- From: `Wiretap <hello@updates.wiretap.pro>`
- Reply-to: User's email (enables team to reply directly)
- To: `hello@wiretap.pro` (company inbox)
- Template: `FeedbackEmail` component with user data
- Subject: `New Wiretap Feedback from {userEmail}`

**Process**:
1. Retrieve Resend API key from AWS Secrets Manager
2. Initialize Resend client
3. Render `FeedbackEmail(data)` component to HTML
4. Send to company inbox
5. Log success or throw on error

**Error handling**:
- Logs "Failed to send feedback email" on API error
- Logs success: "✅ Sent feedback email to hello@wiretap.pro"
- Throws error to caller

**Usage**:
```typescript
await sendFeedbackEmail({
  userEmail: "user@example.com",
  feedback: "Great app, but would like feature X"
})
```

**Used by**:
- Feedback collection endpoints

---

### send-launch-email.ts
Sends announcement/launch emails (implementation pending).

**Purpose**: Bulk email to user list for announcements

**Pattern**:
Similar to other email functions - will use Resend, AWS Secrets Manager, and React email template.

**Note**: Currently not fully documented - examine file for current implementation.

---

## Email Template Architecture

### React Email Templates
Email content defined as React components in `../../emails/`:
- `welcome-email.tsx` - New user welcome
- `feedback-email.tsx` - Feedback forwarding
- Other email templates as needed

### Rendering Process
```typescript
import { render } from "@react-email/render"

// Render component to HTML
const emailHtml = await render(WelcomeEmail())

// Send HTML via Resend
await resend.emails.send({ html: emailHtml, ... })
```

### Benefits
- Consistent email design with React components
- Type-safe email generation
- Reusable email components
- Easy to test and preview

---

## Resend Integration

### Configuration
- **Service**: Resend email sending platform
- **API Key**: Retrieved from AWS Secrets Manager (`RESEND_API_KEY`)
- **From domain**: `updates.wiretap.pro` (verified sender)

### Sending Emails
```typescript
const resend = new Resend(apiKey)
const { error } = await resend.emails.send({
  from: "Sender <sender@updates.wiretap.pro>",
  replyTo: "support@wiretap.pro",
  to: ["recipient@example.com"],
  subject: "Email Subject",
  html: emailHtml
})
```

### Error Handling
- Resend returns `{ error }` in response
- Check for error before considering send successful
- Always throw on error (fail loudly)

---

## Security Considerations

### API Key Management
- Resend API key stored in AWS Secrets Manager
- Never hardcoded or committed to repo
- Retrieved at send time (not cached)

### Email Configuration
- Verified sender domain prevents spoofing
- Reply-to header for user feedback
- No sensitive data in email content

### Error Logging
- Errors logged with context
- No sensitive data in error messages
- Stack traces preserved for debugging

---

## When Adding New Email Types

1. **Create React template** in `../../emails/`
   ```typescript
   export default function MyEmail() {
     return <div>Email content</div>
   }
   ```

2. **Create send function** in this directory
   ```typescript
   export default async function sendMyEmail(data): Promise<void> {
     const apiKey = await SecretsManager.getInstance().getSecret("RESEND_API_KEY")
     const resend = new Resend(apiKey)
     const html = await render(MyEmail(data))
     const { error } = await resend.emails.send({ ... })
     if (error) throw new Error("Failed to send")
   }
   ```

3. **Update documentation**

4. **Call from controller** after triggering event
   ```typescript
   await sendMyEmail(data)
   ```

---

## Related Files
- `../../emails/` - React email template components
- `../../classes/aws/secrets-manager.ts` - Retrieves Resend API key
- `../../controllers/auth/` - Calls sendNewUserEmail
- `../../controllers/misc/` - Calls sendFeedbackEmail
