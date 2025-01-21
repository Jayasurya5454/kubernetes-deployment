import Budget from '../models/budget.js';

export const fetchDashboard = async (req, res) => {
    const { user } = req.query; // Get user ID from query parameters

    try {
        // Fetch all budgets for the user
        const budgets = await Budget.find({ uid: user });

        // Calculate total budget and total spend
        let totalBudget = 0;
        let totalSpend = 0;

        budgets.forEach(budget => {
            totalBudget += budget.totalAmount; // Sum up totalAmount for total budget
            totalSpend += budget.totalAmount - budget.remaining; // Calculate spend as totalAmount - remaining
        });

        const numBudgets = budgets.length; // Count the number of budgets

        // Get the latest 2 budgets
        const latestBudgets = budgets
            .sort((a, b) => b.createdAt - a.createdAt) // Sort budgets by creation date
            .slice(0, 2) // Get the latest 2 budgets
            .map(budget => ({
                title: budget.title,
                totalAmount: budget.totalAmount, // Total amount of the budget
                remaining: budget.remaining, // Remaining amount of the budget
            }));

        // Fetch activity data (for chart)
        const activityData = await Budget.find({ uid: user })
            .sort({ date: 1 })
            .limit(10)
            .select("title totalAmount remaining");
        
        // Prepare response
        res.json({
            totalBudget,
            totalSpend,
            numBudgets,
            latestBudgets,
            activityData,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


