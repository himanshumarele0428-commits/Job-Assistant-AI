import smtplib
import logging
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_ethereal_creds = None
_ethereal_lock = threading.Lock()


def _get_ethereal_creds():
    """Auto-create an Ethereal Email test account. Returns {user, pass, smtp_host, smtp_port, web_url}."""
    global _ethereal_creds
    if _ethereal_creds:
        return _ethereal_creds

    with _ethereal_lock:
        if _ethereal_creds:
            return _ethereal_creds

        try:
            import httpx
            resp = httpx.post(
                "https://api.nodemailer.com/user",
                json={"requestor": "JobAssistantAI", "version": "1.0.0"},
                headers={"Content-Type": "application/json"},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
            _ethereal_creds = {
                "user": data["user"],
                "pass": data["pass"],
                "smtp_host": data["smtp"]["host"],
                "smtp_port": data["smtp"]["port"],
                "imap_host": data.get("imap", {}).get("host", ""),
                "imap_port": data.get("imap", {}).get("port", 993),
                "web_url": f"https://ethereal.email/messages",
                "email_address": data["user"],
            }
            logger.info(f"Ethereal account auto-created: {data['user']}")
            logger.info(f"View emails at: https://ethereal.email/login")
            logger.info(f"  Login: {data['user']}")
            logger.info(f"  Password: {data['pass']}")
        except Exception as e:
            logger.warning(f"Ethereal auto-create failed ({e}), using ethereal defaults")
            _ethereal_creds = {
                "user": "ethereal.user@ethereal.email",
                "pass": "ethereal_pass",
                "smtp_host": "smtp.ethereal.email",
                "smtp_port": 587,
                "imap_host": "imap.ethereal.email",
                "imap_port": 993,
                "web_url": "https://ethereal.email",
                "email_address": "ethereal.user@ethereal.email",
            }

        return _ethereal_creds


def _build_html(reminder_title: str, reminder_type: str, scheduled_at: str) -> str:
    type_label = reminder_type.replace("-", " ").title()
    return f"""\
<html>
<body style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="color: #4f46e5; margin: 0;">Job Assistant AI</h2>
    </div>
    <h3 style="color: #111827; margin-bottom: 8px;">{reminder_title}</h3>
    <p style="color: #6b7280; margin: 0 0 16px 0;">
      <strong>Type:</strong> {type_label}<br>
      <strong>Scheduled:</strong> {scheduled_at}
    </p>
    <p style="color: #374151; line-height: 1.6;">
      This is your scheduled reminder. Take action on this {type_label.lower()} and keep your job search on track!
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
      Sent via Job Assistant AI. Manage your reminders <a href="http://localhost:3000/reminders" style="color: #4f46e5;">here</a>.
    </p>
  </div>
</body>
</html>
"""


def send_reminder_email(recipient: str, reminder_title: str, reminder_type: str, scheduled_at: str) -> dict:
    """
    Send a reminder email. Returns dict with 'success' (bool), 'message' (str),
    and optionally 'preview_url' if using Ethereal.
    """
    subject = f"Reminder: {reminder_title}"
    html = _build_html(reminder_title, reminder_type, scheduled_at)

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["To"] = recipient
    message.attach(MIMEText(html, "html"))

    if settings.sendgrid_api_key:
        ok = _send_via_sendgrid_api(recipient, subject, html)
        return {"success": ok, "message": "Sent via SendGrid" if ok else "SendGrid failed"}

    if settings.smtp_username and settings.smtp_password:
        message["From"] = settings.from_email
        ok = _send_via_smtp(settings.smtp_host, settings.smtp_port, settings.smtp_username, settings.smtp_password, message, settings.from_email)
        return {"success": ok, "message": "Sent via SMTP" if ok else "SMTP failed"}

    from app.database import async_session
    from app.models.user import User
    import asyncio

    creds = _get_ethereal_creds()
    message["From"] = creds["email_address"]
    message["To"] = creds["email_address"]

    ok = _send_via_smtp(creds["smtp_host"], creds["smtp_port"], creds["user"], creds["pass"], message, creds["email_address"])

    logger.info(
        f"Ethereal test email — check inbox at https://ethereal.email/login\n"
        f"  Login: {creds['email_address']}\n"
        f"  Password: {creds['pass']}\n"
        f"  Original recipient was: {recipient}\n"
        f"  TIP: Set SMTP_USERNAME/SMTP_PASSWORD in .env for real delivery (e.g. Gmail SMTP)"
    )

    return {
        "success": ok,
        "message": "Sent via Ethereal" if ok else "Ethereal SMTP failed",
        "preview_url": "https://ethereal.email/login",
        "ethereal_user": creds["user"],
        "ethereal_pass": creds["pass"],
    }


def _send_via_sendgrid_api(recipient: str, subject: str, html: str) -> bool:
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Email, Content
        sg = SendGridAPIClient(settings.sendgrid_api_key)
        mail = Mail(
            from_email=Email(settings.from_email),
            to_emails=Email(recipient),
            subject=subject,
            html_content=html,
        )
        response = sg.send(mail)
        return 200 <= response.status_code < 300
    except Exception as e:
        logger.error(f"SendGrid failed: {e}")
        return False


def _send_via_smtp(host: str, port: int, user: str, password: str, message: MIMEMultipart, from_addr: str) -> bool:
    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            server.send_message(message)
            logger.info(f"Email sent via SMTP to {message['To']}")
            return True
    except Exception as e:
        logger.error(f"SMTP send failed: {e}")
        return False
