/**
 * 暑期任务数据 — 三级层级：大类 (Category) → 科目 (SubCategory) → 任务 (Task)
 * 名称字段均为 { zh, en, ja } 多语言结构
 */

/** 快捷创建三语文本 */
const L = (zh, en, ja) => ({ zh, en, ja });

/** 大类元数据与分类标志位模板 */
export const TASK_CATEGORIES = {
  learning: {
    key: 'learning',
    label: L('学习类', 'Learning', '学習'),
    isLearning: true,
    isPhysical: false,
    isCreativeLeisure: false,
    isHabits: false,
    isSchedule: false,
  },
  physical: {
    key: 'physical',
    label: L('运动类', 'Physical', '運動'),
    isLearning: false,
    isPhysical: true,
    isCreativeLeisure: false,
    isHabits: false,
    isSchedule: false,
  },
  creativeLeisure: {
    key: 'creativeLeisure',
    label: L('创意与生活', 'Creative & Leisure', '創意と生活'),
    isLearning: false,
    isPhysical: false,
    isCreativeLeisure: true,
    isHabits: false,
    isSchedule: false,
  },
  habits: {
    key: 'habits',
    label: L('习惯类', 'Habits', '習慣'),
    isLearning: false,
    isPhysical: false,
    isCreativeLeisure: false,
    isHabits: true,
    isSchedule: false,
  },
  schedule: {
    key: 'schedule',
    label: L('作息类', 'Schedule', '生活リズム'),
    isLearning: false,
    isPhysical: false,
    isCreativeLeisure: false,
    isHabits: false,
    isSchedule: true,
  },
};

/**
 * 任务树 — Category → SubCategory → Task
 * 非学习类无明确科目划分时，使用单一默认科目 (key: 'default')
 */
export const TASK_TREE = [
  {
    ...TASK_CATEGORIES.learning,
    subCategories: [
      {
        key: 'english',
        label: L('英语', 'English', '英語'),
        tasks: [
          {
            id: 'english-words',
            name: { zh: '英语单词', en: 'English Vocabulary', ja: '英単語' },
          },
          { id: 'english-grammar', name: L('语法', 'Grammar', '文法') },
          { id: 'english-writing', name: L('写作', 'Writing', '作文') },
          { id: 'english-reading', name: L('阅读', 'Reading', '読解') },
          {
            id: 'english-speaking-longman',
            name: L('口语(朗文家)', 'Speaking (Longman)', 'スピーキング（朗文家）'),
          },
          {
            id: 'english-speaking-duoquai',
            name: L('口语(多趣爱)', 'Speaking (Duoquai)', 'スピーキング（多趣爱）'),
          },
          {
            id: 'english-speaking-meisen',
            name: L('口语(美森英语)', 'Speaking (Meisen)', 'スピーキング（美森英语）'),
          },
          {
            id: 'chinese-english-translation',
            name: L('英汉互译', 'Translation', '日英翻訳練習'),
          },
          {
            id: 'primary-english-exam',
            name: L('小升初试卷', 'Entrance Exam Paper', '中学受験英語問題'),
          },
        ],
      },
      {
        key: 'math',
        label: L('数学', 'Math', '数学'),
        tasks: [
          { id: 'math-jiaojiao', name: L('叫叫打卡', 'Jiaojiao Check-in', '叫叫チェックイン') },
          { id: 'math-calculation', name: L('计算', 'Calculation', '計算') },
          { id: 'math-word-problems', name: L('应用题', 'Word Problems', '文章題') },
          {
            id: 'primary-math-class',
            name: L('小升初上课', 'Entrance Prep Class', '中学受験算数授業'),
          },
          {
            id: 'primary-math-exam',
            name: L('小升初试卷', 'Entrance Exam Paper', '中学受験算数問題'),
          },
        ],
      },
      {
        key: 'chinese',
        label: L('语文', 'Chinese', '国語'),
        tasks: [
          { id: 'chinese-poetry', name: L('古诗词积累', 'Poetry', '古詩文') },
          {
            id: 'chinese-reading-comprehension',
            name: L('阅读理解', 'Reading Comprehension', '読解'),
          },
          { id: 'chinese-composition', name: L('习作练习', 'Composition', '作文練習') },
          {
            id: 'primary-chinese-class',
            name: L('小升初语文课', 'Entrance Prep Class', '中学受験国語授業'),
          },
          {
            id: 'primary-chinese-exam',
            name: L('小升初试卷', 'Entrance Exam Paper', '中学受験国語問題'),
          },
        ],
      },
      {
        key: 'general',
        label: L('综合拓展', 'Enrichment', '総合拓展'),
        tasks: [
          { id: 'science-reader', name: L('科学学科读本', 'Science Reader', '科学読本') },
          {
            id: 'culturally-responsive',
            name: L('Culturally Responsive', 'Culturally Responsive', 'Culturally Responsive'),
          },
          { id: 'steam-pbl', name: L('Steam PBL', 'Steam PBL', 'Steam PBL') },
          { id: 'us-history', name: L('美国历史', 'US History', 'アメリカ歴史') },
        ],
      },
    ],
  },
  {
    ...TASK_CATEGORIES.physical,
    subCategories: [
      {
        key: 'default',
        label: L('', '', ''),
        tasks: [
          { id: 'exercise', name: L('运动', 'Exercise', '運動') },
          { id: 'ball-sports', name: L('打球', 'Ball Sports', '球技') },
          { id: 'swimming', name: L('游泳', 'Swimming', '水泳') },
          { id: 'walking', name: L('散步', 'Walking', '散歩') },
        ],
      },
    ],
  },
  {
    ...TASK_CATEGORIES.creativeLeisure,
    subCategories: [
      {
        key: 'default',
        label: L('', '', ''),
        tasks: [
          { id: 'art', name: L('美术', 'Art', '美術') },
          { id: 'crafts', name: L('手工', 'Crafts', '手工芸') },
          { id: 'cooking', name: L('烹饪', 'Cooking', '料理') },
          { id: 'board-games', name: L('桌游', 'Board Games', 'ボードゲーム') },
        ],
      },
    ],
  },
  {
    ...TASK_CATEGORIES.habits,
    subCategories: [
      {
        key: 'default',
        label: L('', '', ''),
        tasks: [
          { id: 'clean-desk', name: L('清理书桌', 'Clean Desk', '机の整理') },
          { id: 'wash-dishes', name: L('洗碗', 'Wash Dishes', '食器洗い') },
        ],
      },
    ],
  },
  {
    ...TASK_CATEGORIES.schedule,
    subCategories: [
      {
        key: 'default',
        label: L('', '', ''),
        tasks: [
          { id: 'wake-up', name: L('早起', 'Wake Up', '早起き'), time: '09:00' },
          { id: 'sleep-early', name: L('早睡', 'Sleep Early', '早寝'), time: '23:00' },
        ],
      },
    ],
  },
];

/** 从大类提取分类标志位 */
function getCategoryFlags(category) {
  return {
    isLearning: category.isLearning,
    isPhysical: category.isPhysical,
    isCreativeLeisure: category.isCreativeLeisure,
    isHabits: category.isHabits,
    isSchedule: category.isSchedule,
  };
}

/** 将任务树扁平化为带标志位的任务列表 */
function flattenTaskTree(tree) {
  return tree.flatMap((category) =>
    category.subCategories.flatMap((subCategory) =>
      subCategory.tasks.map((task) => ({
        ...task,
        categoryKey: category.key,
        categoryLabel: category.label,
        subCategoryKey: subCategory.key,
        subCategoryLabel: subCategory.label,
        ...getCategoryFlags(category),
      })),
    ),
  );
}

/** 全部任务（扁平列表，含 categoryKey / subCategoryKey 与分类标志位） */
export const ALL_TASKS = flattenTaskTree(TASK_TREE);

/** 按大类分组的任务树（与 TASK_TREE 相同，便于语义化导入） */
export const TASKS_BY_CATEGORY = TASK_TREE;
