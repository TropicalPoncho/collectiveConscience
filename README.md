# collectiveConscience
Collective Conscience is a dynamic and digital piece of art that changes itself
with the interaction of each person that is reached by it.

## Repository Overview

The project is a Node.js/Express web application for an interactive digital artwork named “Collective Conscience.” The README briefly introduces it as a dynamic, participatory piece of art.

### Key Components

1. **Server Setup**
   - The entry point (`bin/www`) launches an Express server on port 3000.
   - `app.js` configures middleware, static files, and routes for **index**, **users**, **network**, **soma**, and **neurons** endpoints.
   - MongoDB connection parameters are loaded from environment variables in `config/db.js`.

2. **Data Models**
   - `models/neurons.js` defines the schema for a “neuron” document with fields such as `nickName`, `email`, and `order`.
   - `models/synapses.js` specifies a “synapse” with `fromId`, `toId`, and location data.

3. **Business Logic**
   - `services/neuronsService.js` handles CRUD-like interactions with the Neuron model. It supports creating neurons and retrieving them with pagination or by order.

4. **Routing**
   - Routes under `routes/` deliver pages and API responses. For example, `routes/network.js` renders a “network” view by querying neurons and handles optional parameters for synapse creation.

5. **Views and Static Assets**
   - Pug templates live in `views/` (e.g., `layout.pug` defines the HTML skeleton).
   - Client-side scripts in `public/javascripts/` manage the interactive network using Three.js and 3d-force-graph. The main network logic resides in `network.js` and `neuralNetworkRender.js`, which builds 3D objects and camera movements.

6. **Container and CI/CD**
   - Dockerfile and compose files set up a Node container with MongoDB and Mongo Express.
   - GitHub Actions workflows (`.github/workflows/*`) install dependencies, run tests, and deploy via SSH in production.

### Recommended Next Steps for New Contributors

1. **Understand Express Basics** – Familiarize yourself with middleware, routing, and the `app.js` pattern used here.
2. **Learn Mongoose** – Study how schemas and models map to MongoDB documents, as in `neurons.js`.
3. **Explore Three.js** – The front-end heavily relies on Three.js for rendering nodes and animations in `neuralNetworkRender.js`.
4. **Review Docker and Environment Setup** – Check `docker-compose.yml` and `.env` usage to run the full stack locally.
5. **Investigate Deployment Workflow** – See how GitHub Actions automate build, test, and deployment.

This structure centers on Express routes calling service classes that access MongoDB, while the front-end renders an evolving network of “neurons” in 3D. Understanding these pieces will help you navigate and extend the project.

## Local run (app on host, Mongo in Docker)

1. Instala dependencias en el host: `npm install`.
2. Levanta solo la base en Docker: `docker compose up -d mongo` (opcional `mongo-express`).
3. Variables locales: por defecto se usa `mongodb://127.0.0.1:27017/collectiveconscience`; define `MONGODB_URI` si quieres otra cadena.
4. Ejecuta la app en el host: `npm run dev` (ó `npm start`).
5. Abre http://localhost:3000 y confirma conexión en logs (“MongoDB conectado exitosamente”).
