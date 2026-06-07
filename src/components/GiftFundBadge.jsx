import { t } from '../i18n';

export default function GiftFundBadge({ balance, language }) {
  return (
    <div
      className="gift-fund-badge"
      title={t('dashboard.giftFundTooltip', language)}
    >
      <span className="gift-fund-icon" aria-hidden="true">
        🏺
      </span>
      <div className="gift-fund-text">
        <span className="gift-fund-label">
          {t('dashboard.giftFund', language)}
        </span>
        <span className="gift-fund-amount">
          ${balance.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
