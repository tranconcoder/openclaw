FROM alpine/openclaw:main

USER root

# Install cron and dependencies
RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

USER node
