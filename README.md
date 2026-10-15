# МедВега – корпоративный сайт частной медицинской компании

Учебный проект к курсовой работе «Разработка корпоративного сайта частной медицинской компании»
(БГПУ, дисциплина «Разработка корпоративных сайтов», 2026). Компания «МедВега» и все сведения о ней вымышлены.

**Сайт:** https://adexitum.github.io/medvega-clinic-site/ · репозиторий: https://github.com/ADEXITUM/medvega-clinic-site

## Возможности

- 15 страниц: главная, направления (8), врачи (16), цены, онлайн-запись, акции, отзывы, о клинике, документы, контакты,
  «Мои записи», политика ПДн, 404;
- онлайн-запись в 5 шагов: направление → врач → дата (14 дней) → время (слоты по 30 мин) → данные пациента;
- каталог врачей с фильтром, поиском и сортировкой; состояние фильтра хранится в адресе страницы;
- прайс-лист с мгновенным поиском по названию и коду услуги;
- «Мои записи» с отменой, отзывы с модерацией, обратный звонок, cookie-уведомление, карта OpenStreetMap;
- версия для слабовидящих (ГОСТ Р 52872-2019): шрифт 100/130/160 %, 4 цветовые схемы, скрытие изображений,
  межбуквенный интервал;
- SEO: уникальные title/description, Open Graph, canonical, `sitemap.xml`, `robots.txt`, JSON-LD
  (`MedicalClinic`, `Physician`, `BreadcrumbList`);
- обязательная информация для медицинской организации (ПП РФ № 736, 152-ФЗ, 38-ФЗ ст. 24).

Бэкенда нет: справочники лежат в `app/data/*.json`, записи и отзывы пользователя сохраняются в `localStorage`.
Никакие персональные данные никуда не передаются.

## Стек

Nuxt 4 (Vue 3, Composition API, `<script setup>`, TypeScript) · SCSS + CSS-переменные, БЭМ · статическая генерация
(`nuxt generate`) · GitHub Actions + GitHub Pages · ESLint + Prettier · Playwright · Lighthouse · Mermaid.

## Запуск

Нужен Node.js 20+.

```bash
npm install
npm run dev          # режим разработки: http://localhost:3000
npm run generate     # статическая сборка в .output/public
npm run preview      # просмотр сборки: http://localhost:3000 (serve)
```

Проверки:

```bash
npm run lint         # ESLint (+ Prettier-совместимые правила)
npm run typecheck    # проверка типов
npx playwright install chromium
npm run generate && npm run test:e2e   # e2e-тесты (сервер serve запускается автоматически на :4173)
```

Материалы для пояснительной записки:

```bash
npx serve .output/public -l 4173   # в отдельном терминале
npm run screens                    # скриншоты в docs/screens/
npm run diagrams                   # схемы docs/diagrams/*.mmd → PNG
```

## Публикация на GitHub Pages

1. Создайте репозиторий `medvega-clinic-site` и отправьте код в ветку `main`.
2. Settings → Pages → Source: **GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` при каждом пуше в `main` устанавливает зависимости, запускает ESLint,
   собирает сайт с `NUXT_APP_BASE_URL=/<имя-репозитория>/` и публикует `.output/public` через `actions/deploy-pages`.

Файл `public/.nojekyll` отключает обработку Jekyll, чтобы папка `_nuxt` отдавалась как есть.

## Структура проекта

```
app/
  assets/styles/   дизайн-система: токены, сброс, типографика, сетка, кнопки и поля, темы для слабовидящих
  components/      компоненты интерфейса (шапка, подвал, карточки, модальное окно, аккордеон, тосты…)
  composables/     useA11y, usePromos, usePageSeo, useToast, форматирование, маска телефона
  data/            JSON-справочники: направления, услуги, врачи, расписание, акции, отзывы, FAQ, клиника
  layouts/         общий макет страницы
  pages/           страницы (маршруты формируются по файлам)
  services/api.ts  слой доступа к данным с имитацией асинхронного API
  types/           типы TypeScript
  app.vue, error.vue
server/routes/     генерация sitemap.xml и robots.txt
public/            favicon, .nojekyll, og-image
tests/             e2e-тесты Playwright
scripts/           скриншоты и экспорт схем
docs/              скриншоты, схемы, отчёт Lighthouse, источники изображений
```

## Лицензии

Код – MIT. Иконки – Lucide (ISC). Шрифт Manrope – SIL OFL 1.1. Карта – © участники OpenStreetMap (ODbL).
