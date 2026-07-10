import { UserTable } from '@/components/UserTable';

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">유저 목록</h1>
      <UserTable />
    </div>
  );
}
