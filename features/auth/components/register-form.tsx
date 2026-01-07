'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockIcon, MailIcon, UserIcon } from 'lucide-react';

import Loading from '@/components/loading';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRegisterMutation } from '../hooks/useRegisterMutation';
import { RegisterDto, registerSchema } from '../schemas/auth.schema';

export const RegisterForm = () => {
  const { mutate: register, isPending } = useRegisterMutation();

  const form = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: ''
    }
  });

  const onSubmit = (values: RegisterDto) => {
    register(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-5'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <div className='relative'>
                <UserIcon className='absolute size-4.5 left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <FormControl>
                  <Input
                    type='text'
                    disabled={isPending}
                    placeholder='John Doe'
                    className='pl-10 h-11'
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className='relative'>
                <MailIcon className='absolute size-4.5 left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <FormControl>
                  <Input
                    type='email'
                    disabled={isPending}
                    placeholder='john.doe@example.com'
                    className='pl-10 h-11'
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className='relative'>
                <LockIcon className='absolute size-4.5 left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <FormControl>
                  <Input
                    type='password'
                    disabled={isPending}
                    className='pl-10 h-11'
                    placeholder='********'
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={isPending}
          className='w-full h-11 mt-5'>
          {isPending ? <Loading /> : 'Register'}
        </Button>
      </form>
    </Form>
  );
};
