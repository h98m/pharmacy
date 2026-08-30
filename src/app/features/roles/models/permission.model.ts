export interface Permission {
  key: string;
  group: string;
  description: string;
}

export interface PermissionCatalogue {
  permissions: Permission[];
  groups: string[];
}