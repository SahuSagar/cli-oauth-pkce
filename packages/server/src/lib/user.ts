export const DEMO_USER = {
  id: 'user_1',
  email: 'sahil@demo.com',
  password: 'demo1234',
  name: 'Sahil',
};

export function validateCredentials(email: string, password: string): boolean {
  return email === DEMO_USER.email && password === DEMO_USER.password;
}
