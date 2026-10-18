# Node/Express enquiry + upload API.  docker build -t pslaser/node-api services/node-api
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src/ src/
COPY public/ public/
# uploads and logs live in /app/storage: mount a volume there so they survive container rebuilds
RUN mkdir -p storage/uploads storage/logs && chown -R node:node /app/storage
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
