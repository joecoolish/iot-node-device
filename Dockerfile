# Build the Dockerfile with this command: docker build -t joecoolish/iot-client .
# docker run -it --rm --name iot-client -p 3000:3000 joecoolish/iot-client
FROM node as builder

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./tsconfig.json .
COPY ./package-lock.json .
COPY ./src/ ./src/
RUN npm install
RUN npm run tsc

FROM node

RUN apt-get update

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/ .
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install

EXPOSE 3000

CMD [ "node", "server.js" ]