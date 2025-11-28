import axios from 'axios';
const API = axios.create({ baseURL: 'https://api.membershipauto.example.com' });
export async function login(email: string, password: string) {
  const resp = await API.post('/auth/login', { email, password });
  return resp.data;
}
