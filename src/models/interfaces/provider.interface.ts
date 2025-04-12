export interface SearchParams {
  query?: string;
  state?: string;
  specialty?: string;
  page?: number;
  limit?: number;
}

export interface Provider {
  id: string;
  provider_name: string;
  first_name: string;
  last_name: string;
  organization_name: string;
  state: string;
  specialty: string;
  created_at: Date;
  updated_at: Date;
}

export interface SearchResponse {
  providers: Provider[];
  total: number;
  page: number;
  limit: number;
}

export interface FiltersResponse {
  states: string[];
  specialties: string[];
}

export interface ProviderTaxonomy {
  id: number;
  npi: string;
  taxonomy_code: string;
  taxonomy_desc: string | null;
  primary_taxonomy: boolean;
  license: string | null;
}

export interface TaxonomyReference {
  code: string;
  description: string;
  grouping: string;
  classification: string;
  specialization: string | null;
  definition: string | null;
}

export interface MedicareService {
  id: number;
  npi: string;
  hcpcs_code: string;
  hcpcs_description: string;
  service_count: number;
  beneficiary_count: number;
  submitted_charge: number;
  allowed_amount: number;
  payment_amount: number;
  service_year: number;
  place_of_service: string;
}

export interface ProviderSearchParams {
  name?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  taxonomy_code?: string;
  provider_type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProviderSearchResponse {
  providers: Provider[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
} 