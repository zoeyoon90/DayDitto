'use client';

import Link from 'next/link';
import { useMyInquiries } from '@/hooks/inquiry/useMyInquiries';

export default function MyInquiries() {
  const { inquiries, isLoading } = useMyInquiries()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">나의 문의글</h2>

      {isLoading ? (
        <p className="text-sm text-foreground/40">불러오는 중...</p>
      ) : inquiries.length === 0 ? (
        <p className="text-sm text-foreground/50">문의 내역이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <Link href={`/inquiry/${inquiry.id}`}>
                <div className="border-2 border-border rounded-base bg-bw px-5 py-4 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all cursor-pointer">
                  <p className="font-medium text-text truncate">{inquiry.title}</p>
                  <p className="text-xs text-foreground/40 mt-1">
                    {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
