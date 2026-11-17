import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Lấy danh sách các món ăn từ API
 * @param {Object} params - { categoryId, page, pageSize, lang, signal }
 * @returns {Promise<{ items: Array, meta: Object }>}
 */
export async function getMenuItems(params = {}) {
  const response = await axios.get(`${API_BASE_URL}/menu-items`, {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 100,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.lang ? { lang: params.lang } : {}),
    },
    ...(params.signal ? { signal: params.signal } : {}),
  });

  // Hỗ trợ linh hoạt các định dạng dữ liệu trả về từ backend
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

/**
 * Lấy danh sách các danh mục món ăn
 * @param {Object} options - { lang }
 * @returns {Promise<Array>}
 */
export async function getMenuCategories({ lang } = {}) {
  const response = await axios.get(`${API_BASE_URL}/menu-categories`, {
    params: { ...(lang ? { lang } : {}) },
  });
  return response.data?.data || [];
}
