# Check out https://hub.docker.com/_/node to select a new base image
# Родительский (главный) образ
FROM node:18.16.0-alpine

# Переключаемся на управление от пользовалеля node
# По умолчанию Docker запускает контейнер как root, что внутри контейнера может представлять проблему безопасности.
USER node

# Создаем папку для проекта
RUN mkdir -p /home/node/dist/back-for-shop

# Инструкция WORKDIR в Dockerfile позволяет один раз указать конкретный путь (каталог на диске),
# после чего большинство инструкций (например, RUN и COPY) будут выполняться в контексте этого каталога.
WORKDIR /home/node/dist/back-for-shop

# Копируем файлы package.json и yarn.lock. Они потребуются для установки зависимостей проекта
# --chown изменяет владельца скопированных файлов в контейнере
COPY --chown=node package*.json ./
COPY --chown=node yarn.lock ./

# Установка зависимостей c блокировкой изменения версий пакетов
RUN yarn install

# Устанавливаем переменные окружения
# По данному порту будет подыматься приложение в контейнере
ENV PORT=9876

# Копируем файлы проекта
COPY --chown=node . .

# Запускаем сборку проекта
RUN yarn build

# Инструкция EXPOSE информирует Docker о том, что контейнер прослушивает указанные сетевые порты во время выполнения.
# По умолчанию использует протокол TCP
EXPOSE ${PORT}

# Указываем команду и аргументы для выполнения внутри контейнера.
CMD [ "yarn", "start" ]


# Для локальной сборки image
# docker build . -t back-for-shop
# Запуск контейнера
# docker run -p 9876:9876  back-for-shop