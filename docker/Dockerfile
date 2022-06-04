FROM alpine:3

RUN echo "=== Installing git"
RUN apk add --no-cache git

RUN echo "=== Setting up user for booking service"
RUN adduser -s /bin/false -D booking

RUN echo "=== Downloading copy of booking system from github"
USER booking
WORKDIR /home/booking
RUN git clone --depth=1 'https://github.com/ahbnr/booking.git'

RUN echo "=== Installing yarn"
USER root
RUN apk add --no-cache yarn

RUN echo "=== Installing booking dependencies"
USER booking
WORKDIR /home/booking/booking
RUN yarn workspace common install && \
    yarn workspace backend install && \
    yarn workspace frontend install

RUN echo "=== Building booking system"
RUN yarn workspace common build && \
    yarn workspace backend build && \
    yarn workspace frontend build

USER root

RUN echo "=== Installing sudo"
RUN apk add --no-cache  sudo

RUN echo "=== Set service file as entrypoint"

COPY start-services /usr/local/bin/start-services
RUN chmod +x /usr/local/bin/start-services

ENTRYPOINT ["/bin/sh", "/usr/local/bin/start-services"]