FROM node:24-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl gnupg supervisor procps nginx \
      certbot python3-certbot-dns-cloudflare \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://pgp.mongodb.com/server-8.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg \
 && echo "deb [signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" \
      > /etc/apt/sources.list.d/mongodb-org-8.0.list \
 && apt-get update && apt-get install -y --no-install-recommends mongodb-org \
 && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y cron

RUN apt-get update && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*


RUN curl -L -o /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
 && dpkg -i /tmp/cloudflared.deb || apt-get -y -f install \
 && rm -f /tmp/cloudflared.deb

WORKDIR /app
RUN mkdir -p /app/backend /app/frontend /data/db /app/cloudflared \
           /etc/letsencrypt /var/lib/nginx/body /var/cache/nginx /run/nginx /var/log/nginx

COPY backend/package*.json /app/backend/
COPY frontend/package*.json /app/frontend/


WORKDIR /app/backend
RUN npm ci || npm install

WORKDIR /app/frontend
RUN npm ci || npm install

WORKDIR /app
COPY backend /app/backend
COPY frontend /app/frontend
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx/app.conf /etc/nginx/conf.d/app.conf
COPY scripts/init-certs.sh /usr/local/bin/init-certs.sh
RUN chmod +x /usr/local/bin/init-certs.sh

RUN curl https://get.acme.sh | sh -s email=$CERTBOT_EMAIL
ENV ACME_HOME=/root/.acme.sh



ENV CHOKIDAR_USEPOLLING=true \
    VITE_HOST=0.0.0.0 \
    PORT_BACKEND=3000 \
    PORT_FRONTEND=5173

EXPOSE 5173 3000 443
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
