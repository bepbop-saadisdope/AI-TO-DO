# React + Vite frontend (dev server). For a production build you'd instead
# `npm run build` and serve the static dist/ with nginx.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
# --host makes Vite listen on 0.0.0.0 so it's reachable from the host machine.
CMD ["npm", "run", "dev", "--", "--host"]
