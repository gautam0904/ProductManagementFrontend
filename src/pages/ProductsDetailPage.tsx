import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, normalizeProduct } from "../api/productApi";
import type { Product } from "../types/products";
import { 
  Box, 
  Button, 
  Card, 
  CardMedia, 
  CircularProgress, 
  Container, 
  Grid, 
  Typography 
} from '@mui/material';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        const productData = await getProductById(id);
        setProduct(normalizeProduct(productData));
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

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
              sx={{ alignSelf: 'flex-start' }}
            >
              Add to Cart
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
export default ProductDetailPage;
