# Node.js 20.12.0 LTS Buster image
FROM node:20.12.0-buster-slim
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/AstroFx0011/Xstro /root/bot
# Remove .git directory to reduce image size
RUN rm -rf .git
WORKDIR /root/bot
EXPOSE 8000
ENV NODE_ENV production
CMD ["npm", "start"]