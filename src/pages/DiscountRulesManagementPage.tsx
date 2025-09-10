import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  LocalOffer as OfferIcon,
  Category as CategoryIcon,
  Inventory as ProductIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { 
  getDiscountRules, 
  createDiscountRule, 
  updateDiscountRule, 
  deleteDiscountRule,
  getDiscountTypeSuggestions 
} from '../api/discountRuleApi';
import { getCategories } from '../api/categoryApi';
import { listProducts } from '../api/productApi';
import type { DiscountRule, CreateDiscountRuleRequest, UpdateDiscountRuleRequest } from '../types/discountRule';
import type { Category } from '../types/category';
import type { Product } from '../types/products';
import toast from 'react-hot-toast';

const DiscountRulesManagementPage = () => {
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null);
  const [formData, setFormData] = useState<CreateDiscountRuleRequest>({
    name: '',
    description: '',
    type: 'FIXED_AMOUNT',
    active: true,
    priority: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, categoriesData, productsData, suggestionsData] = await Promise.all([
        getDiscountRules(),
        getCategories(),
        listProducts(),
        getDiscountTypeSuggestions()
      ]);
      
      setRules(rulesData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setProducts(productsData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (rule?: DiscountRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || '',
        type: rule.type,
        product: rule.product?._id,
        category: rule.category?._id,
        percentage: rule.percentage,
        fixedAmount: rule.fixedAmount,
        buyQuantity: rule.buyQuantity,
        getQuantity: rule.getQuantity,
        minCartValue: rule.minCartValue,
        minQuantity: rule.minQuantity,
        maxDiscount: rule.maxDiscount,
        maxUses: rule.maxUses,
        startDate: rule.startDate ? new Date(rule.startDate).toISOString().split('T')[0] : '',
        endDate: rule.endDate ? new Date(rule.endDate).toISOString().split('T')[0] : '',
        priority: rule.priority || 0,
        active: rule.active
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        type: 'FIXED_AMOUNT',
        active: true,
        priority: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      type: 'FIXED_AMOUNT',
      active: true,
      priority: 0
    });
  };

  const handleInputChange = (field: keyof CreateDiscountRuleRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await updateDiscountRule(editingRule._id, formData as UpdateDiscountRuleRequest);
        toast.success('Discount rule updated successfully');
      } else {
        await createDiscountRule(formData);
        toast.success('Discount rule created successfully');
      }
      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save discount rule:', error);
      toast.error('Failed to save discount rule');
    }
  };

  const handleDelete = async (rule: DiscountRule) => {
    if (window.confirm(`Are you sure you want to delete "${rule.name}"?`)) {
      try {
        await deleteDiscountRule(rule._id);
        toast.success('Discount rule deleted successfully');
        await loadData();
      } catch (error) {
        console.error('Failed to delete discount rule:', error);
        toast.error('Failed to delete discount rule');
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BOGO': return <OfferIcon />;
      case 'TWO_FOR_ONE': return <OfferIcon />;
      case 'PERCENT_CATEGORY': return <CategoryIcon />;
      case 'PERCENT_PRODUCT': return <ProductIcon />;
      case 'FIXED_AMOUNT': return <MoneyIcon />;
      case 'BUY_X_GET_Y': return <CartIcon />;
      default: return <OfferIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BOGO': return 'primary';
      case 'TWO_FOR_ONE': return 'secondary';
      case 'PERCENT_CATEGORY': return 'success';
      case 'PERCENT_PRODUCT': return 'info';
      case 'FIXED_AMOUNT': return 'warning';
      case 'BUY_X_GET_Y': return 'error';
      default: return 'default';
    }
  };

  const formatRuleDescription = (rule: DiscountRule) => {
    switch (rule.type) {
      case 'BOGO':
        return `Buy one ${rule.product?.name || rule.category?.name || 'item'}, get one FREE`;
      case 'TWO_FOR_ONE':
        return `Buy 2 ${rule.product?.name || rule.category?.name || 'items'}, pay for just 1`;
      case 'PERCENT_CATEGORY':
        return `${rule.percentage}% off all ${rule.category?.name || 'items'} in category`;
      case 'PERCENT_PRODUCT':
        return `${rule.percentage}% off ${rule.product?.name || 'product'}`;
      case 'FIXED_AMOUNT':
        return `$${rule.fixedAmount} off ${rule.minCartValue ? `orders over $${rule.minCartValue}` : 'any order'}`;
      case 'BUY_X_GET_Y':
        return `Buy ${rule.buyQuantity} ${rule.product?.name || rule.category?.name || 'items'}, get ${rule.getQuantity} FREE`;
      default:
        return rule.description || 'No description';
    }
  };

  const renderFormFields = () => {
    const { type } = formData;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Rule Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Discount Type</InputLabel>
            <Select
              value={formData.type}
              label="Discount Type"
              onChange={(e) => handleInputChange('type', e.target.value)}
            >
              {suggestions.map((suggestion) => (
                <MenuItem key={suggestion} value={suggestion}>
                  {suggestion.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            multiline
            rows={2}
          />
        </Grid>

        {/* Product/Category Selection */}
        {(type === 'BOGO' || type === 'TWO_FOR_ONE' || type === 'PERCENT_PRODUCT' || type === 'BUY_X_GET_Y') && (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={formData.product || ''}
                  label="Product"
                  onChange={(e) => handleInputChange('product', e.target.value)}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category || ''}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {/* Category Selection for PERCENT_CATEGORY */}
        {type === 'PERCENT_CATEGORY' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category || ''}
                label="Category"
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Percentage Fields */}
        {(type === 'PERCENT_CATEGORY' || type === 'PERCENT_PRODUCT') && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Percentage"
              type="number"
              value={formData.percentage || ''}
              onChange={(e) => handleInputChange('percentage', Number(e.target.value))}
              inputProps={{ min: 0, max: 100 }}
              required
            />
          </Grid>
        )}

        {/* Fixed Amount Field */}
        {type === 'FIXED_AMOUNT' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fixed Amount"
              type="number"
              value={formData.fixedAmount || ''}
              onChange={(e) => handleInputChange('fixedAmount', Number(e.target.value))}
              inputProps={{ min: 0 }}
              required
            />
          </Grid>
        )}

        {/* Buy X Get Y Fields */}
        {type === 'BUY_X_GET_Y' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Buy Quantity"
                type="number"
                value={formData.buyQuantity || ''}
                onChange={(e) => handleInputChange('buyQuantity', Number(e.target.value))}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Get Quantity"
                type="number"
                value={formData.getQuantity || ''}
                onChange={(e) => handleInputChange('getQuantity', Number(e.target.value))}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
          </>
        )}

        {/* Optional Fields */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Minimum Cart Value"
            type="number"
            value={formData.minCartValue || ''}
            onChange={(e) => handleInputChange('minCartValue', Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Minimum Quantity"
            type="number"
            value={formData.minQuantity || ''}
            onChange={(e) => handleInputChange('minQuantity', Number(e.target.value))}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Maximum Discount"
            type="number"
            value={formData.maxDiscount || ''}
            onChange={(e) => handleInputChange('maxDiscount', Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Maximum Uses"
            type="number"
            value={formData.maxUses || ''}
            onChange={(e) => handleInputChange('maxUses', Number(e.target.value))}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Priority"
            type="number"
            value={formData.priority || 0}
            onChange={(e) => handleInputChange('priority', Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
              />
            }
            label="Active"
          />
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Discount Rules Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Discount Rule
        </Button>
      </Box>

      {rules.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No discount rules found. Create your first discount rule to get started.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {rules.map((rule) => (
            <Grid item xs={12} md={6} lg={4} key={rule._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  avatar={getTypeIcon(rule.type)}
                  title={rule.name}
                  subheader={
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Chip
                        label={rule.type.replace(/_/g, ' ')}
                        color={getTypeColor(rule.type) as any}
                        size="small"
                      />
                      <Chip
                        label={rule.active ? 'Active' : 'Inactive'}
                        color={rule.active ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  }
                  action={
                    <Tooltip title="Rule Details">
                      <IconButton>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {formatRuleDescription(rule)}
                  </Typography>
                  
                  {rule.description && (
                    <Typography variant="body2" color="text.secondary">
                      {rule.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" flexDirection="column" gap={1}>
                    {rule.priority !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        Priority: {rule.priority}
                      </Typography>
                    )}
                    {rule.currentUses !== undefined && rule.maxUses && (
                      <Typography variant="caption" color="text.secondary">
                        Uses: {rule.currentUses}/{rule.maxUses}
                      </Typography>
                    )}
                    {rule.startDate && (
                      <Typography variant="caption" color="text.secondary">
                        Starts: {new Date(rule.startDate).toLocaleDateString()}
                      </Typography>
                    )}
                    {rule.endDate && (
                      <Typography variant="caption" color="text.secondary">
                        Ends: {new Date(rule.endDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(rule)}
                  >
                    Edit
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(rule)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? 'Edit Discount Rule' : 'Add New Discount Rule'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {renderFormFields()}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default DiscountRulesManagementPage;
