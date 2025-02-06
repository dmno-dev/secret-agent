export interface Project {
  id: string;
  privyServerWalletId: string;
  name: string;
  ownedByUserId: string;
  createdAt: string;
  balance?: string;
}
