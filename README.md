# Gestión de Alquileres Turísticos

Este proyecto es una aplicación para una empresa gestora de alquileres turísticos. Permite gestionar ingresos y gastos de apartamentos, proporcionando funcionalidades para agregar, modificar y eliminar datos de apartamentos, ingresos y gastos. También incluye funcionalidades de autenticación de usuarios y cálculo de liquidación trimestral de IVA.
gestión-alquiler-api-node es la parte del Backend para la implementación de la API RESTFULL desarrollada con NodeJS

## Características

- Autenticación de usuarios
- Gestión de apartamentos (alta, baja, modificación)
- Gestión de ingresos (alta, baja, modificación, cálculo de IVA y total de factura)
- Gestión de gastos (alta, baja, modificación, cálculo de IVA y total de gasto)
- Registro de usuarios, fecha y hora de inicio y final de sesión
- Cálculo de liquidación trimestral de IVA
- Dashboard con estadísticas y resúmenes financieros

## Librerías Instaladas con NPM

- fastify
- fastify-cli
- @fastify/autoload
- @fastify/cors
- @fastify/env
- @fastify/jwt
- @fastify/sensible
- @fastify/swagger
- @fastify/swagger-ui
- crypto
- dotenv
- moment-timezone
- mongoose
- neverthrow
- uuidv4

## Requisitos Previos

- Docker
- Docker Compose

## Instalación

### Clonar el Repositorio

```
git clone https://github.com/2plu/gestion-alquiler-api-node.git
```

### Configurar el Archivo `.env`
Copia el archivo .env.default a .env y configura las variables de entorno, especialmente las relacionadas con la base de datos MongoDB:


## Iniciar el Servidor
```
/* Levantar los contenedores 'gestion-alquiler-api-node', 'mongodb' y 'mongo-espress' con Docker Compose*/
docker compose up -d -- build

/* el argumento --build solo es necesario la primera vez para construir el contenedor */
```

### Uso
- Visita http://localhost:2000/documentation en tu navegador para acceder al Swagger.
- Registar nuevo usuario en el endpoint `POST /users` dentro del grupo Users (no requiere autenticación).
- Obtener token con el usuario y password registrado en el paso anterior desde el endpoint `POST /auth/login` dentro del grupo Auth
- Pulsar el botón `Authorize` en la parte superior derecha de la Página e introducir `Bearer <token_generado>`
