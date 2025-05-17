import { Preferences } from '@capacitor/preferences';
import axios from 'axios';
import { Capacitor } from '@capacitor/core';


// Backend URL
const API_URL =
  Capacitor.getPlatform() === 'web'
    ? 'http://localhost:3000/api/auth'
    : 'http://10.0.2.2:3000/api/auth'; 

// Interface User
interface User {
  fullName: string;
  email: string;
  password: string;
}

// Interface Login
interface LoginData {
  email: string;
  password: string;
}

// Save token in Preferences
const saveToken = async (token: string) => {
  try {
    await Preferences.set({
      key: 'userToken',
      value: token, // Save token under the key 'userToken'
    });
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Register Patient
export const registerPatient = async (user: User) => {
  try {
    const response = await axios.post(`${API_URL}/register/patient`, user);
    const { token } = response.data; // Assuming token is returned after registration
    await saveToken(token); // Save token after successful registration
    return response.data; // user + token
  } catch (error) {
    console.error('Error registering patient:', error);
    throw error;
  }
};

// Register Doctor
export const registerDoctor = async (user: User) => {
  try {
const response = await axios.post(`${API_URL}/register/doctor`, {
  fullname: user.fullName,
  email: user.email,
  password: user.password
});

    const { token } = response.data; // Assuming token is returned after registration
    await saveToken(token); // Save token after successful registration
    return response.data; // user + token
  } catch (error) {
    console.error('Error registering doctor:', error);
    throw error;
  }
};

// Login
export async function login(data: { email: string, password: string }) {
  try {
        const response = await axios.post(`${API_URL}/login`,data);
    const { token } = response.data; // Assuming token is returned after login
    await saveToken(token); // Save token after successful login
    console.log('Login response:', response.data); 
    return response.data; 
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Retrieve token from Preferences
export const getToken = async () => {
  try {
    const { value } = await Preferences.get({ key: 'userToken' });
    return value; // returns token or null if not found
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Remove token from Preferences (e.g., during logout)
export const removeToken = async () => {
  try {
    await Preferences.remove({ key: 'userToken' });
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export async function verifyTwoFactorCodeAPI(email: string, code: string) {
  try {

    const response = await axios.post(`${API_URL}/verify2FA`, {
      email,
      code,
    });

    const { token, user } = response.data;

    if (token && user) {
      console.log("we put it succefuly")
      await Preferences.set({
        key: 'userToken',
        value: token,
      });
      await Preferences.set({
        key: 'userName',
        value: user.fullName || '',
      });
      await Preferences.set({
        key: 'userEmail',
        value: user.email,
      });
    }

    return true; // Return success status
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return false; // Return failure status
  }
}

export async function generateTwoFactorCodeAPI(email: string) {
  const response = await axios.post(`${API_URL}/resend-2fa`, {
    email
  });
  return response.data;
}
