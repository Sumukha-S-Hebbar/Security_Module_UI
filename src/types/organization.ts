export type Organization = {
  id: number;
  name: string;
  code: string;
  role: string;
  type: string;
  logo: string | null;
  member: {
    id: number;
    employee_id: string;
    designation: string;
  };
};
