import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, normalizeProduct } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import { useDiscounts } from "../hooks/useDiscounts";
import type { Product } from "../types/products";
import { 
  Box, 
  Button, 
  Card, 
  CardMedia, 
  CircularProgress, 
  Container, 
  Grid, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { ShoppingCart as CartIcon, LocalOffer as OfferIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

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

  // Use discounts hook for suggestion functionality
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
  
  if (!product) return (
    <Container>
      <Typography variant="h6" color="error">Product not found.</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.productimage || product.image}
              alt={product.name}
              sx={{ objectFit: 'contain', p: 2 }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
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
        </Grid>
      </Grid>

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
export default ProductDetailPage;
