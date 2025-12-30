import { SignIn } from '@clerk/clerk-react'
import React from 'react'

const LoginPage = () => {
  return (
    <div className='h-screen hero'>
        <SignIn/>
    </div>
  )
}

export default LoginPage