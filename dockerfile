FROM node:20.1.0
LABEL maintainer="herrera_jluis@hotmail.com"

# Create and define app work directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Copy gestion-aqlguiler-api-node project to container
COPY . /usr/src/app/

# Run npm install for install app dependences for principal and submodules into dependencies
RUN npm install

# Expone el puerto en el que se ejecutará tu aplicación
EXPOSE 2000

# Start crm-connections app
CMD npm run start