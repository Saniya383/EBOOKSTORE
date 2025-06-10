import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, IndianRupeeIcon, CreditCard, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { usePaymentAnalyticsStore } from "../stores/usePaymentAnalyticsStore";

const AnalyticsTab = () => {
	// Get payment analytics from store
	const { 
		paymentStats, 
		paymentMethods, 
		dailyPayments, 
		initializeWithSampleData 
	} = usePaymentAnalyticsStore();
	
	const [analyticsData, setAnalyticsData] = useState({
		users: 0,
		products: 0,
		totalSales: 0,
		totalRevenue: 0
	});
	const [isLoading, setIsLoading] = useState(true);
	const [dailySalesData, setDailySalesData] = useState([]);
	const [paymentGatewayLoading, setPaymentGatewayLoading] = useState(false);

	useEffect(() => {
		// Initialize payment analytics with sample data if empty
		initializeWithSampleData();
		
		const fetchAnalyticsData = async () => {
			try {
				// Try to fetch real data for users, products, sales, revenue
				const response = await axios.get("/analytics");
				setAnalyticsData({
					users: response.data.analyticsData.users,
					products: response.data.analyticsData.products,
					totalSales: response.data.analyticsData.totalSales,
					totalRevenue: response.data.analyticsData.totalRevenue
				});
				setDailySalesData(response.data.dailySalesData);
			} catch (error) {
				console.error("Error fetching analytics data:", error);
				
				// Provide demo data if API fails
				setAnalyticsData({
					users: 42,
					products: 156,
					totalSales: 87,
					totalRevenue: 12450
				});
				
				// Generate sample sales data for the last 7 days
				const sampleData = [];
				for (let i = 6; i >= 0; i--) {
					const date = new Date();
					date.setDate(date.getDate() - i);
					const dateStr = date.toISOString().split('T')[0];
					sampleData.push({
						name: dateStr,
						sales: Math.floor(Math.random() * 10) + 5,
						revenue: Math.floor(Math.random() * 2000) + 1000
					});
				}
				setDailySalesData(sampleData);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAnalyticsData();
	}, [initializeWithSampleData]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	// Prepare payment gateway chart data
	const paymentChartData = [
		{ name: 'Successful', value: paymentStats.successfulPayments || 0 },
		{ name: 'Failed', value: paymentStats.failedPayments || 0 }
	];
	
	const COLORS = ['#10B981', '#EF4444'];

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
			<h2 className="text-2xl font-bold text-white mb-4">Payment Gateway Analytics</h2>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				
				<AnalyticsCard
					title='Total Users'
					value={analyticsData.users.toLocaleString()}
					icon={Users}
					color='from-emerald-500 to-teal-700'
				/>
				<AnalyticsCard
					title='Total Products'
					value={analyticsData.products.toLocaleString()}
					icon={Package}
					color='from-emerald-500 to-green-700'
				/>
				<AnalyticsCard
					title='Total Sales'
					value={analyticsData.totalSales.toLocaleString()}
					icon={ShoppingCart}
					color='from-emerald-500 to-cyan-700'
				/>
				<AnalyticsCard
					title='Total Revenue'
					value={`₹ ${analyticsData.totalRevenue.toLocaleString()}`}
					icon={IndianRupeeIcon}
					color='from-emerald-500 to-lime-700'
				/>
			</div>
			
			{/* Payment Gateway Analytics Section */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<AnalyticsCard
					title='Total Payments Processed'
					value={(paymentStats.totalProcessed || 0).toLocaleString()}
					icon={CreditCard}
					color='from-purple-500 to-indigo-700'
				/>
				<AnalyticsCard
					title='Successful Payments'
					value={(paymentStats.successfulPayments || 0).toLocaleString()}
					icon={CheckCircle}
					color='from-green-500 to-emerald-700'
				/>
				<AnalyticsCard
					title='Failed Payments'
					value={(paymentStats.failedPayments || 0).toLocaleString()}
					icon={XCircle}
					color='from-red-500 to-rose-700'
				/>
				<AnalyticsCard
					title='Success Rate'
					value={`${paymentStats.successRate || 0}%`}
					icon={BarChart3}
					color='from-blue-500 to-cyan-700'
				/>
			</div>
			
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
				{/* Sales and Revenue Chart */}
				<motion.div
					className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.25 }}
				>
					<h3 className="text-xl font-semibold text-white mb-4">Sales & Revenue</h3>
					<ResponsiveContainer width='100%' height={300}>
						<LineChart data={dailySalesData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='name' stroke='#D1D5DB' />
							<YAxis yAxisId='left' stroke='#D1D5DB' />
							<YAxis yAxisId='right' orientation='right' stroke='#D1D5DB' />
							<Tooltip />
							<Legend />
							<Line
								yAxisId='left'
								type='monotone'
								dataKey='sales'
								stroke='#10B981'
								activeDot={{ r: 8 }}
								name='Sales'
							/>
							<Line
								yAxisId='right'
								type='monotone'
								dataKey='revenue'
								stroke='#3B82F6'
								activeDot={{ r: 8 }}
								name='Revenue'
							/>
						</LineChart>
					</ResponsiveContainer>
				</motion.div>
				
				{/* Payment Gateway Chart */}
				
				<motion.div
					className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.35 }}
				>
					<h3 className="text-xl font-semibold text-white mb-4">Payment Success Rate</h3>
					<ResponsiveContainer width='100%' height={300}>
						<PieChart>
							<Pie
								data={paymentChartData}
								cx="50%"
								cy="50%"
								labelLine={false}
								outerRadius={100}
								fill="#8884d8"
								dataKey="value"
								label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
							>
								{paymentChartData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Pie>
							<Tooltip />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</motion.div>
			</div>
			
			{/* Detailed Payment Gateway Analytics */}
			<>
				<h2 className="text-2xl font-bold text-white mb-4">Detailed Payment Gateway Analytics</h2>
				
				{/* Payment Methods Distribution */}
				<motion.div
					className='bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.45 }}
				>
					<h3 className="text-xl font-semibold text-white mb-4">Payment Methods Distribution</h3>
					<ResponsiveContainer width='100%' height={300}>
						<PieChart>
							<Pie
								data={Object.entries(paymentMethods || {}).map(([name, value]) => ({ 
									name: name.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
									value 
								}))}
								cx="50%"
								cy="50%"
								labelLine={true}
								outerRadius={100}
								fill="#8884d8"
								dataKey="value"
								label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
							>
								{Object.keys(paymentMethods || {}).map((_, index) => (
									<Cell key={`cell-${index}`} fill={`hsl(${index * 45 + 120}, 70%, 50%)`} />
								))}
							</Pie>
							<Tooltip />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</motion.div>
				
				{/* Daily Payment Trends */}
				<motion.div
					className='bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.55 }}
				>
					<h3 className="text-xl font-semibold text-white mb-4">Daily Payment Trends</h3>
					<ResponsiveContainer width='100%' height={300}>
						<LineChart data={dailyPayments || []}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='date' stroke='#D1D5DB' />
							<YAxis stroke='#D1D5DB' />
							<Tooltip />
							<Legend />
							<Line
								type='monotone'
								dataKey='successful'
								stroke='#10B981'
								activeDot={{ r: 8 }}
								name='Successful Payments'
							/>
							<Line
								type='monotone'
								dataKey='failed'
								stroke='#EF4444'
								activeDot={{ r: 8 }}
								name='Failed Payments'
							/>
							<Line
								type='monotone'
								dataKey='total'
								stroke='#3B82F6'
								activeDot={{ r: 8 }}
								name='Total Payments'
							/>
						</LineChart>
					</ResponsiveContainer>
				</motion.div>
				
				{/* Payment Gateway Tips */}
				<motion.div
					className='bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.65 }}
				>
					<h3 className="text-xl font-semibold text-white mb-4">Payment Gateway Insights</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-gray-700/50 p-4 rounded-lg">
							<h4 className="text-emerald-400 font-medium mb-2">Most Popular Payment Method</h4>
							<p className="text-gray-300">
								{Object.entries(paymentMethods || {}).sort((a, b) => b[1] - a[1])[0]?.[0]
									.replace('_', ' ')
									.split(' ')
									.map(word => word.charAt(0).toUpperCase() + word.slice(1))
									.join(' ') || 'Credit Card'}
							</p>
						</div>
						<div className="bg-gray-700/50 p-4 rounded-lg">
							<h4 className="text-emerald-400 font-medium mb-2">Best Performing Day</h4>
							<p className="text-gray-300">
								{dailyPayments?.sort((a, b) => b.successful - a.successful)[0]?.date || 'N/A'}
							</p>
						</div>
						<div className="bg-gray-700/50 p-4 rounded-lg">
							<h4 className="text-emerald-400 font-medium mb-2">Payment Success Tips</h4>
							<p className="text-gray-300">
								Ensure your payment form validates card details before submission to reduce failed payments.
							</p>
						</div>
						<div className="bg-gray-700/50 p-4 rounded-lg">
							<h4 className="text-emerald-400 font-medium mb-2">Recommendation</h4>
							<p className="text-gray-300">
								{paymentStats.successRate < 90 
									? 'Consider adding more payment options to improve conversion rate.' 
									: 'Your payment gateway is performing well!'}
							</p>
						</div>
					</div>
				</motion.div>
			</>
		</div>
	);
};
export default AnalyticsTab;

function AnalyticsCard({ title, value, icon: Icon, color }) {
  return (
    <motion.div
      className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex justify-between items-center'>
        <div className='z-10'>
          <p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
          <h3 className='text-white text-3xl font-bold'>{value}</h3>
        </div>
      </div>
      <div className='absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30' />
      <div className='absolute -bottom-4 -right-4 text-emerald-800 opacity-50'>
        <Icon className='h-32 w-32' />
      </div>
    </motion.div>
  );
}