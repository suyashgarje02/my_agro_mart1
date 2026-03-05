const nodemailer = require("nodemailer")

const createTransporter = () => {
    // Support Gmail, SMTP, or fallback to Ethereal test account
    if (process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === "true",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        })
    }
    // Gmail shortcut
    if (process.env.GMAIL_USER) {
        return nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
        })
    }
    return null
}

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (order, user) => {
    try {
        const transporter = createTransporter()
        if (!transporter) return // No email config — skip silently

        const itemRows = order.items.map(item =>
            `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
        ).join("")

        const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:20px;}
  .card{background:#fff;border-radius:16px;max-width:560px;margin:0 auto;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);}
  .header{background:linear-gradient(135deg,#15803d,#14532d);padding:32px;text-align:center;color:#fff;}
  .header h1{margin:0;font-size:22px;font-weight:800;}
  .header p{margin:8px 0 0;opacity:.8;font-size:14px;}
  .body{padding:32px;}
  .badge{display:inline-block;background:#dcfce7;color:#166534;border-radius:999px;padding:6px 16px;font-size:13px;font-weight:700;margin-bottom:20px;}
  h2{margin:0 0 16px;font-size:17px;color:#111827;}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;}
  th{background:#f3f4f6;padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;}
  .total-row td{font-weight:800;font-size:16px;color:#15803d;border-top:2px solid #e5e7eb;}
  .footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;font-size:12px;color:#6b7280;}
  .btn{display:inline-block;background:#15803d;color:#fff;border-radius:999px;padding:12px 28px;text-decoration:none;font-weight:700;font-size:14px;margin-top:16px;}
</style></head>
<body>
<div class="card">
  <div class="header">
    <div style="font-size:36px;margin-bottom:8px;">🌾</div>
    <h1>Agri Mart</h1>
    <p>The Farmer's Hub · GROW. HARVEST. THRIVE.</p>
  </div>
  <div class="body">
    <div class="badge">✅ Order Confirmed!</div>
    <h2>Hi ${user.name}, your order is placed!</h2>
    <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">Order ID: <strong>#${String(order._id).slice(-6).toUpperCase()}</strong> · ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

    <table>
      <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        ${itemRows}
        <tr><td style="padding:8px 12px;color:#6b7280;font-size:13px">Shipping</td><td></td><td style="padding:8px 12px;text-align:right;color:#6b7280;font-size:13px">${order.shippingCharges === 0 ? "FREE" : "₹" + order.shippingCharges}</td></tr>
        <tr><td style="padding:8px 12px;color:#6b7280;font-size:13px">GST (18%)</td><td></td><td style="padding:8px 12px;text-align:right;color:#6b7280;font-size:13px">₹${order.tax?.toLocaleString()}</td></tr>
        <tr class="total-row"><td style="padding:12px 12px">Grand Total</td><td></td><td style="padding:12px 12px;text-align:right">₹${order.totalAmount?.toLocaleString()}</td></tr>
      </tbody>
    </table>

    <h2 style="margin-top:24px">Delivery Address</h2>
    <p style="color:#374151;font-size:14px;margin:0">
      ${order.shippingAddress?.street}, ${order.shippingAddress?.city},<br>
      ${order.shippingAddress?.state} – ${order.shippingAddress?.zipCode}<br>
      📞 ${order.shippingAddress?.phone}
    </p>

    <div style="text-align:center">
      <a class="btn" href="${process.env.FRONTEND_URL || "http://localhost:3001"}/dashboard">Track Your Order →</a>
    </div>
  </div>
  <div class="footer">© ${new Date().getFullYear()} Agri Mart. All rights reserved.<br>If you have questions, WhatsApp us or reply to this email.</div>
</div>
</body></html>`

        await transporter.sendMail({
            from: `"Agri Mart 🌾" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `✅ Order Confirmed — #${String(order._id).slice(-6).toUpperCase()} | Agri Mart`,
            html,
        })
        console.log(`[Email] Order confirmation sent to ${user.email}`)
    } catch (err) {
        console.error("[Email] Failed to send order confirmation:", err.message)
        // Never throw — email failure should never break the order flow
    }
}

/**
 * Send seller approval/rejection email
 */
const sendSellerStatusEmail = async (user, status, note) => {
    try {
        const transporter = createTransporter()
        if (!transporter) return

        const approved = status === "approved"
        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:20px;}
  .card{background:#fff;border-radius:16px;max-width:520px;margin:0 auto;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);}
  .header{background:linear-gradient(135deg,${approved ? "#15803d,#14532d" : "#dc2626,#991b1b"});padding:32px;text-align:center;color:#fff;}
  .body{padding:32px;}
  .btn{display:inline-block;background:#15803d;color:#fff;border-radius:999px;padding:12px 28px;text-decoration:none;font-weight:700;font-size:14px;margin-top:16px;}
  .footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px;text-align:center;font-size:12px;color:#6b7280;}
</style></head>
<body><div class="card">
  <div class="header"><div style="font-size:36px">${approved ? "🎉" : "❌"}</div><h1 style="margin:8px 0 0;font-size:20px;font-weight:800;">Agri Mart</h1></div>
  <div class="body">
    <h2 style="margin:0 0 12px;color:#111827">Hi ${user.name},</h2>
    <p style="color:#374151;font-size:15px">${approved
                ? "Congratulations! Your seller account has been <strong>approved</strong>. You can now log in and start listing your products on Agri Mart."
                : `Your seller account application has been <strong>reviewed</strong> and could not be approved at this time.${note ? `<br><br><strong>Reason:</strong> ${note}` : ""}`
            }</p>
    ${approved ? `<div style="text-align:center"><a class="btn" href="${process.env.FRONTEND_URL || "http://localhost:3001"}/seller">Go to Seller Dashboard →</a></div>` : ""}
  </div>
  <div class="footer">© ${new Date().getFullYear()} Agri Mart. All rights reserved.</div>
</div></body></html>`

        await transporter.sendMail({
            from: `"Agri Mart 🌾" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
            to: user.email,
            subject: approved ? "🎉 Seller Account Approved — Agri Mart" : "Agri Mart Seller Application Update",
            html,
        })
        console.log(`[Email] Seller status email sent to ${user.email}`)
    } catch (err) {
        console.error("[Email] Failed to send seller status email:", err.message)
    }
}

module.exports = { sendOrderConfirmationEmail, sendSellerStatusEmail }
