import { Text, View } from "@/components/Shared/styled";
import AccountCard from "./AccountCard";
import { dummyAccountData } from "../constants";

export default function AccountsAccordion() {
	return (
		<View className="flex flex-col space-y-5">
			{dummyAccountData.map((account, index) => (
				<View>
					<AccountCard {...account} />
				</View>
			))}
		</View>
	);
}
