// src/services/employeeService.js
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function getEmployees(params = {}) {
  const response = await axios.get(`${API_BASE_URL}/employees`, {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...(params.role ? { role: params.role } : {}),
      ...(params.lang ? { lang: params.lang } : {}),
    },
    ...(params.signal ? { signal: params.signal } : {}),
  });

  const resData = response.data;
  if (Array.isArray(resData)) {
    return { items: resData, meta: { total: resData.length } };
  }
  if (Array.isArray(resData?.data)) {
    return { items: resData.data, meta: { total: resData.data.length } };
  }
  if (resData?.data?.items) {
    return resData.data;
  }
  return response.data?.data || { items: [], meta: {} };
}

export async function getChefs(params = {}) {
  return getEmployees({ ...params, role: 'chef' });
}
