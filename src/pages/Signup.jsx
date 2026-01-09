import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '', // ✅ added
  };

  const validate = (values) => {
    const errors = {};

    if (!values.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!values.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email address is invalid';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    }

    if (!values.role) {
      errors.role = 'Role is required';
    }

    return errors;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(`http://127.0.0.1:5000/signup`, {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role, // ✅ sent to backend
      });

      console.log("Response from API:", response);

      setSuccessMessage(
        'Registration successful! Please check your email for verification.'
      );
    } catch (err) {
      console.error("Error during registration:", err);
      if (err.response) {
        setError(
          `Registration failed: ${err.response.data.msg || 'Please try again.'}`
        );
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

      {error && (
        <div className="bg-red-200 text-red-600 p-2 rounded mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-200 text-green-600 p-2 rounded mb-4">
          {successMessage}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            {/* First Name */}
            <div className="mb-4">
              <label className="block text-gray-700">First Name</label>
              <Field
                type="text"
                name="firstName"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <ErrorMessage name="firstName" component="div" className="text-red-600 text-sm" />
            </div>

            {/* Last Name */}
            <div className="mb-4">
              <label className="block text-gray-700">Last Name</label>
              <Field
                type="text"
                name="lastName"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <ErrorMessage name="lastName" component="div" className="text-red-600 text-sm" />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <Field
                type="email"
                name="email"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className="block text-gray-700">Role</label>
              <Field
                as="select"
                name="role"
                className="w-full p-3 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Select a role</option>
                <option value="user">Doctor</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
              </Field>
              <ErrorMessage name="role" component="div" className="text-red-600 text-sm" />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-gray-700">Password</label>
              <Field
                type="password"
                name="password"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <ErrorMessage name="password" component="div" className="text-red-600 text-sm" />
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
              {loading || isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>

            <p className="mt-4 text-center">
              Already registered?
              <Link to="/login" className="ml-2 text-blue-600">
                Login
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Signup;
