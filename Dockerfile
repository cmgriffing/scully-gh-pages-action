FROM node:14-alpine3.10

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

ENV WORKSPACE GITHUB_WORKSPACE
WORKDIR $WORKSPACE

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
