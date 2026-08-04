const TOKEN_KEY = "blog1_token";
const USER_KEY = "blog1_user";

export const storage = {
  getToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    if (typeof window === "undefined") return;

    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    if (typeof window === "undefined") return;

    localStorage.removeItem(TOKEN_KEY);
  },

  getUser() {
    if (typeof window === "undefined") {
      return null;
    }

    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
  },

  setUser(user: any) {
    if (typeof window === "undefined") return;

    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },


  setUserPlan(plan: any) {
    localStorage.setItem('userPlan', JSON.stringify(plan));
  },
  getUserPlan(plan: any) {
    localStorage.getItem('userPlan');
  },
  logout() {
    if (typeof window === "undefined") return;

    localStorage.clear();
  },
};