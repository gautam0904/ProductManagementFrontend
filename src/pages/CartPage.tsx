import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  CircularProgress, 
  Container, 
  Divider, 
  Typography,
  Paper,
  Card,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  DeleteOutline as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  RemoveShoppingCart as ClearCartIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

interface CartItem {
  product: string | Product;
  qty: number;
  unitPrice: number;
  discount: number;
  finalPrice: number;
  breakdown: string[];
  paidQty: number;
  name?: string;
  image?: string;
}

interface CartData {
  items: CartItem[];
  totals: {
    subtotal: number;
    discount: number;
    payable: number;
  };
  discountApplied: boolean;
}

const CartPage = () => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/cart/test-user-123');
      const result = await response.json();
      
      if (result.data) {
        setCart(result.data);
      } else {
        throw new Error('No cart data received');
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateCartItem = async (productId: string, quantity: number) => {
    if (!cart) return;
    
    try {
      setUpdating(prev => ({ ...prev, [productId]: true }));
      
      const response = await fetch(`http://localhost:4000/api/v1/cart/test-user-123/items/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity })
      });
      
      if (!response.ok) throw new Error('Failed to update cart');
      
      await fetchCart();
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!cart) return;
    
    try {
      setUpdating(prev => ({ ...prev, [productId]: true }));
      
      const response = await fetch(`http://localhost:4000/api/v1/cart/test-user-123/items/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove item');
      
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearCart = async () => {
    if (!cart) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:4000/api/v1/cart/test-user-123/clear`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to clear cart');
      
      setCart(null);
      setClearDialogOpen(false);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    updateCartItem(item.product as string, newQty);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!cart?.items?.length) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
        <Typography color="text.secondary" paragraph>
          Looks like you haven't added anything to your cart yet.
        </Typography>
        <Box display="flex" gap={2} justifyContent="center">
          <Button 
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            size="large"
          >
            Go Back
          </Button>
          <Button 
            component={Link} 
            to="/products" 
            variant="contained" 
            color="primary"
            size="large"
            startIcon={<ShoppingCartIcon />}
          >
            Browse Products
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Clear Cart</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove all items from your cart?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={clearCart} 
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={<ClearCartIcon />}
          >
            {loading ? 'Clearing...' : 'Clear Cart'}
          </Button>
        </DialogActions>
      </Dialog>
      <Box 
        display="grid"
        gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }}
        gap={3}
      >
        <Box>
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => navigate(-1)} color="inherit">
                  <BackIcon />
                </IconButton>
                <Typography variant="h5" component="h1" fontWeight={600}>
                  Shopping Cart ({cart.items.reduce((sum, item) => sum + item.qty, 0)} items)
                </Typography>
              </Box>
              <Tooltip title="Clear Cart">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ClearCartIcon />}
                  onClick={() => setClearDialogOpen(true)}
                  size="small"
                >
                  Clear All
                </Button>
              </Tooltip>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {cart.items.map((item, index) => (
              <Box key={index} mb={3}>
                <Card sx={{ p: 2 }}>
                  <Box display="flex" gap={3} width="100%">
                    <Box 
                      component="img"
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name || 'Product'}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {item.name || `Product ${item.product}`}
                          </Typography>
                          <Typography color="primary" fontWeight={600} mb={1}>
                            ₹{item.unitPrice} each
                          </Typography>
                        </Box>
                        <IconButton 
                          onClick={() => removeFromCart(item.product as string)}
                          disabled={updating[item.product as string]}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item, item.qty - 1)}
                          disabled={item.qty <= 1 || updating[item.product as string]}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        
                        <TextField
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          size="small"
                          sx={{ width: 60 }}
                          disabled={updating[item.product as string]}
                        />
                        
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item, item.qty + 1)}
                          disabled={updating[item.product as string]}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {item.discount > 0 && (
                        <Box mb={2}>
                          <Typography variant="body2" color="success.main" fontWeight={600}>
                            Discount Applied: ₹{item.discount}
                          </Typography>
                          {item.breakdown.map((breakdown, idx) => (
                            <Chip 
                              key={idx}
                              label={breakdown} 
                              color="success" 
                              size="small" 
                              sx={{ mr: 1, mt: 1 }}
                            />
                          ))}
                        </Box>
                      )}
                      
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        Final Price: ₹{item.finalPrice}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You pay for: {item.paidQty} items
                      </Typography>
                    </Box>
                  </Box>
                </Card>
                <Divider sx={{ mt: 3 }} />
              </Box>
            ))}
          </Paper>
        </Box>

        <Box>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>₹{cart.totals.subtotal}</Typography>
              </Box>
              {cart.totals.discount > 0 && (
                <Box display="flex" justifyContent="space-between" mb={1} color="success.main">
                  <Typography>Discounts</Typography>
                  <Typography>-₹{cart.totals.discount}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>Total</Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  ₹{cart.totals.payable}
                </Typography>
              </Box>
              
              {cart.discountApplied && (
                <Box p={2} bgcolor="success.light" borderRadius={1} mb={2}>
                  <Typography variant="body2" color="success.dark" fontWeight={600}>
                    🎉 You saved ₹{cart.totals.discount} with our discounts!
                  </Typography>
                </Box>
              )}
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Button 
                fullWidth 
                variant="contained" 
                color="primary" 
                size="large"
                component={Link}
                to="/checkout"
                disabled={!cart?.items?.length}
              >
                Proceed to Checkout (₹{cart?.totals?.payable || 0})
              </Button>
              
              <Button 
                component={Link}
                to="/products"
                startIcon={<BackIcon />}
                fullWidth
                sx={{ mt: 1 }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;