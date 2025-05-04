import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL
const API_URL = 'http://localhost:3000/api/auth'; // replace with your backend IP if testing on a mobile device

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

// Save token in AsyncStorage
const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('userToken', token); // Save token under the key 'userToken'
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
    const response = await axios.post(`${API_URL}/register/doctor`, user);
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
    console.log('Login data:', data); // Log the login data
    const response = await axios.post(`${API_URL}/login`, data);
    console.log('Login response:', response.data); // Log the response data
    const { token } = response.data; // Assuming token is returned after login
    await saveToken(token); // Save token after successful login
    console.log('Login response:', response.data); 
    return response.data; 
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Retrieve token from AsyncStorage
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token; // returns token or null if not found
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Remove token from AsyncStorage (e.g., during logout)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};
export async function verifyTwoFactorCodeAPI(email: string, code: string) {
  const response = await axios.post(`${API_URL}/verify2FA`, {
    email,
    code
  });
  return response.data;
}

export async function generateTwoFactorCodeAPI(email: string) {
  const response = await axios.post(`${API_URL}/resend-2fa`, {
    email
  });
  return response.data;
}
