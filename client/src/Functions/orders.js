import axios from 'axios';

import { config } from './utils';
import { apiUrl } from '../config';


export const getOrders = async () => {
  try {
    const {data} = await axios.get(apiUrl + 'orders', config);

    if (!data.success) return data?.error;

    return {success: true, orders: data.orders};
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};