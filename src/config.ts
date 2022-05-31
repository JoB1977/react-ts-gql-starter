const appConfig = Object.freeze({
  githubGraphqlApi: 'https://api.github.com/graphql',
  githubGraphqlAccessToken: process.env.GITHUB_GQL_PAT,
});

export default appConfig;
