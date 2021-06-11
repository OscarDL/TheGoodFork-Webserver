import axios from 'axios';

import { config } from './utils';
import { apiUrl } from '../config';


export const getDishes = async (type = null) => {
  try {
    const {data} = await axios.get(apiUrl + 'dishes', config);

    if (!data.success) return data?.error;

    let tmpDishes, newDishes = [];
    tmpDishes = data.dishes;

    if (tmpDishes) tmpDishes.forEach((dish, i) => dish.key = i);
    tmpDishes.forEach(dish => {
      if (dish.type === type || type === null) newDishes.push(dish);
    });

    return {success: true, dishes: newDishes};
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const createDish = async (dish) => {
  try {
    const {data} = await axios.post(apiUrl + 'dishes', dish, config);

    if (!data.success) return data?.error;

    return {
      success: true,
      title: 'Création réussie',
      desc: 'Votre nouveau plat est prêt.'
    };
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const editDish = async (dish) => {
  try {
    const {data} = await axios.put(apiUrl + 'dishes/' + dish._id, dish, config);

    if (!data.success) return data?.error;

    return {
      success: true,
      title: dish.name,
      desc: 'Votre plat a été modifié avec succès.'
    }
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const deleteDish = async (dish) => {
  try {
    const {data} = await axios.delete(apiUrl + 'dishes/' + dish._id, config);

    if (!data.success) return data?.error;

    return {
      success: true,
      title: dish.name,
      desc: 'Votre plat a été supprimé avec succès.'
    }
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};