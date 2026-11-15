'use client';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Kept in its own module so the Google SDK only loads on the sign-in screen.
export default function GoogleButton({ clientId, onSuccess, onError, text }) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin onSuccess={onSuccess} onError={onError} shape="pill" text={text} />
    </GoogleOAuthProvider>
  );
}
