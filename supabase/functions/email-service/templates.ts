
const SHARED_STYLES = `
  body { background-color: #fdf8f4; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; margin: 0; padding: 40px 0; color: #292800; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid rgba(41,40,0,0.08); border-radius: 16px; overflow: hidden; }
  .header { background-color: #292800; padding: 32px 40px; text-align: center; }
  .logo { font-family: 'Georgia', serif; font-size: 28px; font-style: italic; color: #E0AEBA; margin: 0; letter-spacing: 0.04em; }
  .tagline { color: rgba(253,248,244,0.45); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 6px 0 0; }
  .content { padding: 48px 40px; }
  .heading { font-family: 'Georgia', serif; font-size: 28px; font-weight: 400; color: #292800; margin: 0 0 24px; line-height: 1.3; }
  .body-text { font-size: 15px; color: #4a3f35; line-height: 1.75; margin: 0 0 16px; }
  .button { background-color: #292800; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; display: inline-block; margin-top: 24px; }
  .footer { padding: 24px 40px; background-color: #faf6f3; text-align: center; border-top: 1px solid rgba(41,40,0,0.08); }
  .footer-text { font-size: 11px; color: rgba(41,40,0,0.45); letter-spacing: 0.08em; margin: 4px 0; }
  .highlight-box { background-color: #FDF8F4; border: 1px solid rgba(139,38,62,0.1); padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center; }
`;

export const getOrderConfirmationTemplate = (data: { orderId: string, total: number, itemsCount: number, customerEmail: string }) => `
<!DOCTYPE html>
<html>
<head><style>${SHARED_STYLES}</style></head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Studio TFA</div>
      <div class="tagline">Intentional Art, Rooted in Faith</div>
    </div>
    <div class="content">
      <h1 class="heading">Your order is confirmed.</h1>
      <p class="body-text">Hi there,</p>
      <p class="body-text">Thank you for shopping with Studio TFA. We've received your order <strong>#${data.orderId.slice(0, 8).toUpperCase()}</strong> and are preparing it with love and care.</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #8B263E; text-transform: uppercase; letter-spacing: 0.2em;">Order Summary</p>
        <p style="margin: 12px 0 4px; font-size: 20px; font-weight: 700;">${data.itemsCount} Items</p>
        <p style="margin: 0; font-size: 14px; color: #6b5c4e;">Total: ₹${data.total.toLocaleString('en-IN')}</p>
      </div>

      <p class="body-text">We'll send you another update with a tracking number once your package is on its way.</p>
    </div>
    <div class="footer">
      <p class="footer-text">Studio TFA · Bengaluru, India</p>
      <p class="footer-text">Christ First, Always.</p>
    </div>
  </div>
</body>
</html>
`;

export const getShippingNotificationTemplate = (data: { orderId: string, trackingNumber: string, customerName: string }) => `
<!DOCTYPE html>
<html>
<head><style>${SHARED_STYLES}</style></head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Studio TFA</div>
      <div class="tagline">The Fearlessly Authentic</div>
    </div>
    <div class="content">
      <h1 class="heading">Your order has shipped.</h1>
      <p class="body-text">Hi ${data.customerName},</p>
      <p class="body-text">Great news! Your order <strong>#${data.orderId.slice(0, 8).toUpperCase()}</strong> has left the studio and is currently on its way to you.</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #8B263E; text-transform: uppercase; letter-spacing: 0.2em;">Tracking Number</p>
        <p style="margin: 12px 0; font-size: 24px; font-family: monospace; font-weight: 700; letter-spacing: 0.1em;">${data.trackingNumber}</p>
        <a href="https://studiotfa.com/orders/${data.orderId}" class="button">Track Package</a>
      </div>

      <p class="body-text">Please allow 24-48 hours for the tracking information to update.</p>
    </div>
    <div class="footer">
      <p class="footer-text">Studio TFA · Bengaluru, India</p>
    </div>
  </div>
</body>
</html>
`;

export const getAbandonedCartTemplate = (data: { customerName: string, cartUrl: string }) => `
<!DOCTYPE html>
<html>
<head><style>${SHARED_STYLES}</style></head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Studio TFA</div>
      <div class="tagline">Something Beautiful Awaits</div>
    </div>
    <div class="content">
      <h1 class="heading">You left something beautiful behind.</h1>
      <p class="body-text">Hi ${data.customerName || 'there'},</p>
      <p class="body-text">We noticed you left some pieces in your cart. At Studio TFA, every piece is created with intention and curated to bring beauty into your space.</p>
      <p class="body-text">Don't miss out on these unique items. Your cart is still waiting for you.</p>
      
      <div style="text-align: center;">
        <a href="${data.cartUrl}" class="button">Return to your Cart</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">Studio TFA · Bengaluru, India</p>
    </div>
  </div>
</body>
</html>
`;

export const getAdminCommissionTemplate = (data: { customerName: string, vision: string, price: number, adminUrl: string }) => `
<!DOCTYPE html>
<html>
<head><style>${SHARED_STYLES}</style></head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Studio TFA</div>
      <div class="tagline">New Commission Alert</div>
    </div>
    <div class="content">
      <h1 class="heading">New custom commission request.</h1>
      <p class="body-text">A new commission has been submitted by <strong>${data.customerName}</strong>.</p>
      
      <div class="highlight-box" style="text-align: left;">
        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #8B263E; text-transform: uppercase;">Vision</p>
        <p style="margin: 8px 0 16px; font-size: 14px; line-height: 1.6; color: #4a3f35;">"${data.vision}"</p>
        
        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #8B263E; text-transform: uppercase;">Estimated Price</p>
        <p style="margin: 8px 0; font-size: 18px; font-weight: 700;">₹${data.price.toLocaleString('en-IN')}</p>
      </div>

      <div style="text-align: center;">
        <a href="${data.adminUrl}" class="button">Open Admin Kanban</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const getReviewReplyTemplate = (data: { customerName: string, reply: string, productUrl: string }) => `
<!DOCTYPE html>
<html>
<head><style>${SHARED_STYLES}</style></head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Studio TFA</div>
      <div class="tagline">A Message from the Artist</div>
    </div>
    <div class="content">
      <h1 class="heading">Sherlin replied to your review.</h1>
      <p class="body-text">Hi ${data.customerName},</p>
      <p class="body-text">Thank you so much for sharing your thoughts on your recent purchase. Sherlin has personally responded to your review:</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-style: italic; color: #4a3f35; line-height: 1.8;">"${data.reply}"</p>
      </div>

      <div style="text-align: center;">
        <a href="${data.productUrl}" class="button">View Product Page</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">Studio TFA · Bengaluru, India</p>
    </div>
  </div>
</body>
</html>
`;

export const getGiftCardTemplate = (data: { customerName: string, code: string, value: number, expiryDate: string }) => `
<!DOCTYPE html>
<html>
<head><style>${SHARED_STYLES}</style></head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Studio TFA</div>
      <div class="tagline">A Gift of Authenticity</div>
    </div>
    <div class="content" style="text-align: center;">
      <h1 class="heading">Someone sent you a gift!</h1>
      <p class="body-text">Hi there,</p>
      <p class="body-text">You've received a Studio TFA Digital Gift Card. Use it to bring home something that speaks to your soul.</p>
      
      <div style="background: linear-gradient(135deg, #292800 0%, #4a4900 100%); padding: 40px; border-radius: 20px; color: #E0AEBA; margin: 32px 0;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; color: rgba(224,174,186,0.6);">Gift Card Value</p>
        <p style="margin: 8px 0 24px; font-size: 36px; font-weight: 700; color: #ffffff;">₹${data.value.toLocaleString('en-IN')}</p>
        
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; color: rgba(224,174,186,0.6);">Your Unique Code</p>
        <p style="margin: 8px 0 0; font-size: 24px; font-family: monospace; font-weight: 700; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; border: 1px dashed rgba(224,174,186,0.3); color: #ffffff;">${data.code}</p>
      </div>

      <p class="body-text" style="font-size: 13px; color: #9CA3AF;">Expires on: ${data.expiryDate}</p>
      
      <a href="https://studiotfa.com/collections/all" class="button">Start Shopping</a>
    </div>
    <div class="footer">
      <p class="footer-text">Studio TFA · Bengaluru, India</p>
    </div>
  </div>
</body>
</html>
`;
