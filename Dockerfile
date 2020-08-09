FROM node:carbon

WORKDIR /usr/src/smart-brain-api

COPY ./ ./

RUN npm install
RUN npm install -g nodemon

CMD ["/bin/bash"]