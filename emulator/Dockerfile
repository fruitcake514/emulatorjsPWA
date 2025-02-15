FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY . .

# Ensure ROMs and saves directories exist
RUN mkdir -p /usr/share/emulator/roms /usr/share/emulator/saves

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
