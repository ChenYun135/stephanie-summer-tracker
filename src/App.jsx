import { useCallback, useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import SettlementModal from './components/SettlementModal';
import TaskCard from './components/TaskCard';
import { ALL_TASKS, TASK_TREE } from './data/tasks';
import { DEFAULT_LANGUAGE, getLocalizedText, t } from './i18n';
import {
  GIFT_FUND_REWARD_USD,
  LEARNING_GOAL_MINUTES,
  PHYSICAL_GOAL_MINUTES,
} from './utils/constants';
import { calculateSettlement, isSettlementTime } from './utils/settlement';
import {
  loadCheckedInByDate,
  loadGiftFundBalance,
  loadLanguage,
  loadRewardHistory,
  loadSettlements,
  loadTaskLogs,
  loadTotalPoints,
  saveCheckedInByDate,
  saveGiftFundBalance,
  saveLanguage,
  saveRewardHistory,
  saveSettlements,
  saveTaskLogs,
  saveTotalPoints,
} from './utils/storage';

const CATEGORY_ICONS = {
  learning: '📚',
  physical: '🏃',
  creativeLeisure: '🎨',
  habits: '✨',
  schedule: '🌙',
};

/** 获取今日日期字符串 YYYY-MM-DD */
export function getTodayDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 根据开始/结束时间（HH:mm）计算分钟数 */
export function calculateMinutesBetween(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  return Math.max(0, endTotal - startTotal);
}

/** 获取某任务在指定日期的记录列表 */
export function getTaskLogsForDate(taskLogs, taskId, date) {
  return (taskLogs[taskId] ?? []).filter((log) => log.date === date);
}

/** 获取某任务在指定日期的总分钟数 */
export function getTaskMinutesForDate(taskLogs, taskId, date) {
  return getTaskLogsForDate(taskLogs, taskId, date).reduce(
    (sum, log) => sum + log.minutes,
    0,
  );
}

/** 汇总指定日期的学习 / 运动总时长（分钟） */
export function calculateTodayStats(taskLogs, date = getTodayDate()) {
  let totalLearningMinutes = 0;
  let totalPhysicalMinutes = 0;
  let totalCreativeLeisureMinutes = 0;
  let totalHabitsMinutes = 0;
  let totalScheduleMinutes = 0;

  ALL_TASKS.forEach((task) => {
    const minutes = getTaskMinutesForDate(taskLogs, task.id, date);
    if (task.isLearning) totalLearningMinutes += minutes;
    if (task.isPhysical) totalPhysicalMinutes += minutes;
    if (task.isCreativeLeisure) totalCreativeLeisureMinutes += minutes;
    if (task.isHabits) totalHabitsMinutes += minutes;
    if (task.isSchedule) totalScheduleMinutes += minutes;
  });

  return {
    date,
    totalLearningMinutes,
    totalPhysicalMinutes,
    totalCreativeLeisureMinutes,
    totalHabitsMinutes,
    totalScheduleMinutes,
    isLearningGoalMet: totalLearningMinutes >= LEARNING_GOAL_MINUTES,
    isPhysicalGoalMet: totalPhysicalMinutes >= PHYSICAL_GOAL_MINUTES,
    isDailyGoalMet:
      totalLearningMinutes >= LEARNING_GOAL_MINUTES &&
      totalPhysicalMinutes >= PHYSICAL_GOAL_MINUTES,
  };
}

function isDefaultOnlyCategory(category) {
  return (
    category.subCategories.length === 1 &&
    category.subCategories[0].key === 'default'
  );
}

function FadeView({ viewKey, children }) {
  return (
    <div key={viewKey} className="view-fade">
      {children}
    </div>
  );
}

function BackButton({ onClick, language }) {
  return (
    <button type="button" className="back-button" onClick={onClick}>
      ← {t('nav.back', language)}
    </button>
  );
}

function NavCard({ title, subtitle, icon, meta, onClick }) {
  return (
    <button type="button" className="nav-card" onClick={onClick}>
      <span className="nav-card-icon">{icon}</span>
      <span className="nav-card-body">
        <span className="nav-card-title">{title}</span>
        {subtitle && <span className="nav-card-subtitle">{subtitle}</span>}
      </span>
      {meta && <span className="nav-card-meta">{meta}</span>}
      <span className="nav-card-arrow">›</span>
    </button>
  );
}

function DurationRecordModal({ task, language, onClose, onSubmit }) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const previewMinutes = calculateMinutesBetween(startTime, endTime);
  const taskName = getLocalizedText(task.name, language);

  const handleSubmit = (event) => {
    event.preventDefault();
    const minutes = calculateMinutesBetween(startTime, endTime);

    if (minutes <= 0) {
      setError(t('modal.endBeforeStart', language));
      return;
    }

    onSubmit({
      startTime,
      endTime,
      minutes,
      note: note.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="duration-modal-title"
      >
        <h2 id="duration-modal-title">{t('modal.recordTitle', language)}</h2>
        <p className="modal-subtitle">{taskName}</p>

        <form className="duration-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>{t('modal.startTime', language)}</span>
            <input
              type="time"
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                setError('');
              }}
              required
            />
          </label>

          <label className="form-field">
            <span>{t('modal.endTime', language)}</span>
            <input
              type="time"
              value={endTime}
              onChange={(event) => {
                setEndTime(event.target.value);
                setError('');
              }}
              required
            />
          </label>

          <label className="form-field">
            <span>{t('modal.note', language)}</span>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('modal.notePlaceholder', language)}
              maxLength={100}
            />
          </label>

          <p className="duration-preview">
            {t('modal.durationPreview', language)}
            <strong>{previewMinutes}</strong> {t('dashboard.minutes', language)}
          </p>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-button secondary" onClick={onClose}>
              {t('modal.cancel', language)}
            </button>
            <button type="submit" className="modal-button primary">
              {t('modal.save', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState(
    () => loadLanguage() || DEFAULT_LANGUAGE,
  );
  const [currentView, setCurrentView] = useState('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const [taskLogs, setTaskLogs] = useState(() => loadTaskLogs());
  const [totalPoints, setTotalPoints] = useState(() => loadTotalPoints());
  const [giftFundBalance, setGiftFundBalance] = useState(() => loadGiftFundBalance());
  const [rewardHistory, setRewardHistory] = useState(() => loadRewardHistory());
  const [settlements, setSettlements] = useState(() => loadSettlements());
  const [checkedInByDate, setCheckedInByDate] = useState(() => loadCheckedInByDate());
  const [recordingTask, setRecordingTask] = useState(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const todayDate = getTodayDate(now);

  const todayStats = useMemo(
    () => calculateTodayStats(taskLogs, todayDate),
    [taskLogs, todayDate],
  );

  const settlementResult = useMemo(
    () => calculateSettlement(todayStats),
    [todayStats],
  );

  const pointsAfterSettlement = useMemo(
    () => Math.max(0, totalPoints - settlementResult.totalPenaltyPoints),
    [totalPoints, settlementResult.totalPenaltyPoints],
  );

  const isSettlementAvailable = isSettlementTime(now);
  const todaySettlement = settlements[todayDate];
  const isAlreadySettled = Boolean(todaySettlement);
  const needsRewardSelection =
    todaySettlement?.isGoalMet && !todaySettlement?.rewardChoice;
  const isSettlementComplete =
    isAlreadySettled && !needsRewardSelection;

  const checkedInTasks = useMemo(
    () => new Set(checkedInByDate[todayDate] ?? []),
    [checkedInByDate, todayDate],
  );

  const selectedCategory = useMemo(
    () => TASK_TREE.find((c) => c.key === selectedCategoryId) ?? null,
    [selectedCategoryId],
  );

  const selectedSubject = useMemo(
    () =>
      selectedCategory?.subCategories.find((s) => s.key === selectedSubjectId) ??
      null,
    [selectedCategory, selectedSubjectId],
  );

  useEffect(() => {
    saveTaskLogs(taskLogs);
  }, [taskLogs]);

  useEffect(() => {
    saveTotalPoints(totalPoints);
  }, [totalPoints]);

  useEffect(() => {
    saveGiftFundBalance(giftFundBalance);
  }, [giftFundBalance]);

  useEffect(() => {
    saveRewardHistory(rewardHistory);
  }, [rewardHistory]);

  useEffect(() => {
    saveSettlements(settlements);
  }, [settlements]);

  useEffect(() => {
    saveCheckedInByDate(checkedInByDate);
  }, [checkedInByDate]);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const navigateToSubject = useCallback((categoryId) => {
    const category = TASK_TREE.find((c) => c.key === categoryId);
    if (!category) return;

    setSelectedCategoryId(categoryId);

    if (isDefaultOnlyCategory(category)) {
      setSelectedSubjectId('default');
      setCurrentView('task');
      return;
    }

    setSelectedSubjectId(null);
    setCurrentView('subject');
  }, []);

  const navigateToTask = useCallback((subjectId) => {
    setSelectedSubjectId(subjectId);
    setCurrentView('task');
  }, []);

  const goBack = useCallback(() => {
    if (currentView === 'task') {
      if (selectedCategory && isDefaultOnlyCategory(selectedCategory)) {
        setCurrentView('category');
        setSelectedCategoryId(null);
        setSelectedSubjectId(null);
      } else {
        setCurrentView('subject');
        setSelectedSubjectId(null);
      }
      return;
    }

    if (currentView === 'subject') {
      setCurrentView('category');
      setSelectedCategoryId(null);
      setSelectedSubjectId(null);
    }
  }, [currentView, selectedCategory]);

  const handleRecordSubmit = useCallback(
    ({ startTime, endTime, minutes, note }) => {
      if (!recordingTask) return;

      const entry = {
        id: `${Date.now()}-${recordingTask.id}`,
        date: todayDate,
        startTime,
        endTime,
        minutes,
        note,
      };

      setTaskLogs((prev) => ({
        ...prev,
        [recordingTask.id]: [...(prev[recordingTask.id] ?? []), entry],
      }));
      setRecordingTask(null);
    },
    [recordingTask, todayDate],
  );

  const handleCheckIn = useCallback(
    (taskId) => {
      setCheckedInByDate((prev) => {
        const todayList = new Set(prev[todayDate] ?? []);
        if (todayList.has(taskId)) {
          todayList.delete(taskId);
        } else {
          todayList.add(taskId);
        }
        return { ...prev, [todayDate]: [...todayList] };
      });
    },
    [todayDate],
  );

  const handleOpenSettlement = useCallback(() => {
    if (!isSettlementAvailable || isSettlementComplete) return;
    setIsSettlementOpen(true);
  }, [isSettlementAvailable, isSettlementComplete]);

  const handleConfirmSettlement = useCallback(() => {
    if (isSettlementComplete) return;

    const result = calculateSettlement(todayStats);
    const newPoints = Math.max(0, totalPoints - result.totalPenaltyPoints);

    setTotalPoints(newPoints);
    setSettlements((prev) => ({
      ...prev,
      [todayDate]: {
        date: todayDate,
        settledAt: new Date().toISOString(),
        isGoalMet: result.isGoalMet,
        totalLearningMinutes: result.totalLearningMinutes,
        totalPhysicalMinutes: result.totalPhysicalMinutes,
        totalPenaltyPoints: result.totalPenaltyPoints,
        pointsBefore: totalPoints,
        pointsAfter: newPoints,
        deductions: result.deductions,
        rewardChoice: null,
        rewardLabel: null,
      },
    }));
  }, [isSettlementComplete, todayStats, totalPoints, todayDate]);

  const handleClaimReward = useCallback(
    (rewardType) => {
      const isElectronics = rewardType === 'electronics';
      const rewardLabel = isElectronics
        ? t('reward.electronicsLabel', language)
        : t('reward.giftFundAdded', language, { amount: GIFT_FUND_REWARD_USD });

      const historyEntry = {
        date: todayDate,
        type: rewardType,
        amount: isElectronics ? null : GIFT_FUND_REWARD_USD,
        label: isElectronics
          ? t('reward.electronicsLabel', 'zh')
          : `礼品金 +$${GIFT_FUND_REWARD_USD}`,
        claimedAt: new Date().toISOString(),
      };

      setRewardHistory((prev) => [...prev, historyEntry]);

      if (!isElectronics) {
        setGiftFundBalance((prev) => prev + GIFT_FUND_REWARD_USD);
      }

      setSettlements((prev) => ({
        ...prev,
        [todayDate]: {
          ...prev[todayDate],
          rewardChoice: rewardType,
          rewardLabel: isElectronics
            ? t('reward.electronicsLabel', 'zh')
            : t('reward.giftFundAdded', 'zh', { amount: GIFT_FUND_REWARD_USD }),
        },
      }));
    },
    [todayDate, language],
  );

  const viewTitle = useMemo(() => {
    if (currentView === 'category') return t('app.selectActivity', language);
    if (currentView === 'subject' && selectedCategory) {
      return getLocalizedText(selectedCategory.label, language);
    }
    if (currentView === 'task' && selectedCategory) {
      const subjectLabel = selectedSubject
        ? getLocalizedText(selectedSubject.label, language)
        : '';
      return (
        subjectLabel || getLocalizedText(selectedCategory.label, language)
      );
    }
    return '';
  }, [currentView, selectedCategory, selectedSubject, language]);

  return (
    <div className="app">
      <Dashboard
        todayStats={todayStats}
        language={language}
        onLanguageChange={setLanguage}
        totalPoints={totalPoints}
        giftFundBalance={giftFundBalance}
        isSettlementAvailable={isSettlementAvailable}
        isAlreadySettled={isSettlementComplete}
        needsRewardSelection={needsRewardSelection}
        onOpenSettlement={handleOpenSettlement}
      />

      <header className="app-header">
        <p className="app-eyebrow">{t('app.eyebrow', language)}</p>
        <h1>{viewTitle}</h1>
      </header>

      <main className="app-main">
        {currentView === 'category' && (
          <FadeView viewKey="category">
            <div className="card-list">
              {TASK_TREE.map((category) => (
                <NavCard
                  key={category.key}
                  title={getLocalizedText(category.label, language)}
                  subtitle={
                    language === 'zh'
                      ? getLocalizedText(category.label, 'en')
                      : getLocalizedText(category.label, 'zh')
                  }
                  icon={CATEGORY_ICONS[category.key]}
                  meta={t('nav.itemsCount', language, {
                    count: category.subCategories.reduce(
                      (n, s) => n + s.tasks.length,
                      0,
                    ),
                  })}
                  onClick={() => navigateToSubject(category.key)}
                />
              ))}
            </div>
          </FadeView>
        )}

        {currentView === 'subject' && selectedCategory && (
          <FadeView viewKey={`subject-${selectedCategory.key}`}>
            <BackButton onClick={goBack} language={language} />
            <div className="card-list">
              {selectedCategory.subCategories.map((subject) => (
                <NavCard
                  key={subject.key}
                  title={
                    getLocalizedText(subject.label, language) ||
                    getLocalizedText(selectedCategory.label, language)
                  }
                  subtitle={t('nav.tasksCount', language, {
                    count: subject.tasks.length,
                  })}
                  icon={CATEGORY_ICONS[selectedCategory.key]}
                  onClick={() => navigateToTask(subject.key)}
                />
              ))}
            </div>
          </FadeView>
        )}

        {currentView === 'task' && selectedCategory && selectedSubject && (
          <FadeView viewKey={`task-${selectedCategory.key}-${selectedSubject.key}`}>
            <BackButton onClick={goBack} language={language} />
            <div className="task-list">
              {selectedSubject.tasks.map((task) => {
                const enrichedTask = ALL_TASKS.find((item) => item.id === task.id);
                const todayLogs = getTaskLogsForDate(taskLogs, task.id, todayDate);

                return (
                  <TaskCard
                    key={task.id}
                    task={{ ...task, ...enrichedTask }}
                    language={language}
                    todayMinutes={getTaskMinutesForDate(taskLogs, task.id, todayDate)}
                    todayLogs={todayLogs}
                    onRecordDuration={setRecordingTask}
                    onCheckIn={handleCheckIn}
                    isCheckedIn={checkedInTasks.has(task.id)}
                  />
                );
              })}
            </div>
          </FadeView>
        )}
      </main>

      {recordingTask && (
        <DurationRecordModal
          task={recordingTask}
          language={language}
          onClose={() => setRecordingTask(null)}
          onSubmit={handleRecordSubmit}
        />
      )}

      <SettlementModal
        isOpen={isSettlementOpen}
        language={language}
        settlementResult={settlementResult}
        totalPoints={totalPoints}
        pointsAfterSettlement={pointsAfterSettlement}
        giftFundBalance={giftFundBalance}
        onConfirm={handleConfirmSettlement}
        onClaimReward={handleClaimReward}
        onClose={() => setIsSettlementOpen(false)}
        isAlreadySettled={isSettlementComplete}
        needsRewardSelection={needsRewardSelection}
      />
    </div>
  );
}
