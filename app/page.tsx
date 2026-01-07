import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div>
      <Button variant={'destructive'}>Click me</Button>
      <p className='text-primary'>Hello, I am changeed</p>
    </div>
  );
}
