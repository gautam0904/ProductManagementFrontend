import { useCart } from "../hooks/useCart";
import type { CartItem } from "../types/cart";
import { formatCurrency } from "../utils/formatters";
import { Link } from "react-router-dom";
import { 
  Box, 
  Button, 
  CircularProgress, 
  Container, 
  Divider, 
  IconButton, 
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useDiscounts } from "../hooks/useDiscounts";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CartPage = () => {
  const {
    cart,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
    offerPrompt,
    clearOfferPrompt,
    acceptOffer
  } = useCart();

  // Map cart items to lightweight structure for discount service
  const cartItemsLite = (cart?.items || []).map((ci) => ({
    product: {
      id: String(ci.product.id ?? ''),
      name: ci.product.name,
      price: ci.product.price,
      // attempt to pass category id if present, normalized to string
      category: ((ci.product as any).category?._id || (ci.product as any).category || '') as string,
    },
    quantity: ci.quantity,
  }));

  const { discounts, availableDiscounts } = useDiscounts(cartItemsLite);

  const changeQty = (item: CartItem, qty: number) => {
    if (item.product.id) {
      updateQuantity(item.product.id.toString(), qty);
    }
  };

  const remove = (item: CartItem) => {
    if (item.product.id) {
      removeItem(item.product.id.toString());
    }
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" component="h1" fontWeight={600}>
                Shopping Cart
              </Typography>
              <Button 
                onClick={clearCart}
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
              >
                Clear Cart
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {cart.items.map((item) => (
              <Box key={item.product.id} mb={3}>
                <Box 
                  display="grid" 
                  gridTemplateColumns={{ xs: '1fr', md: '180px 1fr' }} 
                  gap={2}
                >
                  <Box>
                    <Box 
                      component="img"
                      src={item.product.image || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      sx={{ 
                        width: '100%', 
                        height: 'auto',
                        borderRadius: 1,
                        aspectRatio: '1/1',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Box>
                    <Box display="flex" flexDirection="column" height="100%">
                      <Box flexGrow={1}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {item.product.name}
                        </Typography>
                        <Typography color="text.secondary" paragraph>
                          {item.product.description?.substring(0, 100)}{item.product.description?.length > 100 ? '...' : ''}
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          {formatCurrency(item.product.price * item.quantity)}
                        </Typography>
                        {item.quantity > 1 && (
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(item.product.price)} each
                          </Typography>
                        )}
                      </Box>
                      {/* Optional: show available discounts badges for the item */}
                      <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                        {availableDiscounts
                          .filter((rule) => {
                            const pid = (rule as any).product?._id || (rule as any).product?.id;
                            const cid = (rule as any).category?._id || (rule as any).category?.id;
                            return pid === item.product.id || cid === (item as any).product?.category?.id || rule.type === 'FIXED_AMOUNT';
                          })
                          .slice(0, 3)
                          .map((rule) => (
                            <Box key={(rule as any)._id || rule.name} px={1} py={0.5} borderRadius={1} bgcolor="info.light" color="info.contrastText" fontSize={12}>
                              {rule.name}
                            </Box>
                          ))}
                      </Box>
                      <Box display="flex" alignItems="center" mt={2}>
                        <Box display="flex" alignItems="center" border={1} borderColor="divider" borderRadius={1}>
                          <IconButton 
                            size="small" 
                            onClick={() => changeQty(item, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography mx={2} minWidth={24} textAlign="center">
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => changeQty(item, item.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <IconButton 
                          color="error" 
                          onClick={() => remove(item)}
                          sx={{ ml: 2 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
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
                <Typography>{formatCurrency(discounts.originalTotal)}</Typography>
              </Box>
              {discounts.totalDiscount > 0 && (
                <Box display="flex" justifyContent="space-between" mb={1} color="success.main">
                  <Typography>Discounts</Typography>
                  <Typography>-{formatCurrency(discounts.totalDiscount)}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>Total</Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatCurrency(discounts.finalTotal)}
                </Typography>
              </Box>
              {discounts.appliedDiscounts?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Applied Discounts</Typography>
                  {discounts.appliedDiscounts.map((ad, idx) => (
                    <Box key={ad.ruleId || ad.name || idx} display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography color="text.secondary">{ad.name || ad.description || 'Discount'}</Typography>
                      <Typography color="success.main">- {formatCurrency(ad.amount)}</Typography>
                    </Box>
                  ))}
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
              disabled={!cart.items.length}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Box>
      </Box>

      <Dialog open={!!offerPrompt} onClose={clearOfferPrompt} maxWidth="sm" fullWidth>
        <DialogTitle>{offerPrompt?.title}</DialogTitle>
        <DialogContent>
          <Typography>{offerPrompt?.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearOfferPrompt}>No thanks</Button>
          <Button onClick={acceptOffer} variant="contained" color="primary">
            Yes, add it
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CartPage;