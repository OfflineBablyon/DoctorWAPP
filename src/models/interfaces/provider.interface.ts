export interface SearchParams {
  query?: string;
  state?: string;
  specialty?: string;
  page?: number;
  limit?: number;
  minServiceCount?: number;
  maxServiceCount?: number;
  minPaymentAmount?: number;
  maxPaymentAmount?: number;
  hcpcsCode?: string;
  serviceYear?: number;
  has_medicare?: boolean;
  provider_type?: string;
}

export interface Address {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string | null;
}

export interface Taxonomy {
  code: string | null;
  description: string | null;
  isPrimary: boolean | null;
  license: string | null;
}

export interface MedicareService {
  code: string | null;
  description: string | null;
  serviceCount: number;
  beneficiaryCount: number;
  submittedCharge: number;
  allowedAmount: number;
  paymentAmount: number;
  year: number | null;
  placeOfService: string | null;
}

export interface MedicareSummary {
  totalServices: number;
  totalBeneficiaries: number;
  totalPayments: number;
  totalSubmitted: number;
  totalAllowed: number;
}

export interface Medicare {
  summary: MedicareSummary;
  services: MedicareService[];
}

// Full provider with all details (used for provider details endpoint)
export interface Provider {
  npi: string;
  provider_name: string;
  first_name: string | null;
  last_name: string | null;
  organization_name: string | null;
  provider_type: string | null;
  address: Address;
  phone: string | null;
  email: string | null;
  direct_address: string | null;
  fhir_endpoint: string | null;
  enumeration_date: string | null;
  last_updated: string | null;
  status: string | null;
  taxonomies: Taxonomy[];
  medicare: Medicare;
}

// Simplified provider for search results
export interface ProviderSearchResult {
  npi: string;
  provider_name: string;
  first_name: string | null;
  last_name: string | null;
  organization_name: string | null;
  provider_type: string | null;
  address: Address;
  phone: string | null;
  status: string | null;
}

export interface SearchResponse {
  providers: ProviderSearchResult[];
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
  provider_id: number;
  taxonomy_code: string;
  taxonomy_desc: string | null;
  primary_taxonomy: boolean;
  license: string | null;
  created_at: Date;
  updated_at: Date;
  taxonomy_reference?: TaxonomyReference;
}

export interface TaxonomyReference {
  taxonomy_code: string;
  taxonomy_desc: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProviderMedicare {
  id: number;
  provider_id: number;
  medicare_service_id: number;
  created_at: Date;
  updated_at: Date;
  medicare_service?: MedicareService;
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