FROM node:16.12.0

RUN mkdir -p /usr/src/smart-brain-api
WORKDIR /usr/src/smart-brain-api

COPY package.json /usr/src/smart-brain-api
RUN npm install

COPY . /usr/src/smart-brain-api

ARG NODE_VERSION=16.12.0

ENV NODE_VERSION $NODE_VERSION

CMD ["/bin/bash"]