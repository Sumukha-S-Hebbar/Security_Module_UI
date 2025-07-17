export type Organization = {
  id: string;
  name: string;
  role: 'MNO' | 'TOWERCO';
  email: string;
  phone: string;
  registered_address_line1: string;
  registered_address_line2?: string;
  registered_address_line3?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  commercial_tax_id: string;
  commercial_tax_id_proof: string; // URL to document
  operating_license_number: string;
  operating_license_document: string; // URL to document
  logo: string; // URL to image
};
