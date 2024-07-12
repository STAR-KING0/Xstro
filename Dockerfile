# official Node.js 20.12.0 LTS Buster image as a parent image
FROM node:20.12.0-buster-slim
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/AstroFx0011/Xstro .
RUN npm update && npm upgrade
# Remove .git directory to reduce image size
RUN rm -rf .git
RUN npm install
RUN yarn install --frozen-lockfile
EXPOSE 8000
ENV NODE_ENV production
CMD ["yarn", "start"]