import { INITIAL_POINTS } from './constants';

const KEYS = {
  TASK_LOGS: 'summer_plan_task_logs',
  TOTAL_POINTS: 'summer_plan_total_points',
  SETTLEMENTS: 'summer_plan_settlements',
  CHECKED_IN: 'summer_plan_checked_in',
  LANGUAGE: 'summer_plan_language',
  GIFT_FUND_BALANCE: 'giftFundBalance',
  REWARD_HISTORY: 'rewardHistory',
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadTaskLogs() {
  return readJSON(KEYS.TASK_LOGS, {});
}

export function saveTaskLogs(taskLogs) {
  writeJSON(KEYS.TASK_LOGS, taskLogs);
}

export function loadTotalPoints() {
  const points = readJSON(KEYS.TOTAL_POINTS, null);
  return typeof points === 'number' ? points : INITIAL_POINTS;
}

export function saveTotalPoints(points) {
  writeJSON(KEYS.TOTAL_POINTS, points);
}

/** settlements: { [date]: settlementRecord } */
export function loadSettlements() {
  return readJSON(KEYS.SETTLEMENTS, {});
}

export function saveSettlements(settlements) {
  writeJSON(KEYS.SETTLEMENTS, settlements);
}

/** checkedIn: { [date]: taskId[] } */
export function loadCheckedInByDate() {
  return readJSON(KEYS.CHECKED_IN, {});
}

export function saveCheckedInByDate(checkedInByDate) {
  writeJSON(KEYS.CHECKED_IN, checkedInByDate);
}

export function loadLanguage() {
  return localStorage.getItem(KEYS.LANGUAGE);
}

export function saveLanguage(language) {
  localStorage.setItem(KEYS.LANGUAGE, language);
}

export function loadGiftFundBalance() {
  const balance = readJSON(KEYS.GIFT_FUND_BALANCE, 0);
  return typeof balance === 'number' ? balance : 0;
}

export function saveGiftFundBalance(balance) {
  writeJSON(KEYS.GIFT_FUND_BALANCE, balance);
}

/** rewardHistory: [{ date, type, amount, label, claimedAt }] */
export function loadRewardHistory() {
  return readJSON(KEYS.REWARD_HISTORY, []);
}

export function saveRewardHistory(history) {
  writeJSON(KEYS.REWARD_HISTORY, history);
}
