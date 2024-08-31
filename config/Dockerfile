FROM kong:latest
USER root

RUN apt-get update && apt-get install -y nodejs npm && npm install -g kong-pdk

# custom auth plugin for custom auth server
RUN mkdir -p /usr/local/kong/js-plugins
COPY ./plugins /usr/local/kong/js-plugins

# Check if package.json exists and then install dependencies
RUN if [ -f /usr/local/kong/js-plugins/package.json ]; then cd /usr/local/kong/js-plugins && npm install; fi


USER kong