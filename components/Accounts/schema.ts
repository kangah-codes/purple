export type IAccountCard = {
	accountName: string;
	accountTotal: number;
	subAccounts: {
		subAccountName: string;
		subAccountTotal: number;
	}[];
};
