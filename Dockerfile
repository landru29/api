FROM     debian:jessie
MAINTAINER Landru "cmeichel@free.fr"

ENV DEBIAN_FRONTEND noninteractive
ENV NODE_VERSION v5.3.0
ENV NPM /opt/node/bin/npm

COPY dist /dist

RUN \
    apt-get update && \
    apt-get install -y git wget  && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    cd /opt && \
    wget --no-check-certificate https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.gz && \
    tar xf node-${NODE_VERSION}-linux-x64.tar.gz && \
    rm -f node-${NODE_VERSION}-linux-x64.tar.gz && \
    mv node-${NODE_VERSION}-linux-x64 node && \
    cd /usr/local/bin && \
    ln -s /opt/node/bin/* . && \
    echo "Ready"

CMD cd /dist && \
    ${NPM} start
