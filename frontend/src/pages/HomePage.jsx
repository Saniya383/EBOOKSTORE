import { useEffect } from "react";
import { Link } from "react-router-dom";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { BookOpen, Star, Users, Award, ArrowRight, Sparkles } from "lucide-react";

const categories = [
	{ href: "/Fiction", name: "Fiction", imageUrl: "/fiction.jpg" },
	{ href: "/Non-fiction", name: "Non-Fiction", imageUrl: "/nonfiction.jpg" },
	{ href: "/Business", name: "Business & Economics", imageUrl: "/business.jpg" },
	{ href: "/Mystery", name: "Thriller & Mystery", imageUrl: "/mystery.jpg" },
	{ href: "/Children", name: "Children", imageUrl: "/children.jpg" },
	{ href: "/Selfhelp", name: "Self-Help", imageUrl: "/selfhelp.jpg" },
];

const HomePage = () => {
	 const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	 useEffect(() => {
	 	fetchFeaturedProducts();
	 }, [fetchFeaturedProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
					{/* Hero Section */}
					<div className="relative mb-16">
						{/* Background Pattern */}
						<div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-cyan-900/20 rounded-3xl"></div>
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)] rounded-3xl"></div>
						
						{/* Main Hero Content */}
						<div className="relative bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-gray-800/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-emerald-500/20 shadow-2xl">
							{/* Floating Elements */}
							<div className="absolute top-4 right-4 opacity-20">
								<Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
							</div>
							<div className="absolute bottom-4 left-4 opacity-20">
								<BookOpen className="w-6 h-6 text-teal-400 animate-bounce" />
							</div>
							
							{/* Hero Text */}
							<div className="text-center max-w-4xl mx-auto">
								<div className="flex justify-center items-center mb-6">
									<div className="bg-emerald-500/20 p-3 rounded-full border border-emerald-400/30">
										<BookOpen className="w-8 h-8 text-emerald-400" />
									</div>
								</div>
								
								<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
									<span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
										Welcome to
									</span>
									<br />
									<span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
										Bookoria
									</span>
								</h1>
								
								<p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
									Your gateway to endless stories, knowledge, and adventures. 
									<br className="hidden md:block" />
									Discover, learn, and grow with our curated collection of books.
								</p>
								
								{/* Stats */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
									<div className="text-center">
										<div className="flex justify-center mb-2">
											<BookOpen className="w-6 h-6 text-emerald-400" />
										</div>
										<div className="text-2xl font-bold text-emerald-400">1000+</div>
										<div className="text-sm text-gray-400">Books Available</div>
									</div>
									<div className="text-center">
										<div className="flex justify-center mb-2">
											<Users className="w-6 h-6 text-teal-400" />
										</div>
										<div className="text-2xl font-bold text-teal-400">50K+</div>
										<div className="text-sm text-gray-400">Happy Readers</div>
									</div>
									<div className="text-center">
										<div className="flex justify-center mb-2">
											<Star className="w-6 h-6 text-yellow-400" />
										</div>
										<div className="text-2xl font-bold text-yellow-400">4.9</div>
										<div className="text-sm text-gray-400">Average Rating</div>
									</div>
									<div className="text-center">
										<div className="flex justify-center mb-2">
											<Award className="w-6 h-6 text-purple-400" />
										</div>
										<div className="text-2xl font-bold text-purple-400">Award</div>
										<div className="text-sm text-gray-400">Winning Store</div>
									</div>
								</div>
								
								{/* CTA Buttons */}
								<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
									<Link 
										to="/category/Fiction"
										className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 flex items-center"
									>
										Start Reading Today
										<ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
									</Link>
									<button 
										onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
										className="group border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105"
									>
										Browse Collection
									</button>
								</div>
							</div>
						</div>
					</div>
				{/* Categories Section */}
				<div id="categories-section">
					<h2 className='text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-4'>
						Explore Our Categories
					</h2>
				<p className='text-center text-xl text-gray-300 mb-12'>
        Discover a world of books for every passion and curiosity!
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>
			</div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};
export default HomePage;