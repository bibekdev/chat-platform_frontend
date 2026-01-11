'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockIcon, MailIcon } from 'lucide-react';

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
import { useLoginMutation } from '@/features/auth/hooks';
import { LoginDto, loginSchema } from '../schemas/auth.schema';

export const LoginForm = () => {
  const { mutate: login, isPending } = useLoginMutation();

  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = (values: LoginDto) => {
    login(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-5'>
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
          {isPending ? <Loading /> : 'Login'}
        </Button>
      </form>
    </Form>
  );
};
