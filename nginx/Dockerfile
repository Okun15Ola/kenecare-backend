# Use an official NGINX Alpine image as the base
FROM nginx:alpine

# Remove the default NGINX configuration
RUN rm /etc/nginx/conf.d/default.conf

ARG NGINXFILE
# Copy the custom NGINX configuration file
COPY ./default.conf /etc/nginx/conf.d/default.conf


# Set NGINX to run in the foreground
# CMD ["nginx", "-g", "daemon off;"]