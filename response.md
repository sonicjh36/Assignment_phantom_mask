# Response

The API server is imeplemented by:
- `Docker` to build the image and run the container
- `PostgreSQL` to do the database control
- `Node.js` and `Express.js` to create API server
- `Knex.js` to connect to databse and do the operation in the database
- `Swagger-UI` and `swagger-jsdoc` to present the API document

## Setup
- `git clone` the repository
- Run the docker command `docker-compose up`

## Import Data Commands (required)
Once the server is up, please follow the step to import data:
  - Put `pharmacy.json` and `user.json` in the `data` folder
  - `docker exec node_server npm run migrate` to create table in the database
  - `docker exec node_server npm run seed` to extract data and put in the table
## API Document (required)
  Please go to `http://localhost:3000/api-docs/` to see the document after the server is running

