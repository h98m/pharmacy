export interface Role {
  name: string;
  description: string;
  editable: boolean;
  userCount: number;
  permissions: string[];
  defaultPermissions: string[];
  isModified: boolean;
}