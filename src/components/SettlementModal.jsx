import { useEffect, useState } from 'react';
import { t } from '../i18n';
import {
  GIFT_FUND_REWARD_USD,
  LEARNING_GOAL_MINUTES,
  PHYSICAL_GOAL_MINUTES,
} from '../utils/constants';
import {
  formatCountdown,
  getElectronicsCountdownState,
} from '../utils/settlement';

const PHASE = {
  PREVIEW: 'preview',
  REWARD_SELECT: 'reward-select',
  REWARD_RESULT: 'reward-result',
  PENALTY_RESULT: 'penalty-result',
};

function CelebrationOverlay({ language, show }) {
  if (!show) return null;

  return (
    <div className="reward-celebration" aria-hidden="true">
      <div className="reward-celebration-burst" />
      <div className="reward-celebration-ring" />
      <div className="reward-celebration-sparkles">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="sparkle" style={{ '--i': i }} />
        ))}
      </div>
      <p className="reward-celebration-text">
        {t('reward.claimConfirmed', language)}
      </p>
    </div>
  );
}

export default function SettlementModal({
  isOpen,
  language,
  settlementResult,
  totalPoints,
  pointsAfterSettlement,
  giftFundBalance,
  onConfirm,
  onClaimReward,
  onClose,
  isAlreadySettled,
  needsRewardSelection = false,
}) {
  const [phase, setPhase] = useState(
    needsRewardSelection ? PHASE.REWARD_SELECT : PHASE.PREVIEW,
  );
  const [selectedReward, setSelectedReward] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [electronicsState, setElectronicsState] = useState(
    () => getElectronicsCountdownState(),
  );

  useEffect(() => {
    if (!isOpen) {
      setPhase(needsRewardSelection ? PHASE.REWARD_SELECT : PHASE.PREVIEW);
      setSelectedReward(null);
      setShowCelebration(false);
      return undefined;
    }

    if (needsRewardSelection) {
      setPhase(PHASE.REWARD_SELECT);
    }

    const timer = setInterval(() => {
      setElectronicsState(getElectronicsCountdownState());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, selectedReward, needsRewardSelection]);

  if (!isOpen || !settlementResult) return null;

  const handleConfirm = () => {
    onConfirm();
    if (settlementResult.isGoalMet) {
      setPhase(PHASE.REWARD_SELECT);
    } else {
      setPhase(PHASE.PENALTY_RESULT);
    }
  };

  const handleSelectReward = (type) => {
    setShowCelebration(true);
    setSelectedReward(type);

    setTimeout(() => {
      onClaimReward(type);
      setShowCelebration(false);
      setPhase(PHASE.REWARD_RESULT);
    }, 1400);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content settlement-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <CelebrationOverlay language={language} show={showCelebration} />

        <h2>{t('settlement.title', language)}</h2>

        {phase === PHASE.PREVIEW && (
          <>
            <div className="settlement-stats">
              <div className="settlement-stat-row">
                <span>{t('settlement.totalLearning', language)}</span>
                <strong>
                  {settlementResult.totalLearningMinutes} / {LEARNING_GOAL_MINUTES}{' '}
                  {t('dashboard.minutes', language)}
                </strong>
              </div>
              <div className="settlement-stat-row">
                <span>{t('settlement.totalPhysical', language)}</span>
                <strong>
                  {settlementResult.totalPhysicalMinutes} / {PHYSICAL_GOAL_MINUTES}{' '}
                  {t('dashboard.minutes', language)}
                </strong>
              </div>
              <div className="settlement-stat-row">
                <span>{t('settlement.totalPoints', language)}</span>
                <strong>{totalPoints}</strong>
              </div>
            </div>

            {settlementResult.isGoalMet ? (
              <div className="settlement-banner success">
                {t('settlement.chooseReward', language)}
              </div>
            ) : (
              <div className="settlement-banner warning">
                <p>{t('settlement.goalNotMet', language)}</p>
                {settlementResult.learningShort > 0 && (
                  <p>
                    {t('settlement.learningShort', language, {
                      minutes: settlementResult.learningShort,
                    })}
                  </p>
                )}
                {settlementResult.physicalShort > 0 && (
                  <p>
                    {t('settlement.physicalShort', language, {
                      minutes: settlementResult.physicalShort,
                    })}
                  </p>
                )}
              </div>
            )}

            {!settlementResult.isGoalMet && settlementResult.deductions.length > 0 && (
              <div className="settlement-deductions">
                <p className="settlement-deductions-title">
                  {t('settlement.deductionDetails', language)}
                </p>
                <ul>
                  {settlementResult.deductions.map((item) => (
                    <li key={item.type}>
                      {item.type === 'learning'
                        ? t('settlement.learningDeduction', language, {
                            minutes: item.shortMinutes,
                            points: item.points,
                          })
                        : t('settlement.physicalDeduction', language, {
                            minutes: item.shortMinutes,
                            points: item.points,
                          })}
                    </li>
                  ))}
                </ul>
                <p className="settlement-penalty-hint">
                  {t('settlement.learningPenalty', language)} ·{' '}
                  {t('settlement.physicalPenalty', language)}
                </p>
                <p className="settlement-points-deducted">
                  {t('settlement.pointsDeducted', language, {
                    points: settlementResult.totalPenaltyPoints,
                  })}
                </p>
                <p className="settlement-points-after">
                  {t('settlement.pointsAfter', language, {
                    points: pointsAfterSettlement,
                  })}
                </p>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="modal-button secondary"
                onClick={onClose}
              >
                {t('modal.cancel', language)}
              </button>
              <button
                type="button"
                className="modal-button primary"
                onClick={handleConfirm}
                disabled={isAlreadySettled}
              >
                {isAlreadySettled
                  ? t('settlement.alreadySettled', language)
                  : t('settlement.confirm', language)}
              </button>
            </div>
          </>
        )}

        {phase === PHASE.REWARD_SELECT && (
          <>
            <p className="reward-select-title">
              {t('reward.selectTitle', language)}
            </p>
            <p className="reward-select-subtitle">
              {t('reward.selectSubtitle', language)}
            </p>

            <div className="reward-options">
              <button
                type="button"
                className="reward-option reward-option-electronics"
                onClick={() => handleSelectReward('electronics')}
              >
                <span className="reward-option-icon">📱</span>
                <span className="reward-option-label">
                  {t('reward.electronics', language)}
                </span>
                <span className="reward-option-desc">
                  {t('reward.electronicsDesc', language)}
                </span>
              </button>

              <button
                type="button"
                className="reward-option reward-option-gift"
                onClick={() => handleSelectReward('gift_fund')}
              >
                <span className="reward-option-icon">🏺</span>
                <span className="reward-option-label">
                  {t('reward.giftFund', language)}
                </span>
                <span className="reward-option-desc">
                  {t('reward.giftFundDesc', language, {
                    amount: GIFT_FUND_REWARD_USD,
                  })}
                </span>
              </button>
            </div>
          </>
        )}

        {phase === PHASE.REWARD_RESULT && selectedReward === 'electronics' && (
          <div className="settlement-result success reward-result-panel">
            <p className="settlement-unlock-title">
              {t('reward.electronicsClaimed', language)}
            </p>
            <p className="reward-today-label">
              {t('reward.todayReward', language, {
                reward: t('reward.electronicsLabel', language),
              })}
            </p>

            <div className="entertainment-countdown">
              <p>{t('reward.electronicsWindow', language)}</p>
              {electronicsState.phase === 'waiting' && (
                <p className="countdown-hint">
                  {t('reward.electronicsWaiting', language)}
                </p>
              )}
              {electronicsState.phase === 'active' && (
                <p className="countdown-hint">
                  {t('reward.electronicsActive', language)}
                </p>
              )}
              {electronicsState.phase === 'ended' ? (
                <p>{t('settlement.entertainmentEnded', language)}</p>
              ) : (
                <span className="countdown-timer">
                  {formatCountdown(electronicsState.secondsRemaining)}
                </span>
              )}
              <p className="countdown-hint">
                {t('reward.electronicsUntil', language, {
                  window: electronicsState.windowLabel,
                })}
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-button primary"
                onClick={onClose}
              >
                {t('settlement.close', language)}
              </button>
            </div>
          </div>
        )}

        {phase === PHASE.REWARD_RESULT && selectedReward === 'gift_fund' && (
          <div className="settlement-result success reward-result-panel">
            <p className="settlement-unlock-title">
              {t('reward.giftFundClaimed', language)}
            </p>
            <p className="reward-today-label">
              {t('reward.todayReward', language, {
                reward: t('reward.giftFundAdded', language, {
                  amount: GIFT_FUND_REWARD_USD,
                }),
              })}
            </p>

            <div className="gift-fund-result">
              <span className="gift-fund-result-icon">🏺</span>
              <p>{t('reward.giftFundTotal', language)}</p>
              <span className="gift-fund-result-amount">
                ${giftFundBalance.toFixed(2)}
              </span>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-button primary"
                onClick={onClose}
              >
                {t('settlement.close', language)}
              </button>
            </div>
          </div>
        )}

        {phase === PHASE.PENALTY_RESULT && (
          <>
            <div className="settlement-result warning">
              <p>{t('settlement.settlementComplete', language)}</p>
              <p>
                {t('settlement.pointsDeducted', language, {
                  points: settlementResult.totalPenaltyPoints,
                })}
              </p>
              <p>
                {t('settlement.pointsAfter', language, {
                  points: pointsAfterSettlement,
                })}
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-button primary"
                onClick={onClose}
              >
                {t('settlement.close', language)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
