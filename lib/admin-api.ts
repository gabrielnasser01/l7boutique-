import { supabase } from './supabase';

function getAdminId(): string {
  if (typeof window === 'undefined') throw new Error('Not in browser');
  const stored = localStorage.getItem('l7_admin');
  if (!stored) throw new Error('Not authenticated');
  const parsed = JSON.parse(stored);
  if (!parsed?.id) throw new Error('Not authenticated');
  return parsed.id;
}

export const adminApi = {
  async writeProduct(data: Record<string, unknown>, productId?: string | null) {
    const { data: result, error } = await supabase.rpc('admin_products_write', {
      p_admin_id: getAdminId(),
      p_operation: productId ? 'update' : 'insert',
      p_product_id: productId || null,
      p_data: data,
    });
    if (error) throw error;
    return result;
  },

  async deleteProduct(productId: string) {
    const { error } = await supabase.rpc('admin_products_write', {
      p_admin_id: getAdminId(),
      p_operation: 'delete',
      p_product_id: productId,
      p_data: {},
    });
    if (error) throw error;
  },

  async updateCategory(categoryId: string, data: Record<string, unknown>) {
    const { data: result, error } = await supabase.rpc('admin_categories_update', {
      p_admin_id: getAdminId(),
      p_category_id: categoryId,
      p_data: data,
    });
    if (error) throw error;
    return result;
  },

  async writeBrand(data: Record<string, unknown>, brandId?: string | null) {
    const { data: result, error } = await supabase.rpc('admin_brands_write', {
      p_admin_id: getAdminId(),
      p_operation: brandId ? 'update' : 'create',
      p_brand_id: brandId || null,
      p_data: data,
    });
    if (error) throw error;
    return result;
  },

  async deleteBrand(brandId: string) {
    const { error } = await supabase.rpc('admin_brands_write', {
      p_admin_id: getAdminId(),
      p_operation: 'delete',
      p_brand_id: brandId,
      p_data: {},
    });
    if (error) throw error;
  },

  async writeCategory(data: Record<string, unknown>, categoryId?: string | null) {
    const { data: result, error } = await supabase.rpc('admin_categories_write', {
      p_admin_id: getAdminId(),
      p_operation: categoryId ? 'update' : 'create',
      p_category_id: categoryId || null,
      p_data: data,
    });
    if (error) throw error;
    return result;
  },

  async deleteCategory(categoryId: string) {
    const { error } = await supabase.rpc('admin_categories_write', {
      p_admin_id: getAdminId(),
      p_operation: 'delete',
      p_category_id: categoryId,
      p_data: {},
    });
    if (error) throw error;
  },

  async writeCollection(data: Record<string, unknown>, collectionId?: string | null) {
    const { data: result, error } = await supabase.rpc('admin_collections_write', {
      p_admin_id: getAdminId(),
      p_operation: collectionId ? 'update' : 'create',
      p_collection_id: collectionId || null,
      p_data: data,
    });
    if (error) throw error;
    return result;
  },

  async deleteCollection(collectionId: string) {
    const { error } = await supabase.rpc('admin_collections_write', {
      p_admin_id: getAdminId(),
      p_operation: 'delete',
      p_collection_id: collectionId,
      p_data: {},
    });
    if (error) throw error;
  },

  async writeSiteImage(data: Record<string, unknown>, imageId?: string | null) {
    const { data: result, error } = await supabase.rpc('admin_site_images_write', {
      p_admin_id: getAdminId(),
      p_operation: imageId ? 'update' : 'insert',
      p_image_id: imageId || null,
      p_data: data,
    });
    if (error) throw error;
    return result;
  },

  async deleteSiteImage(imageId: string) {
    const { error } = await supabase.rpc('admin_site_images_write', {
      p_admin_id: getAdminId(),
      p_operation: 'delete',
      p_image_id: imageId,
      p_data: {},
    });
    if (error) throw error;
  },

  async updateOrder(orderId: string, data: Record<string, unknown>) {
    const { data: result, error } = await supabase.rpc('admin_orders_update', {
      p_admin_id: getAdminId(),
      p_order_id: orderId,
      p_data: data,
    });
    if (error) throw error;
    return result;
  },

  async readCustomers() {
    const { data, error } = await supabase.rpc('admin_read_customers', { p_admin_id: getAdminId() });
    if (error) throw error;
    return data || [];
  },

  async readOrders() {
    const { data, error } = await supabase.rpc('admin_read_orders_full', { p_admin_id: getAdminId() });
    if (error) throw error;
    return data || [];
  },

  async readOrderDetail(orderId: string) {
    const { data, error } = await supabase.rpc('admin_read_order_detail', {
      p_admin_id: getAdminId(),
      p_order_id: orderId,
    });
    if (error) throw error;
    return data;
  },

  async readOrderStats() {
    const { data, error } = await supabase.rpc('admin_read_order_stats', { p_admin_id: getAdminId() });
    if (error) throw error;
    return data || [];
  },

  async readAllOrderItems() {
    const { data, error } = await supabase.rpc('admin_read_all_order_items', { p_admin_id: getAdminId() });
    if (error) throw error;
    return data || [];
  },
};
