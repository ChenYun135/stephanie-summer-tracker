import { useEffect, useRef, useState } from 'react';
import { t } from '../i18n';
import GiftFundBadge from './GiftFundBadge';
import LanguageSwitcher from './LanguageSwitcher';

const LEARNING_GOAL = 300;
const PHYSICAL_GOAL = 30;

function useAnimatedNumber(target, duration = 700) {
  const [display, setDisplay] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const from = previous.current;
    const to = target;
    if (from === to) return undefined;

    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        previous.current = to;
      }
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

function ProgressRing({
  label,
  emoji,
  current,
  goal,
  minutesLabel,
  goalMetLabel,
  gradientId,
  gradientFrom,
  gradientTo,
  trackColor,
}) {
  const animatedCurrent = useAnimatedNumber(current);
  const radius = 54;
  const strokeWidth = 10;
  const size = 144;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, current / goal);
  const dashOffset = circumference * (1 - progress);
  const isComplete = current >= goal;

  return (
    <div className="flex flex-1 flex-col items-center rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
        <span>{emoji}</span>
        <span>{label}</span>
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xl font-bold tabular-nums text-slate-800 transition-all duration-500">
            {animatedCurrent}
            <span className="text-sm font-medium text-slate-400">/{goal}</span>
          </p>
          <p className="text-xs text-slate-500">{minutesLabel}</p>
          {isComplete && (
            <span className="mt-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {goalMetLabel}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
          }}
        />
      </div>
    </div>
  );
}

export default function Dashboard({
  todayStats,
  language,
  onLanguageChange,
  totalPoints,
  giftFundBalance,
  isSettlementAvailable,
  isAlreadySettled,
  needsRewardSelection,
  onOpenSettlement,
}) {
  const { totalLearningMinutes = 0, totalPhysicalMinutes = 0, date } = todayStats;

  return (
    <section className="mb-5 rounded-3xl bg-gradient-to-br from-slate-50/90 via-white/70 to-slate-50/90 p-4 shadow-md ring-1 ring-white/60">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500">
            {t('dashboard.todayProgress', language)}
          </p>
          <p className="text-sm font-semibold text-slate-700">{date}</p>
          <p className="mt-0.5 text-xs font-medium text-amber-700">
            {t('dashboard.totalPoints', language)}: {totalPoints}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <GiftFundBadge balance={giftFundBalance} language={language} />
          {todayStats.isDailyGoalMet && (
            <span className="hidden rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm sm:inline">
              {t('dashboard.dailyGoalMet', language)}
            </span>
          )}
          <LanguageSwitcher language={language} onChange={onLanguageChange} />
        </div>
      </div>

      {todayStats.isDailyGoalMet && (
        <p className="mb-3 text-center text-xs font-bold text-emerald-600 sm:hidden">
          {t('dashboard.dailyGoalMet', language)}
        </p>
      )}

      <div className="flex gap-3">
        <ProgressRing
          label={t('dashboard.learning', language)}
          emoji="📚"
          current={totalLearningMinutes}
          goal={LEARNING_GOAL}
          minutesLabel={t('dashboard.minutes', language)}
          goalMetLabel={t('dashboard.goalMet', language)}
          gradientId="learning-gradient"
          gradientFrom="#3b82f6"
          gradientTo="#6366f1"
          trackColor="#dbeafe"
        />

        <ProgressRing
          label={t('dashboard.physical', language)}
          emoji="🏃"
          current={totalPhysicalMinutes}
          goal={PHYSICAL_GOAL}
          minutesLabel={t('dashboard.minutes', language)}
          goalMetLabel={t('dashboard.goalMet', language)}
          gradientId="physical-gradient"
          gradientFrom="#22c55e"
          gradientTo="#10b981"
          trackColor="#d1fae5"
        />
      </div>

      <div className="mt-4">
        <button
          type="button"
          className={`settlement-trigger w-full rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
            isSettlementAvailable && (!isAlreadySettled || needsRewardSelection)
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg'
              : 'cursor-not-allowed bg-slate-100 text-slate-400'
          }`}
          onClick={onOpenSettlement}
          disabled={
            !isSettlementAvailable || (isAlreadySettled && !needsRewardSelection)
          }
        >
          {isAlreadySettled && !needsRewardSelection
            ? t('settlement.alreadySettled', language)
            : needsRewardSelection
              ? t('reward.selectTitle', language)
              : isSettlementAvailable
                ? t('settlement.button', language)
                : t('settlement.availableAfter', language)}
        </button>
      </div>
    </section>
  );
}
