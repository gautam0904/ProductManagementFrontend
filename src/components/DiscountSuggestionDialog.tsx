import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  LocalOffer as OfferIcon,
  ShoppingCart as CartIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import type { DiscountSuggestion } from '../hooks/useDiscounts';

interface DiscountSuggestionDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  productName: string;
  suggestions: DiscountSuggestion[];
  loading?: boolean;
}

const DiscountSuggestionDialog: React.FC<DiscountSuggestionDialogProps> = ({
  open,
  onClose,
  onAccept,
  productName,
  suggestions,
  loading = false
}) => {
  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'BOGO':
        return '🎁';
      case 'PERCENTAGE':
        return '📊';
      case 'FIXED_AMOUNT':
        return '💰';
      case 'CATEGORY_DISCOUNT':
        return '🏷️';
      default:
        return '🎉';
    }
  };

  const getDiscountColor = (type: string) => {
    switch (type) {
      case 'BOGO':
        return 'primary';
      case 'PERCENTAGE':
        return 'secondary';
      case 'FIXED_AMOUNT':
        return 'success';
      case 'CATEGORY_DISCOUNT':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'success.light',
        color: 'success.dark'
      }}>
        <OfferIcon />
        <Typography variant="h6" fontWeight={600}>
          Special Offers Available!
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {productName}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Great news! You can unlock amazing discounts by adding more items to your cart.
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          {suggestions.map((suggestion, index) => (
            <Card 
              key={index} 
              sx={{ 
                border: '2px solid',
                borderColor: 'success.light',
                bgcolor: 'success.light',
                '&:hover': {
                  borderColor: 'success.main',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="h4">
                    {getDiscountIcon(suggestion.type)}
                  </Typography>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip 
                        label={suggestion.type?.replace(/_/g, ' ') || 'Special Offer'} 
                        color={getDiscountColor(suggestion.type) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      {suggestion.discountAmount && (
                        <Chip 
                          label={`Save ₹${suggestion.discountAmount}`} 
                          color="success" 
                          size="small" 
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body1" fontWeight={500} mb={1}>
                      {suggestion.message}
                    </Typography>
                  </Box>
                </Box>
                
                {suggestion.requiredQuantity && suggestion.currentQuantity && (
                  <Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Progress to unlock:
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography 
                          variant="body2" 
                          color="success.main" 
                          fontWeight={600}
                        >
                          {suggestion.currentQuantity} / {suggestion.requiredQuantity}
                        </Typography>
                        <Box 
                          sx={{ 
                            width: 60, 
                            height: 8, 
                            bgcolor: 'grey.300', 
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: `${(suggestion.currentQuantity / suggestion.requiredQuantity) * 100}%`,
                              height: '100%',
                              bgcolor: 'success.main',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box mt={3} p={2} bgcolor="info.light" borderRadius={1}>
          <Typography variant="body2" color="info.dark" textAlign="center">
            💡 <strong>Pro Tip:</strong> Add the suggested quantity to unlock these amazing discounts!
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          startIcon={<CloseIcon />}
          variant="outlined"
          size="large"
        >
          Maybe Later
        </Button>
        <Button 
          onClick={onAccept} 
          variant="contained"
          color="success"
          startIcon={<CartIcon />}
          size="large"
          disabled={loading}
          sx={{ 
            fontWeight: 600,
            px: 3
          }}
        >
          {loading ? 'Adding...' : 'Add More & Save!'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscountSuggestionDialog;
