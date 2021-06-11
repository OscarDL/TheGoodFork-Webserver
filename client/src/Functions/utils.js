export const config = {
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  credentials: 'include'
};

export const truncPrice = (price) => Number(price).toFixed(2);