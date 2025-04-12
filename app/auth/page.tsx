'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';

export default function AuthPage() {  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn />
    </div>
  );
}