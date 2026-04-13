const questions = [
  {
    id: 1,
    type: 'text',
    text: 'Скільки вам років?',
  },
  {
    id: 2,
    type: 'text',
    text: 'Яке ваше улюблене хобі?',
  },
  {
    id: 3,
    type: 'checkbox',
    text: 'Які види спорту вам подобаються?',
    options: [
      'Футбол',
      'Баскетбол',
      'Теніс',
      'Плавання',
      'Біг',
      'Інше',
    ],
  },
  {
    id: 4,
    type: 'checkbox',
    text: 'Які жанри музики ви віддаєте перевагу?',
    options: [
      'Рок',
      'Поп',
      'Джаз',
      'Класика',
      'Електронна',
      'Хіп-хоп',
    ],
  },
  {
    id: 5,
    type: 'multiselect',
    text: 'Які мови програмування ви знаєте? (оберіть усі підходящі)',
    options: [
      'JavaScript',
      'Python',
      'Java',
      'C++',
      'C#',
      'PHP',
      'Інші',
    ],
  },
  {
    id: 6,
    type: 'multiselect',
    text: 'Які соціальні мережі ви використовуєте?',
    options: [
      'Facebook',
      'Instagram',
      'Twitter (X)',
      'TikTok',
      'LinkedIn',
      'VK',
      'Інші',
    ],
  },
  {
    id: 7,
    type: 'text',
    text: 'Що ви думаєте про майбутнє технологій?',
  },
];

export default questions;
