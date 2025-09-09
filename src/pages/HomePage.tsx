import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Container, Grid, Typography, Card, CardContent } from '@mui/material'

const HomePage = () => (
  <>
    <Box sx={{ py: 6, background: (theme) => `linear-gradient(180deg, ${theme.palette.primary.main}22, transparent)` }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight={800}>
              Welcome to MyStore
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Find great deals with BOGO and Buy 2 Get 1 offers.
            </Typography>
            <Button variant="contained" size="large" component={Link as any} to="/products">
              Browse Products
            </Button>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6">Why shop with us?</Typography>
                <Typography color="text.secondary">
                  The best products at the best prices. Quality you can trust.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  </>
);
export default HomePage;
