# MQCybersec Bot

## Docker Instructions

### Using Docker Compose

```
docker-compose up -d
docker compose up -d
```

### Without docker compose

```
docker build -t <image-name> .
docker run -d -v /var/log/<create folder for logs>/:/usr/src/app/logs/ -m 300m --cpus "0.5" --name <name for container> <image-name>

E.g.
docker build -t mc-server-bot-image .
docker run -d -v /var/log/bot-test/:/usr/src/app/logs/ -m 300m --cpus "0.5" --name bot-test bot-test
```

**Flags**

- Set detached from foreground
- Set bind mount for logging path (Unix Path is used. Change if host is windows)
- Limit memory to 300MBs and 0.5 cores
- Set tag for container

*Change memory restrictions for your own requirements*

## .env file

*Copy the .env.sample file*

* -> Required

- PROD_BOT_TOKEN*
    - Discord bot token for production environment
- DEV_BOT_TOKEN
    - Discord bot token for development environment
- BOT_PREFIX*
    - Prefix for bot commands
- LOG_DIR*
    - Directory path for logs
- ADMIN_ROLE_NAME*
    - Name of admin role for the bot

## Default Required Bot Permission 

- Send Messages
- Manage Roles
    - Create Bot Admin Role
- Manage Channels

And that's it!


