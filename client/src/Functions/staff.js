import axios from 'axios';

import { config } from './utils';
import { apiUrl } from '../config';


export const getStaff = async () => {
  try {
    const {data} = await axios.get(apiUrl + 'staff', config);

    if (!data.success) return data?.error;

    return data;
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const createStaff = async (staff) => {
  try {
    staff.email = staff.email.replace(' ', '');
    const {data} = await axios.post(apiUrl + 'staff', staff, config);

    if (!data.success) return data?.error;
    
    return {
      success: true,
      title: 'Création de membre',
      desc: `${staff.firstName} ${staff.lastName} a été ajouté avec succès.`
    };
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const editStaff = async (staff) => {
  try {
    staff.email = staff.email.replace(' ', '');
    const {data} = await axios.put(apiUrl + 'staff/' + staff._id, staff, config);

    if (!data.success) return data?.error;

    return {
      success: true,
      title: 'Modification de membre',
      desc: `${staff.firstName} ${staff.lastName} a été modifié avec succès.`
    };

  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const deleteStaff = async (staff) => {
  try {
    staff.email = staff.email.replace(' ', '');
    const {data} = await axios.delete(apiUrl + 'staff/' + staff._id, config);

    if (!data.success) return data?.error;

    return {
      success: true,
      title: 'Suppression de membre',
      desc: `${staff.firstName} ${staff.lastName} a été supprimé avec succès.`
    };

  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};