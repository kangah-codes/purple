import { IAccountCard } from "./schema";

export const dummyAccountData: IAccountCard[] = [
	{
		accountName: "💵 Cash",
		accountTotal: 1000,
		subAccounts: [
			{
				subAccountName: "Wallet",
				subAccountTotal: 500,
			},
			{
				subAccountName: "Piggy Bank",
				subAccountTotal: 500,
			},
		],
	},
	{
		accountName: "🏦 Bank Accounts",
		accountTotal: 2000,
		subAccounts: [
			{
				subAccountName: "Ecobank Account",
				subAccountTotal: 1000,
			},
			{
				subAccountName: "Fidelity Account",
				subAccountTotal: 1000,
			},
		],
	},
	{
		accountName: "📈 Investments",
		accountTotal: 3000,
		subAccounts: [
			{
				subAccountName: "Binance Account",
				subAccountTotal: 1500,
			},
			{
				subAccountName: "Crypto.com Account",
				subAccountTotal: 1500,
			},
		],
	},
];
