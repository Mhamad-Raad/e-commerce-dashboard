# Rozhna's Store — Mobile App Screen Prompts (Stitch backlog)

Customer-facing **Flutter** app, designed from the **Rozhna Radiance** Google Stitch project.
Generate screens in that project so they inherit the brand DNA.

- **Stitch project id:** `13945291178289130218` (Rozhna Radiance)
- **Design system (anchor every generation):** `assets/7a1b59fd4a964da39a8e1da866d7ba8a` (**Radiant Retail** — berry/rose `#e31b5d` + champagne gold + coral, Bodoni Moda headlines + Plus Jakarta Sans body, rounded cards, pill buttons, cream surfaces)
- **Device:** MOBILE · **Language:** English LTR (RTL + theming handled in Flutter)
- **Standard app bar everywhere:** "Rozhna's Store" wordmark centered (Bodoni berry); contextual **back** on left, **cart** on right. **Bottom nav** (Home/Shop/Search/Profile) only on main tabs — NOT on auth/OTP/checkout.
- **Approach:** skeleton-first (rough but complete now, polish in Flutter). Stitch "Pro" generations are scarce (~50/mo, unverified) → draft prompts here, fire only when final, prefer `edit_screens`, delete duplicates in the Stitch **web UI** (no delete-screen MCP tool).

## Auth model (important)
Login = **phone (+964) + password**. **WhatsApp is only used to verify the phone number** at sign-up (and likely password reset) — it is NOT the login method. **Guest checkout NOT allowed.** Loyalty/rewards **cut**.

---

## Status legend
✅ generated · 🔧 needs cleanup · ⬜ not yet · ⚪ skip

## Generated so far (2026-06-21)
- ✅ **Login** — `0727e561e6db4773bbffb74f8a90ccd4` (phone + password + forgot + Log in; app-bar cleanup applied, thumbnail lagged). ⚠️ duplicate stale "Continue with WhatsApp" login `2910a53503af4e668203b168ba2b6da9` → delete in Stitch web UI.
- ✅ **Phone Verification (OTP)** — `b7ca21e6eaef48a9ab73ba9ca03ea9e0`
- ✅ **Home (Simple)** — `6c009fd60fe14535ae8afa42bd9d0290`
- ✅ **Create Account** — `575aadc3d5bc46e6a2d04e330c95aa1c`

Pre-existing (original Rozhna Radiance): Home, Home(IQD), Shop, Shop(IQD), Product Details (+IQD), Profile.

---

## Pending prompts (ready to fire)

### ⬜ Forgot password
> Forgot-password screen for Rozhna's Store. App bar: back arrow left, "Rozhna's Store" wordmark centered (Bodoni berry), nothing right. Headline "Reset password" + subtitle "Enter your phone number and we'll send a reset code on WhatsApp." Single phone input with Iraq +964 prefix & flag, floating label, berry focus. Full-width berry pill CTA "Send code". Footer link "Back to log in" in berry. No bottom nav. English LTR. (Leads into the OTP screen, then Set-new-password.)

### ⬜ Set new password
> Set-new-password screen. App bar: back + centered wordmark. Headline "New password" + subtitle "Create a new password for your account." Two rounded fields with eye toggles + berry focus: "New password", "Confirm new password". A small password-rule hint line. Full-width berry pill CTA "Save password". No bottom nav. English LTR.

### ⬜ Cart / Bag  (P0 shopping spine)
> Shopping Cart / Bag screen for Rozhna's Store. App bar: back left, "Bag" or wordmark centered, nothing right. List of 2-3 cart line items, each a row: square product image, brand (Bodoni italic) + product title, unit price in IQD, a quantity stepper (- n +), and a small remove (x) icon. A coupon row: rounded input "Promo code" with a berry "Apply" button. A summary card: Subtotal, Delivery, Discount, and a bold Total in IQD. A full-width berry pill CTA "Checkout". No bottom nav. Include an empty-cart note variant later. English LTR.

### ⬜ Checkout — Address
> Checkout address step for Rozhna's Store. App bar: back + "Checkout" centered. A slim step indicator "Address · Payment · Review" with Address active in berry. A saved-address card (selectable, berry border when selected) showing name, phone, governorate + city + street. A "＋ Add new address" outline button. New-address form fields (rounded, berry focus): Full name, Phone (+964), Governorate (dropdown), City (dropdown), Street/details, optional notes. Full-width berry pill CTA "Continue to payment". No bottom nav. English LTR.

### ⬜ Checkout — Payment
> Checkout payment step. App bar: back + "Checkout" centered. Step indicator with Payment active. Selectable payment-method cards (radio, berry when active): "Cash on delivery", "Card", optionally "Wallet". For Card, show rounded fields: card number, expiry, CVV (skeleton). An order summary mini-row with Total in IQD. Full-width berry pill CTA "Review order". No bottom nav. English LTR.

### ⬜ Checkout — Review / Place order
> Checkout review step. App bar: back + "Checkout" centered. Step indicator with Review active. Sections in cards: Delivery address (with Edit link), Payment method (with Edit link), Items list (thumbnails + qty + price), and a totals breakdown (Subtotal, Delivery, Discount, Total in IQD bold). A full-width berry pill CTA "Place order". No bottom nav. English LTR.

### ⬜ Order confirmation / success
> Order success screen for Rozhna's Store. Centered: a berry circular check icon, headline "Order placed!" (Bodoni), subtitle "Thank you — your order #RZ-1024 is confirmed." A small summary card: order number, total in IQD, estimated delivery. Two buttons: full-width berry pill "Track order" and a text/outline "Continue shopping". No bottom nav. English LTR.

---

## Later batches (draft when we reach them)
Category PLP · Search results + filters/sort · Variant selector (bottom sheet) · Product reviews list + write review · Order history · Order detail + tracking · Addresses CRUD · Payment methods · Wishlist · Notifications center · AI assistant chat · Edit profile · Splash · Language picker · Empty/error/maintenance states.
