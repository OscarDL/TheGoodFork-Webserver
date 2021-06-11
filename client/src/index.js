import React from "react"
import ReactDOM from "react-dom"

import "./index.css"
import App from "./Components/App"
import { reducer } from "./Context/reducer"
import { Provider } from "./Context/Provider"

ReactDOM.render(
  <React.StrictMode>
    <Provider reducer={reducer}>
      <App/>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
)