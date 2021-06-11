import axios from 'axios';

import { config } from './utils';
import { apiUrl } from '../config';


export const login = async (user, remember) => {
  try {
    user.email = user.email?.replace(' ', '');
    const {data} = await axios.post(apiUrl + 'user/login', {...user, remember}, config);

    if (!data.success) return data?.error;
    
    return data;

  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const register = async (user) => {
  try {
    user.email = user.email?.replace(' ', '');
    const {data} = await axios.post(apiUrl + 'user/register', user, config);

    if (!data.success) return data?.error;

    return data;
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const getUserData = async () => {
  try {
    const {data} = await axios.get(apiUrl + 'user', config);
    
    if (!data.success) return data?.error;

    return data;
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const sendEmail = async (email) => {
  try {
    email = email?.replace(' ', '');
    const {data} = await axios.put(apiUrl + 'user/forgot', {email}, config);

    if (!data.success) return data?.error;
    
    return {
      success: true,
      title: 'Email de récupération',
      desc: 'Email envoyé à ' + email + ' avec succès.'
    };

  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const resetPassword = async (resetToken, password, passCheck) => {
  if (!resetToken) return 'Veuillez entrer le code reçu par email.';

  try {
    const {data} = await axios.put(apiUrl + 'user/reset/' + resetToken, {password, passCheck}, config);

    if (!data.success) return data?.error;
    
    return {
      success: true,
      title: 'Récupération réussie',
      desc: 'Mot de passe réinitialisé avec succès.'
    };
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const updateData = async (user) => {
  try {
    user.email = user.email?.replace(' ', '');
    const {data} = await axios.put(apiUrl + 'user/data', user, config);
    
    if (!data.success) return data?.error;

    return {
      success: true,
      title: 'Modification réussie',
      desc: 'Votre compte a bien été mis à jour.',
      user: data.user
    };
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const updatePassword = async (current, password, passCheck) => {
  try {
    const {data} = await axios.put(apiUrl + 'user/password', {current, password, passCheck}, config);
    
    if (!data.success) return data?.error;

    return {
      success: true,
      title: 'Modification réussie',
      desc: 'Votre mot de passe a bien été mis à jour.'
    };
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const deleteUser = async () => {
  try {
    const {data} = await axios.delete(apiUrl + 'user', config);
    
    if (!data.success) return data?.error;

    return data;
    
  } catch (error) { return error.response?.data.error || 'Erreur inconnue.'; }
};


export const logout = async () => {
  try {
    const {data} = await axios.get(apiUrl + 'user/logout', config);

    return data.success ? data : data?.error;

  } catch (error) { return error.response?.data.error || 'Unknown error.'; }
};