import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { WagmiProvider } from "wagmi";

import App from "./App";
import { wagmiConfig } from "./lib/web3";
import { store } from "./store";
import "./index.css";

// React Query only backs wagmi's internal caching here; all application server
// state goes through RTK Query.
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
      </Provider>
    </QueryClientProvider>
  </WagmiProvider>,
);
