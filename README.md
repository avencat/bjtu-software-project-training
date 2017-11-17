# bjtu-software-project-training
We have to make a Social Network and use PostgreSQL, we will make the app with React.JS and Bootstrap for the front-end and Node.JS, express, passport and pg-promise for the back-end.

## Prerequesities
You must have some dependencies in order to run the program:
- `npm` or `yarn` (as you wish) with `node`
- PostgreSQL ≥ 9.6 with `psql` installed

## Installation
### Follow these steps (inside a terminal):
1. Clone the repo:
    ```
    git clone https://github.com/avencat/bjtu-software-project-training.git
    ```
2. Go to the repo:
    ```
    cd bjtu-software-project-training
    ```
3. Install dependencies for the front-end:
    ```
    yarn
    ```
    or
    ```
    npm install
    ```
4. Go to the API dir:
    ```
    cd api
    ```
5. Install dependencies for the API:
    ```
    yarn
    ```
    or
    ```
    npm install
    ```

## Configuration
The default configuration that comes with the project is as follow:

- Database name: `socialnetwork`
- Test database name: `socialnetworktest`
- PostgreSQL user to connect to the databases: `postgres`
- Password of the user: `root`

You can let the default configuration and go straight to the next part or modify that configuration with these simple steps:

- Modify the `api/config.json` file and replace the end of the two urls with the names of the databases you want to use.
- Modify the first three lines of the files `api/database.sql` and `api/database-test.sql` by replacing the names of the databases with those that you want to use (They MUST match the names that you entered in the file `api/config.json` at the previous step).
- Don't forget to enter in `api/config.json` the credentials of a PostgreSQL user that has the rights to CREATE a database

You file `config.json` should look like something like this:
```json
{
  "database" : {
    "test": "postgres://user:password@localhost:5432/socialnetworktest",
    "dev": "postgres://user:password@localhost:5432/socialnetwork"
  }
}
```
where user is a PostgreSQL user with the CREATE DATABASE right and password this user's password.

## Database installation
### In a terminal, go inside the API directory and type:
```
psql -f database.sql -u postgres -d postgres
psql -f database-test.sql -u postgres -d postgres
```

## Run the tests (Strongly advised)
After the installation of the databases with the two `psql` commands, you might want to run the test in order to see if the project were correctly installed.

In the API directory launch:
```
yarn test
```
or
```
npm test
```

## Run the program
In the API directory:
```
yarn start
```
or
```
npm start
```

Then open a new terminal, go to the root project directory and launch the web server:
```
yarn start
```
or
```
npm start
```

Then go to `http://localhost:3000/register` and you should be able to register you first user.

#### Congratulations!

### Bonus: API documentation
You might want to call the API directly. We provided a documentation in order to let you know what you can do with our API. You can open it in your browser. It's located in `api/doc/index.html`
