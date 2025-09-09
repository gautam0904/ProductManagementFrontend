import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { loginUser } from "../store/slices/authSlice";
import { 
  Box, 
  Button, 
  TextField, 
  InputAdornment,
  IconButton,
  Paper
} from "@mui/material";
import { Visibility, VisibilityOff, Mail as MailIcon, Lock as LockIcon } from "@mui/icons-material";
import AuthLayout from "../components/layout/AuthLayout";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading: isLoading } = useSelector((s: RootState) => s.auth);
  
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Login successful!");
        navigate("/", { replace: true });
      } else if (resultAction.payload) {
        // Handle the case where the API returns a 200 but with an error message
        const errorMessage = typeof resultAction.payload === 'string' 
          ? resultAction.payload 
          : 'Login failed. Please try again.';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      // This will catch any unexpected errors
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  return (
    <AuthLayout
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Sign up"
    >
      <Paper elevation={3} sx={{  borderRadius: 2, width: '100%', maxWidth: 450 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            required
            id="email"
            name="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            required
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </AuthLayout>
  );
};

export default LoginPage;
