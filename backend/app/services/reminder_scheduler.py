import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from app.database import async_session
from app.models.reminder import Reminder
from app.models.user import User
from app.services.email_service import send_reminder_email

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def _check_and_send():
    async with async_session() as db:
        now = datetime.utcnow()
        window = now + timedelta(minutes=1)
        result = await db.execute(
            select(Reminder).where(
                Reminder.is_sent == False,
                Reminder.scheduled_at >= now,
                Reminder.scheduled_at <= window,
            )
        )
        reminders = result.scalars().all()

        if not reminders:
            return

        logger.info(f"Found {len(reminders)} due reminder(s) to process")

        for reminder in reminders:
            if reminder.notification_type == "email":
                recipient = reminder.recipient_email
                if not recipient:
                    user_result = await db.execute(
                        select(User).where(User.id == reminder.user_id)
                    )
                    user = user_result.scalar_one_or_none()
                    recipient = user.email if user else None

                if recipient:
                    result = send_reminder_email(
                        recipient=recipient,
                        reminder_title=reminder.title,
                        reminder_type=reminder.reminder_type,
                        scheduled_at=str(reminder.scheduled_at),
                    )
                    if result["success"]:
                        logger.info(f"Email sent to {recipient} ({result['message']})")
                        if "ethereal_user" in result:
                            logger.info(f"View: {result['preview_url']} | Login: {result['ethereal_user']} | Pass: {result['ethereal_pass']}")
                    else:
                        logger.warning(f"Email failed for reminder {reminder.id}: {result['message']}")
                else:
                    logger.warning(f"No recipient email for reminder {reminder.id}")

            reminder.is_sent = True

        await db.commit()
        logger.info(f"Processed {len(reminders)} reminder(s)")


def start_scheduler():
    scheduler.add_job(_check_and_send, "interval", seconds=60, id="check_reminders", replace_existing=True)
    scheduler.start()
    logger.info("Reminder scheduler started — checking every 60 seconds")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Reminder scheduler stopped")
