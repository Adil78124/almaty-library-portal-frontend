FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

ARG BACKEND_URL=http://backend:4000
ENV BACKEND_URL=$BACKEND_URL
ENV UPLOAD_DIR=/app/public/uploads

RUN npm run build

EXPOSE 3000

VOLUME ["/app/public/uploads"]

CMD ["npm", "start"]
