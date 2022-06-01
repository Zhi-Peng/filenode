FROM alpine:latest
WORKDIR /
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && apk add --no-cache --update nodejs
ADD node_modules.zip .
COPY ./build/* .
EXPOSE 9000
CMD [ "node", "app.js" ]
