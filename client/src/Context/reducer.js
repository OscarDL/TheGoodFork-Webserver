export const reducer = (state, action) => {

  switch(action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.user
      }

    case "SIDEBAR":
      return {
        ...state,
        sidebar: action.sidebar
      }

    default:
      return state
  }
  
}