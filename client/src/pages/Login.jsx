import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate  = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [serverError, setServerError] = useState('');

  // If already logged in, navigate directly to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);


  const {
    register,
    handleSubmit,
    setError,          // ← highlight a specific field
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onSubmit' }); // only validate on submit, not on every keystroke

  const onSubmit = async (data) => {
    setServerError('');

    try {
      const res = await api.post('/auth/login', data);
      login(res.data);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      const responseData = err.response?.data;
      const field        = responseData?.field;       // 'email' | 'password' | undefined
      const message      = responseData?.message || 'Login failed. Please try again.';

      if (field === 'email') {
        // Highlight just the email field — password value stays intact
        setError('email', { type: 'server', message });
      } else if (field === 'password') {
        // Highlight just the password field — email value stays intact
        setError('password', { type: 'server', message });
      } else {
        // Generic error (server down, etc.)
        setServerError(message);
      }
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={7} lg={5}>
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body className="p-5">
                {/* Logo */}
                <div className="text-center mb-4">
                  <div className="display-4 mb-2">✅</div>
                  <h2 className="fw-bold text-primary">TaskManager</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {/* Generic server error (not field-specific) */}
                {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}

                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* Email */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="you@example.com"
                      size="lg"
                      isInvalid={!!errors.email}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      size="lg"
                      isInvalid={!!errors.password}
                      {...register('password', { required: 'Password is required' })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Form>

                <hr className="my-4" />
                <p className="text-center text-muted mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="fw-semibold text-decoration-none">
                    Create one →
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
