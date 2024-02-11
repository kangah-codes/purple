import { ScrollView, View } from "@/components/styled";
import { FlatList } from "react-native";
import { expensePlans } from "../constants";
import BudgetPlanCard from "../molecules/BudgetCard";
import ExpensesCard from "../molecules/ExpensesCard";

export default function ExpensesScreen() {
	return (
		<ScrollView
			className="px-5"
			contentContainerStyle={{
				paddingBottom: 100,
				flexGrow: 1,
			}}
		>
			<ExpensesCard />

			<View className="mt-5 flex flex-col space-y-5">
				<FlatList
					showsHorizontalScrollIndicator={false}
					data={expensePlans}
					renderItem={({ item }) => <BudgetPlanCard data={item} />}
					keyExtractor={(_, index) => index.toString()}
					ItemSeparatorComponent={() => (
						<View style={{ height: 20 }} />
					)}
				/>
			</View>
		</ScrollView>
	);
}
