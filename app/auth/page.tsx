'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';

export default function AuthPage() {  
  return (
    <SignIn 
      path="/auth"
      routing="path"
      signUpUrl="/auth/sign-up"
      redirectUrl="/dashboard"
    />
  );
}