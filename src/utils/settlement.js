import {
  ELECTRONICS_START_HOUR,
  ENTERTAINMENT_END_HOUR,
  LEARNING_GOAL_MINUTES,
  LEARNING_PENALTY_PER_MINUTES,
  PHYSICAL_GOAL_MINUTES,
  PHYSICAL_PENALTY_PER_MINUTES,
  SETTLEMENT_HOUR,
} from './constants';

/** 是否已到结算时间（>= 18:00） */
export function isSettlementTime(now = new Date()) {
  return now.getHours() >= SETTLEMENT_HOUR;
}

/** 计算当日结算结果与扣分 */
export function calculateSettlement(todayStats) {
  const { totalLearningMinutes, totalPhysicalMinutes } = todayStats;

  const learningShort = Math.max(0, LEARNING_GOAL_MINUTES - totalLearningMinutes);
  const physicalShort = Math.max(0, PHYSICAL_GOAL_MINUTES - totalPhysicalMinutes);

  const isGoalMet =
    totalLearningMinutes >= LEARNING_GOAL_MINUTES &&
    totalPhysicalMinutes >= PHYSICAL_GOAL_MINUTES;

  const learningPenaltyPoints = isGoalMet
    ? 0
    : Math.floor(learningShort / LEARNING_PENALTY_PER_MINUTES);
  const physicalPenaltyPoints = isGoalMet
    ? 0
    : Math.floor(physicalShort / PHYSICAL_PENALTY_PER_MINUTES);

  const totalPenaltyPoints = learningPenaltyPoints + physicalPenaltyPoints;

  const deductions = [];
  if (learningPenaltyPoints > 0) {
    deductions.push({
      type: 'learning',
      shortMinutes: learningShort,
      points: learningPenaltyPoints,
    });
  }
  if (physicalPenaltyPoints > 0) {
    deductions.push({
      type: 'physical',
      shortMinutes: physicalShort,
      points: physicalPenaltyPoints,
    });
  }

  return {
    isGoalMet,
    totalLearningMinutes,
    totalPhysicalMinutes,
    learningShort,
    physicalShort,
    learningPenaltyPoints,
    physicalPenaltyPoints,
    totalPenaltyPoints,
    deductions,
  };
}

/** 电子产品奖励窗口 20:00–22:00 的状态与倒计时 */
export function getElectronicsCountdownState(now = new Date()) {
  const start = new Date(now);
  start.setHours(ELECTRONICS_START_HOUR, 0, 0, 0);
  const end = new Date(now);
  end.setHours(ENTERTAINMENT_END_HOUR, 0, 0, 0);

  if (now < start) {
    return {
      phase: 'waiting',
      secondsRemaining: Math.floor((start.getTime() - now.getTime()) / 1000),
      windowLabel: '20:00–22:00',
    };
  }

  if (now < end) {
    return {
      phase: 'active',
      secondsRemaining: Math.floor((end.getTime() - now.getTime()) / 1000),
      windowLabel: '20:00–22:00',
    };
  }

  return {
    phase: 'ended',
    secondsRemaining: 0,
    windowLabel: '20:00–22:00',
  };
}

/** @deprecated 使用 getElectronicsCountdownState */
export function getSecondsUntilEndOfEntertainment(now = new Date()) {
  return getElectronicsCountdownState(now).secondsRemaining;
}

export function formatCountdown(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
