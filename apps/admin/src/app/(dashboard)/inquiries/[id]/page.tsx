import Link from 'next/link';
import { InquiryReplyForm } from '@/components/InquiryReplyForm';

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/inquiries"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 문의 목록
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">문의 상세</h1>
      </div>
      <InquiryReplyForm id={id} />
    </div>
  );
}
