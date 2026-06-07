import { getLocalizedText, t } from '../i18n';

/**
 * 任务卡片 — 演示多语言字段读取方式：
 *   getLocalizedText(task.name, language)  → 任务名称
 *   t('task.recordDuration', language)   → 界面按钮文案
 */
export default function TaskCard({
  task,
  language,
  todayMinutes,
  todayLogs,
  onRecordDuration,
  onCheckIn,
  isCheckedIn,
}) {
  const taskName = getLocalizedText(task.name, language);

  return (
    <article className="task-card">
      <div className="task-card-header">
        <h3>{taskName}</h3>
        <div className="task-card-badges">
          {task.time && <span className="task-time-badge">{task.time}</span>}
          <span className="task-minutes-badge">
            {t('task.todayMinutes', language, { minutes: todayMinutes })}
          </span>
        </div>
      </div>

      {todayLogs.length > 0 && (
        <ul className="task-log-list">
          {todayLogs.map((log) => (
            <li key={log.id}>
              {t('task.logEntry', language, {
                start: log.startTime,
                end: log.endTime,
                minutes: log.minutes,
              })}
              {log.note ? ` · ${log.note}` : ''}
            </li>
          ))}
        </ul>
      )}

      <div className="task-actions">
        <button
          type="button"
          className="record-button"
          onClick={() => onRecordDuration(task)}
        >
          {t('task.recordDuration', language)}
        </button>

        {(task.isHabits || task.isSchedule) && (
          <button
            type="button"
            className={`checkin-button ${isCheckedIn ? 'checked' : ''}`}
            onClick={() => onCheckIn(task.id)}
          >
            {isCheckedIn
              ? t('task.checkedIn', language)
              : t('task.checkIn', language)}
          </button>
        )}
      </div>
    </article>
  );
}
