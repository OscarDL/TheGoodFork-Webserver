import React, { createContext, useReducer } from "react"

export const Context = createContext()

const state = {
  user: null,
  sidebar: true
}

export const Provider = ({reducer, children}) => (
  <Context.Provider value={useReducer(reducer, state)}>
    {children}
  </Context.Provider>
)