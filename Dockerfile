# official Node.js 20.12.0 LTS Buster image as a parent image
FROM node:20.12.0-buster-slim
RUN npm install --global yarn
RUN yarn install --frozen-lockfile
RUN git clone git clone https://github.com/AstroFx0011/Xstro /root/bot
WORKDIR /root/luv
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Remove .git directory to reduce image size
RUN rm -rf .git
EXPOSE 8000
ENV NODE_ENV production
CMD ["yarn", "start"]