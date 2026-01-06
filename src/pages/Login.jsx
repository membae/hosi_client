import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: '',
  };

  const validate = (values) => {
    const errors = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/login',
        {
          email: values.email,
          password: values.password,
        }
      );

      console.log('Login response:', response.data);

      // Example: save tokens if returned
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Redirect after login
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data.msg || 'Invalid email or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

      {error && (
        <div className="bg-red-200 text-red-600 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <Field
                type="email"
                name="email"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-600 text-sm"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-gray-700">Password</label>
              <Field
                type="password"
                name="password"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-600 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={`w-full py-3 bg-gray-900 text-white font-bold rounded-md ${
                loading || isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-600'
              }`}
            >
              {loading || isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            <p className="mt-4 text-center">
              Don’t have an account?
              <Link to="/signup" className="ml-2 text-blue-600">
                Sign Up
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
