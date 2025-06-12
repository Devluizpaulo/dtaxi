
export interface UserPermissions {
  dashboard: boolean;
  drivers: boolean;
  fleet: boolean;
  rides: boolean;
  finance: boolean;
  reports: boolean;
  satisfaction: boolean;
  messages: boolean;
  coordination: boolean;
  driverPraise: boolean;
  settings: boolean;
  userManagement: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: UserPermissions;
}
