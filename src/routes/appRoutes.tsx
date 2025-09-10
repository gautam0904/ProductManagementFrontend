import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailPage from "../pages/ProductsDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import ProductManagementPage from "../pages/ProductManagementPage";
import CategoryManagementPage from "../pages/CategoryManagementPage";
import DiscountRulesManagementPage from "../pages/DiscountRulesManagementPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/products/:id" element={<ProductDetailPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/manage-products" element={<ProductManagementPage />} />
    <Route path="/manage-categories" element={<CategoryManagementPage />} />
    <Route path="/manage-discount-rules" element={<DiscountRulesManagementPage />} />
  </Routes>
);
export default AppRoutes;
