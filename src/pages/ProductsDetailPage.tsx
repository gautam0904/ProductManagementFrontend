import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, normalizeProduct } from "../api/productApi";
import { useCart } from "../contexts/CartContext";
import { useDiscounts } from "../hooks/useDiscounts";
import type { Product } from "../types/products";
import { 
  Box, 
  Button, 
  Card, 
  CardMedia, 
  CircularProgress, 
  Container, 
  Typography
} from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import DiscountSuggestionDialog from '../components/DiscountSuggestionDialog';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [suggestionDialog, setSuggestionDialog] = useState<{
    open: boolean;
    product: Product | null;
    suggestions: any[];
  }>({
    open: false,
    product: null,
    suggestions: []
  });

  // Use cart context and discounts hook
  const { addToCart } = useCart();
  const { checkItemDiscounts } = useDiscounts();

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        const productData = await getProductById(id);
        setProduct(normalizeProduct(productData));
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      const productId = product._id || product.id;
      if (!productId) {
        toast.error('Invalid product ID');
        return;
      }
      
      // Add to cart
      await addToCart(String(productId), 1);

      // Check for discount suggestions
      const suggestions = await checkItemDiscounts(
        String(productId),
        product.category ? String(product.category) : undefined,
        1
      );

      if (suggestions.length > 0) {
        setSuggestionDialog({
          open: true,
          product,
          suggestions
        });
      } else {
        toast.success(`${product.name} added to cart successfully!`);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCloseSuggestionDialog = () => {
    setSuggestionDialog({
      open: false,
      product: null,
      suggestions: []
    });
  };

  const handleAcceptSuggestion = async () => {
    if (suggestionDialog.product) {
      try {
        const productId = suggestionDialog.product._id || suggestionDialog.product.id;
        if (!productId) {
          toast.error('Invalid product ID');
          return;
        }
        
        // Add more quantity to trigger the discount
        await addToCart(String(productId), 1);
        toast.success('Additional item added! Discount applied!');
      } catch (error) {
        console.error('Failed to add additional item:', error);
        toast.error('Failed to add additional item');
      }
    }
    handleCloseSuggestionDialog();
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );
  
  if (!product) return (
    <Container>
      <Typography variant="h6" color="error">Product not found.</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={4}>
        <Box>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.productimage || product.image}
              alt={product.name}
              sx={{ objectFit: 'contain', p: 2 }}
            />
          </Card>
        </Box>
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              {product.name}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
              {product.description}
            </Typography>
            
            <Typography variant="h4" color="primary" fontWeight={600} gutterBottom>
              ₹{product.price.toFixed(2)}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Stock: {product.stock}
            </Typography>
            
        <Button
          variant="contained"
          size="large"
          startIcon={<CartIcon />}
          onClick={handleAddToCart}
          disabled={addingToCart}
          sx={{ alignSelf: 'flex-start' }}
        >
          {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
        </Button>
          </Box>
        </Box>
      </Box>

      {/* Suggestion Dialog */}
      <DiscountSuggestionDialog
        open={suggestionDialog.open}
        onClose={handleCloseSuggestionDialog}
        onAccept={handleAcceptSuggestion}
        productName={suggestionDialog.product?.name || ''}
        suggestions={suggestionDialog.suggestions}
        loading={addingToCart}
      />
    </Container>
  );
};
export default ProductDetailPage;

