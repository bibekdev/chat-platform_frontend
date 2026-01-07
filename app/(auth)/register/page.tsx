import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { RegisterForm } from '@/features/auth/components/register-form';

const RegisterPage = () => {
  return (
    <div className='flex items-center justify-center h-screen'>
      <Card className='w-full max-w-lg shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>
            Create an account
          </CardTitle>
          <CardDescription className='text-sm text-muted-foreground text-center'>
            Enter your full name, email and password to create an account
          </CardDescription>
        </CardHeader>
        <CardContent className='mt-5'>
          <RegisterForm />
        </CardContent>
        <CardFooter className='flex justify-end'>
          <p className='text-sm text-muted-foreground text-center'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='text-primary hover:underline font-medium ml-auto'>
              Login to your account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
