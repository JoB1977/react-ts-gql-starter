import { ApolloProvider } from '@apollo/client';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './index.css';
import gqlClient from './graqhql-client';

const rootEl = document.getElementById('app') as HTMLElement;
const root = createRoot(rootEl);
root.render(
  <ApolloProvider client={gqlClient}>
    <App />
  </ApolloProvider>,
);
