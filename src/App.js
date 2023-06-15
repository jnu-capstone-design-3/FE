import React from "react";
import Router from "./router/Route";
import { store } from "./stores/store";
import { Provider } from "react-redux";

function App() {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
}

export default App;
