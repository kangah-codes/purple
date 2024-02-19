import { View } from "@/components/Shared/styled";
import { FlatList } from "react-native";
import { expensePlans } from "../constants";
import BudgetPlanCard from "../molecules/BudgetCard";
import ExpensesCard from "../molecules/ExpensesCard";

export default function SavingsScreen() {
	return (
		<FlatList
			contentContainerStyle={{ paddingBottom: 100 }}
			style={{ paddingHorizontal: 20 }}
			showsHorizontalScrollIndicator={false}
			data={expensePlans}
			renderItem={({ item }) => <BudgetPlanCard data={item} />}
			keyExtractor={(_, index) => index.toString()}
			ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
			ListHeaderComponent={() => (
				<View style={{ paddingHorizontal: 5 }}>
					<ExpensesCard />
					<View style={{ marginTop: 20 }} />
				</View>
			)}
		/>
	);
}
