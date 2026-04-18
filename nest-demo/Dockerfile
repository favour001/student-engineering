FROM node:20-alpine
COPY . .
ENV TZ=Asia/Guangzhou
RUN npm set registry=https://registry.npmmirror.com
RUN npm i -g pnpm && pnpm i && pnpm run build
EXPOSE 3000 
CMD node dist/main.js