import { DEFAULT_LANGUAGE, locales } from './locales';

/**
 * 翻译函数 — 通过 key 路径读取文案，支持 {{param}} 插值
 * @example t('task.recordDuration', 'en') => 'Log Duration'
 * @example t('nav.itemsCount', 'zh', { count: 5 }) => '5 项'
 */
export function t(key, lang = DEFAULT_LANGUAGE, params = {}) {
  const parts = key.split('.');
  let value = locales[lang];

  for (const part of parts) {
    value = value?.[part];
  }

  if (value === undefined) {
    let fallback = locales[DEFAULT_LANGUAGE];
    for (const part of parts) {
      fallback = fallback?.[part];
    }
    value = fallback ?? key;
  }

  if (typeof value !== 'string') return key;

  return Object.entries(params).reduce(
    (text, [paramKey, paramValue]) =>
      text.replaceAll(`{{${paramKey}}}`, String(paramValue)),
    value,
  );
}

/**
 * 读取 tasks.js 中的多语言字段
 * @example getLocalizedText({ zh: '单词', en: 'Vocabulary', ja: '単語' }, 'en') => 'Vocabulary'
 */
export function getLocalizedText(field, lang = DEFAULT_LANGUAGE) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] ?? field[DEFAULT_LANGUAGE] ?? field.en ?? '';
}

export { DEFAULT_LANGUAGE, LANGUAGES, locales } from './locales';
