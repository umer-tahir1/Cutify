import nodemailer from 'nodemailer';
import config from '../config';

// Create transporter
const createTransporter = () => {
  if (!config.email.user || !config.email.pass) {
    console.warn('Email credentials not configured. Emails will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

const transporter = createTransporter();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!transporter) {
      console.log('=== EMAIL (console mode) ===');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('HTML content logged (email service not configured)');
      console.log('============================');
      return true;
    }

    await transporter.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// ==================== EMAIL TEMPLATES ====================

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #fef7f7; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; text-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; }
    .content { padding: 32px; color: #333; line-height: 1.6; }
    .content h2 { color: #e91e8c; font-size: 20px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #ff9a9e 0%, #e91e8c 100%); color: #fff !important; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { background: #fef7f7; padding: 24px; text-align: center; color: #999; font-size: 12px; }
    .order-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .order-table th, .order-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f0f0f0; }
    .order-table th { background: #fef7f7; color: #e91e8c; font-weight: 600; }
    .total-row td { font-weight: 700; border-top: 2px solid #e91e8c; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-confirmed { background: #d1ecf1; color: #0c5460; }
    .status-processing { background: #d4edda; color: #155724; }
    .status-shipped { background: #cce5ff; color: #004085; }
    .status-delivered { background: #d4edda; color: #155724; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Cutify</h1>
      <p>Your favorite cute shopping destination</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Cutify. All rights reserved.</p>
      <p>Spreading cuteness, one delivery at a time 🌸</p>
    </div>
  </div>
</body>
</html>
`;

// Welcome email
export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  const html = baseTemplate(`
    <h2>Welcome to Cutify, ${name}! 🎀</h2>
    <p>We're so happy you've joined our cute community!</p>
    <p>Get ready to discover the most adorable accessories, stationery, home decor, and more.</p>
    <p style="text-align: center;">
      <a href="${config.frontendUrl}" class="btn">Start Shopping ✨</a>
    </p>
    <p>If you have any questions, don't hesitate to reach out to us!</p>
    <p>With love,<br>The Cutify Team 💕</p>
  `);

  return sendEmail({ to: email, subject: 'Welcome to Cutify! 🎀✨', html });
};

// Order confirmation
export const sendOrderConfirmation = async (
  email: string,
  name: string,
  order: {
    orderNumber: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    discount: number;
    shippingCost: number;
    total: number;
    shippingAddress: { fullName: string; street: string; city: string; state: string; zipCode: string };
  }
): Promise<boolean> => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = baseTemplate(`
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${name}, your order has been placed successfully!</p>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    
    <table class="order-table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="2" style="text-align: right;">Subtotal</td>
          <td style="text-align: right;">₹${order.subtotal.toFixed(2)}</td>
        </tr>
        ${order.discount > 0 ? `
        <tr>
          <td colspan="2" style="text-align: right; color: #e91e8c;">Discount</td>
          <td style="text-align: right; color: #e91e8c;">-₹${order.discount.toFixed(2)}</td>
        </tr>` : ''}
        <tr>
          <td colspan="2" style="text-align: right;">Shipping</td>
          <td style="text-align: right;">${order.shippingCost > 0 ? '₹' + order.shippingCost.toFixed(2) : 'FREE'}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2" style="text-align: right;">Total</td>
          <td style="text-align: right;">₹${order.total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <p><strong>Shipping to:</strong><br>
    ${order.shippingAddress.fullName}<br>
    ${order.shippingAddress.street}<br>
    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>

    <p style="text-align: center;">
      <a href="${config.frontendUrl}/orders" class="btn">Track Order</a>
    </p>
  `);

  return sendEmail({ to: email, subject: `Order Confirmed: ${order.orderNumber} 📦✨`, html });
};

// Order status update
export const sendOrderStatusUpdate = async (
  email: string,
  name: string,
  orderNumber: string,
  status: string,
  note?: string
): Promise<boolean> => {
  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed and is being prepared! 🎀',
    processing: 'Your order is being prepared with care! 📦',
    shipped: 'Your order is on its way to you! 🚚',
    delivered: 'Your order has been delivered! Hope you love it! 💕',
    cancelled: 'Your order has been cancelled.',
  };

  const html = baseTemplate(`
    <h2>Order Update 📋</h2>
    <p>Hi ${name},</p>
    <p>${statusMessages[status] || `Your order status has been updated to: ${status}`}</p>
    <p><strong>Order Number:</strong> ${orderNumber}</p>
    <p><strong>New Status:</strong> <span class="status-badge status-${status}">${status}</span></p>
    ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
    <p style="text-align: center;">
      <a href="${config.frontendUrl}/orders" class="btn">View Order Details</a>
    </p>
  `);

  return sendEmail({ to: email, subject: `Order ${orderNumber} - ${status.charAt(0).toUpperCase() + status.slice(1)} 📦`, html });
};

// Password reset email
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<boolean> => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  const html = baseTemplate(`
    <h2>Password Reset Request 🔐</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `);

  return sendEmail({ to: email, subject: 'Password Reset - Cutify 🔐', html });
};

// Admin notification: new order
export const sendAdminNewOrderEmail = async (
  adminEmail: string,
  order: {
    orderNumber: string;
    total: number;
    itemCount: number;
    customerName: string;
    customerEmail: string;
  }
): Promise<boolean> => {
  const html = baseTemplate(`
    <h2>New Order Received! 🛍️</h2>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</p>
    <p><strong>Items:</strong> ${order.itemCount}</p>
    <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
    <p style="text-align: center;">
      <a href="${config.frontendUrl}/admin/orders" class="btn">View in Admin Panel</a>
    </p>
  `);

  return sendEmail({ to: adminEmail, subject: `New Order: ${order.orderNumber} 🛍️`, html });
};
