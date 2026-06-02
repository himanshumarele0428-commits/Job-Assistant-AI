from datetime import datetime, timedelta
from app.tasks.celery_app import celery_app
from app.database import async_session
from app.models.reminder import Reminder
from sqlalchemy import select
import asyncio


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
        for reminder in reminders:
            # TODO: Send email/in-app notification in Phase 4
            reminder.is_sent = True
        if reminders:
            await db.commit()


@celery_app.task(name="app.tasks.reminder_tasks.check_and_send_reminders")
def check_and_send_reminders():
    asyncio.run(_check_and_send())
