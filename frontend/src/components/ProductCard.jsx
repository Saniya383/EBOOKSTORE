import toast from "react-hot-toast";
import { ShoppingCart, Image as ImageIcon } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const ProductCard = ({ product }) => {
	console.log("product",product.image)
	const { user } = useUserStore();
	const { addToCart } = useCartStore();
	const handleAddToCart = () => {
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		} else {
			// add to cart
			addToCart(product);
		}
	};

	// Check if image is valid
	const hasValidImage = product.image && typeof product.image === 'string' && product.image.startsWith('http');

	return (
		<div className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg'>
			<div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>

				{hasValidImage ? (
					<img 
						className=' object-contain w-full' 
						src={product.image} 
					
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gray-700">
						<ImageIcon size={48} className="text-gray-500" />
						<p className="text-gray-500 ml-2">No image available</p>
					</div>
				)}
			</div>

			<div className='mt-4 px-5 pb-5'>
				<h5 className='text-xl font-semibold tracking-tight text-white'>{product.name}</h5>
				{/* <img 
						src={product.image} 
					/> */}
				<div className='mt-2 mb-5 flex items-center justify-between'>
					<p>
						<span className='text-3xl font-bold text-emerald-400'>₹ {product.price}</span>
					</p>
				</div>
				<button
					className='flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
					onClick={handleAddToCart}
				>
					<ShoppingCart size={22} className='mr-2' />
					Add to cart
				</button>
			</div>
		</div>
	);
};
export default ProductCard;
