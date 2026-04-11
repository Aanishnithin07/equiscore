import logging
import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

import aiosmtplib
from jinja2 import Environment, FileSystemLoader
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

from core.config import settings

logger = logging.getLogger(__name__)

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'email_templates')
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

class EmailService:
    @staticmethod
    def render_template(template_name: str, **kwargs) -> str:
        """Renders an HTML email from the Jinja2 template folder natively with explicit arguments."""
        try:
            template = jinja_env.get_template(template_name)
            return template.render(**kwargs)
        except Exception as e:
            logger.error(f"Failed to render email template {template_name}: {e}")
            return ""

    @staticmethod
    async def send(to_email: str, subject: str, html_body: str, text_body: str = "") -> bool:
        """
        Attempts to send transactional email natively through SendGrid first.
        If it fails, it cascades automatically to standard aio SMTP connections seamlessly.
        """
        # Primary: SendGrid
        if settings.SENDGRID_API_KEY:
            try:
                sg = SendGridAPIClient(settings.SENDGRID_API_KEY.get_secret_value())
                from_email = Email(settings.EMAIL_FROM, settings.EMAIL_FROM_NAME)
                to_email_obj = To(to_email)
                
                content_html = Content("text/html", html_body)
                mail = Mail(from_email, to_email_obj, subject, content_html)
                
                # SendGrid client doesn't natively expose asyncio hooks seamlessly in standard v6 
                # but network constraints are handled safely inside Celery threads
                response = sg.send(mail)
                if response.status_code in [200, 201, 202]:
                    logger.info(f"SendGrid dispatched successfully to {to_email}")
                    return True
            except Exception as e:
                logger.warning(f"SendGrid primary transmission failure, cascading: {e}")

        # Fallback: aiosmtplib
        if settings.SMTP_HOST:
            try:
                msg = EmailMessage()
                msg["Subject"] = subject
                msg["From"] = formataddr((settings.EMAIL_FROM_NAME, settings.EMAIL_FROM))
                msg["To"] = to_email
                
                msg.set_content(text_body if text_body else "Please enable HTML to view this email.")
                msg.add_alternative(html_body, subtype="html")

                await aiosmtplib.send(
                    msg,
                    hostname=settings.SMTP_HOST,
                    port=settings.SMTP_PORT,
                    # Authentications bypassed here for local environments or implicit trust 
                    # Real prod includes kwargs: username=.., password=.., use_tls=True
                )
                logger.info(f"SMTP fallback dispatched successfully to {to_email}")
                return True
            except Exception as e:
                logger.error(f"SMTP secondary transmission failed entirely: {e}")
                
        return False
