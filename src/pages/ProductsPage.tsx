import { useEffect, useState } from "react";
import { listProducts, normalizeProduct } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import { useDiscounts } from "../hooks/useDiscounts";
import type { Product } from "../types/products";
import { Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardActions, 
  CardContent, 
  CardMedia, 
  CircularProgress, 
  Container, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { ShoppingCart as CartIcon, LocalOffer as OfferIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [suggestionDialog, setSuggestionDialog] = useState<{
    open: boolean;
    product: Product | null;
    suggestions: any[];
  }>({
    open: false,
    product: null,
    suggestions: []
  });

  // Use discounts hook for suggestion functionality
  const { checkItemDiscounts } = useDiscounts();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productList = await listProducts();
        setProducts(productList.map(normalizeProduct));
      } catch (error) {
        console.error('Failed to load products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      const productId = product._id || product.id;
      if (!productId) {
        toast.error('Invalid product ID');
        return;
      }
      
      setAddingToCart(String(productId));
      
      // Add to cart
      await addToCart({
        productId: String(productId),
        quantity: 1,
        userId: 'user-123' // You can implement proper user management later
      });

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
      setAddingToCart(null);
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
        await addToCart({
          productId: String(productId),
          quantity: 1, // Add one more
          userId: 'user-123'
        });
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Products
      </Typography>
      
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
        gap={3}
      >
        {products.map((product) => (
          <Box key={product._id || product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={product.productimage || product.image}
                alt={product.name}
                sx={{ objectFit: 'contain', p: 1 }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  ₹{product.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stock: {product.stock}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  component={Link}
                  to={`/products/${product._id || product.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  View Details
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<CartIcon />}
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCart === (product._id || product.id)}
                >
                  {addingToCart === (product._id || product.id) ? 'Adding...' : 'Add to Cart'}
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Suggestion Dialog */}
      <Dialog 
        open={suggestionDialog.open} 
        onClose={handleCloseSuggestionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfferIcon color="primary" />
          Special Offer Available!
        </DialogTitle>
        <DialogContent>
          {suggestionDialog.product && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {suggestionDialog.product.name}
              </Typography>
              <Typography variant="body1" paragraph>
                Great news! You can get additional discounts on this product.
              </Typography>
              
              {suggestionDialog.suggestions.map((suggestion, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Chip 
                      label={suggestion.type?.replace(/_/g, ' ') || 'Special Offer'} 
                      color="primary" 
                      size="small" 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {suggestion.message}
                  </Typography>
                </Box>
              ))}
              
              <Typography variant="body2" color="text.secondary">
                Would you like to add more items to unlock this discount?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuggestionDialog}>
            Maybe Later
          </Button>
          <Button 
            onClick={handleAcceptSuggestion} 
            variant="contained"
            startIcon={<CartIcon />}
          >
            Add More & Save!
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
export default ProductsPage;
