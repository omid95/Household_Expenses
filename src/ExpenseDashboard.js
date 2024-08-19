// src/ExpenseDashboard.js

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ExpenseDashboard = ({ userId }) => {
    const [expenses, setExpenses] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const expenseRes = await axios.get(`http://localhost:5000/api/expenses?userId=${userId}`);
                const categoryRes = await axios.get(`http://localhost:5000/api/expenses/categories?userId=${userId}`);
                const monthlyRes = await axios.get(`http://localhost:5000/api/expenses/monthly?userId=${userId}`);
    
                setExpenses(expenseRes.data);
                setCategoryData(categoryRes.data);
                setMonthlyData(monthlyRes.data);
            } catch (err) {
                console.error(err.message);
                setError('Failed to fetch expense data.');
            }
        };
    
        fetchExpenses();
    }, [userId]);
    

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Expense Dashboard</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <p className="text-3xl font-bold">${totalExpense.toFixed(2)}</p>
                <p className="text-gray-600">Total Expenses</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Expenses by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Expenses by Month</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="#0088fe" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ExpenseDashboard;
