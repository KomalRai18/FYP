import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import store from "./redux/store.jsx"
import "./index.css"
import Browser from "./components/browser.js"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
     <Browser/>
    </Provider>
  </React.StrictMode>,
)
