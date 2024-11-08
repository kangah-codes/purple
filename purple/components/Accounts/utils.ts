import { Transaction } from '../Transactions/schema';

export {};

export function createTransactionChartData(
    transactions: Transaction[],
): { date: string; value: number }[] {
    if (transactions.length === 0) {
        return [];
    }

    // Get the oldest and newest dates
    const minDate = new Date(Math.min(...transactions.map((t) => new Date(t.CreatedAt).getTime())));
    const maxDate = new Date(Math.max(...transactions.map((t) => new Date(t.CreatedAt).getTime())));

    // Create an array of all dates between the min and max date
    const allDates: string[] = [];
    let currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
        allDates.push(currentDate.toLocaleDateString());
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate the transaction data
    const data = allDates.reduce<{ [key: string]: number }>((acc, date) => {
        const transaction = transactions.find(
            (t) => new Date(t.CreatedAt).toLocaleDateString() === date,
        );
        acc[date] = transaction ? transaction.amount : 0;
        return acc;
    }, {});

    // Convert the data object to an array of { date, value } objects
    return Object.keys(data).map((date) => ({ date, value: data[date] }));
}
