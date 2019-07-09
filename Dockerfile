FROM node:12



RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# install mongodb
# RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4\
#     && echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/4.0 main" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list\
#     && apt-get update \
#     && apt-get install -y mongodb-org\
#     && echo "mongodb-org hold" | dpkg --set-selections\
#     && echo "mongodb-org-server hold" | dpkg --set-selections\
#     && echo "mongodb-org-shell hold" | dpkg --set-selections\
#     && echo "mongodb-org-mongos hold" | dpkg --set-selections\
#     && echo "mongodb-org-tools hold" | dpkg --set-selections\
#     && service mongod enable\
#     && service mongod start

# ENV DB_NAME=TEST
# ENV TOKEN=TEST

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]