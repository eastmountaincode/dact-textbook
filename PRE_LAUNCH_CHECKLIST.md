# Pre-Launch Checklist

## Clerk Dashboard Settings to Verify

### Authentication Settings (Settings → User & Authentication)
- [ ] **Email**: Enabled as sign-in method
- [ ] **Password**: Enabled (if using password auth)
- [ ] **Email verification**: Check if required (affects signup flow)
- [ ] **Client Trust**: DISABLED (or implement 2FA flow in login page)

### Attack Protection (Settings → Attack Protection)
- [ ] **Bot Protection**: Review settings - may block automated testing
- [ ] **CAPTCHA**: Disabled or handled in your forms

### Session Settings (Settings → Sessions)
- [ ] **Session lifetime**: Set appropriately (default is fine for most cases)
- [ ] **Inactivity timeout**: Review if needed

### Restrictions (Settings → Restrictions)
- [ ] **Allowlist/Blocklist**: No unexpected restrictions
- [ ] **Sign-up mode**: "Public" (unless you want invite-only)

### Customization (Configure → Email Templates)
- [ ] **Verification email**: Customize branding if desired
- [ ] **Password reset email**: Customize branding if desired

---

## Supabase Settings to Verify

### Database (production)
- [ ] Run `supabase db reset --linked` to apply latest schema
- [ ] Verify RLS is enabled on all tables (check Table Editor)
- [ ] Seed chapters: `npm run seed-chapters`

### API Settings
- [ ] Note your production URL and anon key for Vercel

---

## Vercel Environment Variables

Required variables:
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - from Clerk dashboard
- [ ] `CLERK_SECRET_KEY` - from Clerk dashboard
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from Supabase API settings
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - from Supabase API settings (for server operations)

---

## Manual Testing Checklist

### New User Flow
- [ ] Visit site as logged-out user
- [ ] Navigate to signup page
- [ ] Fill out signup form with valid data
- [ ] Receive verification email
- [ ] Enter verification code
- [ ] Complete profile questions
- [ ] Redirected to welcome chapter
- [ ] Profile shows in account page

### Returning User Flow
- [ ] Log out
- [ ] Log back in with email/password
- [ ] Redirected to welcome chapter
- [ ] Previous reading progress preserved

### Password Reset Flow
- [ ] Click "Forgot password" on login page
- [ ] Enter email
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Set new password
- [ ] Log in with new password

### Core Features
- [ ] Chapter navigation works
- [ ] Reading time is tracked
- [ ] Search works
- [ ] Theme toggle works (if applicable)
- [ ] Mobile navigation works

### Edge Cases
- [ ] Try signing up with existing email → shows error
- [ ] Try logging in with wrong password → shows error
- [ ] Try accessing protected route when logged out → redirects to login
- [ ] Refresh page while logged in → stays logged in

### Admin Features (if applicable)
- [ ] Admin user can access admin dashboard
- [ ] Non-admin cannot access admin routes

---

## DNS/Domain (Clerk)

- [ ] All 5 CNAME records verified in Clerk dashboard
- [ ] Custom domain working: `clerk.analytics.thephilomath.org`
- [ ] `accounts.analytics.thephilomath.org` accessible

---

## Final Steps

- [ ] Remove test users from production Clerk (if any)
- [ ] Review Clerk usage/billing limits
- [ ] Set up error monitoring (optional: Sentry, LogRocket)
- [ ] Document admin credentials for client handoff
- [ ] Create client documentation for common tasks

---

## Quick Smoke Test Script

After deployment, test these URLs:
1. `https://analytics.thephilomath.org` - homepage loads
2. `https://analytics.thephilomath.org/login` - login page loads
3. `https://analytics.thephilomath.org/signup` - signup page loads
4. `https://analytics.thephilomath.org/chapter/welcome` - redirects to login (protected)
