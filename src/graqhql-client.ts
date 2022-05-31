import { ApolloClient, ApolloLink, createHttpLink, from, InMemoryCache } from '@apollo/client';
import appConfig from './config';

const link = createHttpLink({ uri: appConfig.githubGraphqlApi });

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: { ...headers, Authorization: `Bearer ${appConfig.githubGraphqlAccessToken}` },
  }));

  return forward(operation);
});

const gqlClient = new ApolloClient({
  link: from([authMiddleware, link]),
  cache: new InMemoryCache({
    resultCaching: false,
    addTypename: false,
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

export default gqlClient;
