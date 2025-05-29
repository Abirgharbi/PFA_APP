import { Preferences } from '@capacitor/preferences';
import axios from 'axios';
import { API_URL } from '@/config'; // adjust the path if needed
import { User, LoginData } from '../models/authModel'; // ✅ Import here


// Save token in Preferences
const saveToken = async (token: string) => {
  try {
    await Preferences.set({
      key: 'userToken',
      value: token,
    });
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Register Patient
export const registerPatient = async (user: User) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/patient`, user);
    const { token } = response.data;
    await saveToken(token);
    return response.data;
  } catch (error) {
    console.error('Error registering patient:', error);
    throw error;
  }
};

// Register Doctor
export const registerDoctor = async (user: User) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/doctor`, {
      fullName: user.fullName,
      email: user.email,
      password: user.password,
    });

    const { token } = response.data;
    await saveToken(token);
    return response.data;
  } catch (error) {
    console.error('Error registering doctor:', error);
    throw error;
  }
};

// Login
export async function login(data: LoginData) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    const { token } = response.data;
    await saveToken(token);
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}

// Retrieve token
export const getToken = async () => {
  try {
    const { value } = await Preferences.get({ key: 'userToken' });
    return value;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Remove token
export const removeToken = async () => {
  try {
    await Preferences.remove({ key: 'userToken' });
  } catch (error) {
    console.error('Error removing token:', error);
  }
}

// Verify 2FA
export async function verifyTwoFactorCodeAPI(email: string, code: string) {
  try {
    const response = await axios.post(`${API_URL}/auth/verify2FA`, { email, code });

    const { token, user, role } = response.data;

    if (token && user) {
      
      await Preferences.set({ key: 'userToken', value: token });
      await Preferences.set({ key: 'userName', value: user.fullName || '' });
      await Preferences.set({ key: 'userId', value: user._id });
      await Preferences.set({ key: 'userEmail', value: user.email });
      await Preferences.set({ key: 'userRole', value: role });
    }

    return true;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return false;
  }
}

// Generate 2FA code
export async function generateTwoFactorCodeAPI(email: string) {
  const response = await axios.post(`${API_URL}/auth/resend-2fa`, { email });
  return response.data;
}
