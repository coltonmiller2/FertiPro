
'use client';

import { BackyardPage } from '@/components/backyard-page';
import AuthGuard from '@/components/auth-guard';

export default function Home() {
 return (
    <AuthGuard>
        <BackyardPage />
    </AuthGuard>
  );
}
