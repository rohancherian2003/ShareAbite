const nodemailer = require("nodemailer");
const https = require("https");

let transporter;

const createTransporter = async () => {
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else {
      // Generate test SMTP service account from ethereal.email
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      console.log("Using Ethereal Email. Test Account generated.");
    }
  } catch (error) {
    console.error("Failed to create email transporter:", error);
  }
};

// Helper to send email via Resend HTTPS API
const sendViaResend = (apiKey, from, to, subject, text, html) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from,
      to: [to],
      subject,
      text: text || "",
      html: html || (text ? text.replace(/\n/g, "<br>") : ""),
    });

    const options = {
      hostname: "api.resend.com",
      path: "/emails",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || data));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 */
exports.sendEmail = async (to, subject, text, html) => {
  try {
    // Mode 1: HTTP API (Resend)
    if (process.env.RESEND_API_KEY) {
      console.log("Sending email via Resend HTTP API to:", to);
      const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const result = await sendViaResend(
        process.env.RESEND_API_KEY,
        fromAddress,
        to,
        subject,
        text,
        html
      );
      console.log("Email sent successfully via Resend:", result.id);
      return result;
    }

    // Mode 2: SMTP (Nodemailer fallback)
    if (!transporter) {
      await createTransporter();
    }
    if (!transporter) {
      throw new Error("Email transporter is not initialized.");
    }
    const info = await transporter.sendMail({
      from: `"ShareAbite Admin" <${process.env.SMTP_USER || "noreply@shareabite.com"}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Message sent via SMTP: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

