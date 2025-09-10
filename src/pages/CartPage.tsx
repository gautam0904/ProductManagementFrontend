import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Box, 
  Button, 
  CircularProgress, 
  Container, 
  Divider, 
  Typography,
  Paper,
  Card,
  Chip
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import toast from 'react-hot-toast';

interface CartItem {
  product: string;
  qty: number;
  unitPrice: number;
  discount: number;
  finalPrice: number;
  breakdown: string[];
  paidQty: number;
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

  useEffect(() => {
    const loadCart = async () => {
      try {
        // Call the backend API directly to get the cart with discounts
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
    };
    loadCart();
  }, []);

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
        <Button 
          component={Link} 
          to="/products" 
          variant="contained" 
          color="primary"
          size="large"
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box 
        display="grid"
        gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }}
        gap={3}
      >
        <Box>
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h5" component="h1" fontWeight={600} mb={3}>
              Shopping Cart
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {cart.items.map((item, index) => (
              <Box key={index} mb={3}>
                <Card sx={{ p: 2 }}>
                  <Box display="flex" gap={2}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        Product ID: {item.product}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Quantity: {item.qty} | Unit Price: ₹{item.unitPrice}
                      </Typography>
                      
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

            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link}
              to="/checkout"
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;