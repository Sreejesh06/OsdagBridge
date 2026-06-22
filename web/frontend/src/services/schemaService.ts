import { API } from '../store/bridgeStore';

let schemaCache: Record<string, any> | null = null;

export const fetchAllSchemas = async (): Promise<Record<string, any>> => {
  if (schemaCache) {
    return schemaCache;
  }
  try {
    const response = await fetch(`${API}/schemas`);
    if (!response.ok) {
      throw new Error(`Failed to fetch schemas: ${response.statusText}`);
    }
    const data = await response.json();
    schemaCache = data;
    return data;
  } catch (error) {
    console.error('Error fetching schemas:', error);
    throw error;
  }
};

export const getSchema = async (schemaName: string): Promise<any | null> => {
  const schemas = await fetchAllSchemas();
  return schemas[schemaName] || null;
};
