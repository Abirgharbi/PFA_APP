import axios from "axios";
import { Capacitor } from '@capacitor/core';

import { API_URL } from '@/config'; // adjust the path if needed

interface SendInvitationParams {
  patientemail: string;
  token?: string;
}

export const sendInvitationByEmail = async ({
  patientemail,token
}: SendInvitationParams): Promise<void> => {
    if (!token) {
        throw new Error("No authentication token found");
    }
    const url = Capacitor.getPlatform() === 'web'
      ? `${window.location.origin}/addingpatient/`
      : `myapp://addingpatient/`;
  await axios.post(
    `${API_URL}/doctors/addingpatient`,
    { patientemail, url },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
