FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Ensure the ROMs directory exists
RUN mkdir -p /app/roms

EXPOSE 4000

CMD ["node", "server.js"]
