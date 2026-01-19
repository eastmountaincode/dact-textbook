'use client';

import { SignIn } from '@clerk/nextjs';
import { useDevMode } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

export default function LoginPage() {
  const { devBorder } = useDevMode();

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] flex pt-12 justify-center p-4 ${devBorder('blue')}`}>
        <div className={`w-full max-w-md ${devBorder('green')}`}>
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-lg rounded-xl',
              },
            }}
            routing="hash"
            fallbackRedirectUrl="/chapter/welcome"
          />
        </div>
      </div>
    </TextbookLayout>
  );
}
