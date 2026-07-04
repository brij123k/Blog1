import axiosInstance from "./axios";
import axios from "axios";

class ApiService {
  // ==========================
  // GET
  // ==========================

  async get(url: string, params = {}) {
    const response = await axiosInstance.get(url, {
      params,
    });

    return response.data;
  }

  async getWithoutToken(url: string, params = {}) {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      { params }
    );

    return response.data;
  }

  // ==========================
  // POST
  // ==========================

  async post(url: string, body = {}) {
    const response = await axiosInstance.post(url, body);

    return response.data;
  }

  async postWithoutToken(url: string, body = {}) {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      body
    );

    return response.data;
  }

  // ==========================
  // PUT
  // ==========================

  async put(url: string, body = {}) {
    const response = await axiosInstance.put(url, body);

    return response.data;
  }

  async putWithoutToken(url: string, body = {}) {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      body
    );

    return response.data;
  }

  // ==========================
  // PATCH
  // ==========================

  async patch(url: string, body = {}) {
    const response = await axiosInstance.patch(url, body);

    return response.data;
  }

  async patchWithoutToken(url: string, body = {}) {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      body
    );

    return response.data;
  }

  // ==========================
  // DELETE
  // ==========================

  async delete(url: string) {
    const response = await axiosInstance.delete(url);

    return response.data;
  }

  async deleteWithoutToken(url: string) {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}${url}`
    );

    return response.data;
  }
}

export default new ApiService();