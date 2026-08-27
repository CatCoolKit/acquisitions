FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN addgroup -S nodejs && \
    adduser -S nodejs -G nodejs

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
CMD node -e "require('http').get('http://localhost:3000/health',res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

FROM base AS development

USER root
RUN npm install
USER nodejs

CMD ["npm","run","dev"]

FROM base AS production

CMD ["npm","start"]