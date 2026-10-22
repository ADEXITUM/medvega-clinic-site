# Источники изображений

Фотографии взяты из фотобанка Pexels (лицензия Pexels: бесплатное использование, указание автора не обязательно, но приведено ниже).
Исходные JPEG перекодированы в WebP (1200 и 640 пикселей, кадр 3:2) скриптом `scripts/images.mjs`.

| Файл | Где используется | Автор | Страница фото |
|---|---|---|---|
| `public/images/hero-*.webp` | Главная, первый экран | Lucas Guimarães Bueno | https://www.pexels.com/photo/doctor-talking-with-woman-in-white-long-sleeve-shirt-12599544/ |
| `public/images/reception-*.webp` | «О клинике» | Los Muertos Crew | https://www.pexels.com/photo/waiting-room-in-a-hospital-8459996/ |
| `public/images/ultrasound-*.webp` | «О клинике» | MART PRODUCTION | https://www.pexels.com/photo/photo-of-person-using-ultrasound-scan-7089299/ |
| `public/images/ophthalmology-*.webp` | «О клинике» | Ksenia Chernaya | https://www.pexels.com/photo/unrecognizable-ophthalmologist-checking-vision-of-patient-5752287/ |
| `public/images/kids-*.webp` | «О клинике» | Pavel Danilyuk | https://www.pexels.com/photo/doctor-in-white-lab-coat-sitting-in-front-of-little-girl-and-listening-5998443/ |
| `public/images/lab-*.webp` | «О клинике» | Edward Jenner | https://www.pexels.com/photo/scientists-in-laboratory-4031417/ |
| `public/images/cardio-*.webp` | «О клинике» | Pavel Danilyuk | https://www.pexels.com/photo/patient-lying-in-a-doctors-office-7108336/ |

Прочие изображения:

| Изображение | Где используется | Источник |
|---|---|---|
| Аватары врачей с инициалами (`DoctorAvatar.vue`) | Карточки и страницы врачей | Генерируются из ФИО средствами CSS (п. 4.3 ТЗ допускает вместо портретов) |
| Логотип, favicon, иконки приложения | Шапка, подвал, вкладка браузера, PWA | Выполнены автором в SVG; PNG-иконки – `scripts/icons.mjs` |
| Схематичная карта-заглушка (`OsmMap.vue`) | Главная, блок «Как нас найти» | Выполнена автором в SVG |
| Иконки интерфейса | Весь сайт | Lucide (`@lucide/vue`), лицензия ISC, https://lucide.dev |
| Шрифт Manrope | Весь сайт | `@fontsource/manrope`, лицензия SIL Open Font License 1.1 |
| `public/og-image.png` | Превью в соцсетях (Open Graph) | Скриншот главной страницы, `scripts/screens.mjs` |
| Карта | «Контакты», главная (по нажатию) | © участники OpenStreetMap, лицензия ODbL |
