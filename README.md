# react-ts-gql-starter
React meets TS meets GraphQL in a first try

## Install

- Clone repository, install dependecies & and create files for configuration 
```sh
> git clone git@github.com:JoB1977/react-ts-gql-starter.git

> cd react-ts-gql-starter
> npm i

> cp .env.sample .env
> cp .graphqlconfig.sample .graphqlconfig
> cp codegen.yml.sample codegen.yml
```

- Put your own `<GITHUB_PERSONAL_ACCESS_TOKEN>` in created files (replace placeholders).
- Make sure the token has the permissions to read repos & users.

Now you can do introspection for updating GraphQL-schema (use GraphQL-plugin for your IDE) and regenerate types.
Regulary the types will not change, but in case they do, you can keep the definitions up to date. 
```sh
> npm run graphql-codegen
```

## Run

Execute NPM-task 
```sh
> npm start
```
