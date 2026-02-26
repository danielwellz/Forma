import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-forma-900">صفحه پیدا نشد</h1>
      <p className="text-stone-600">ممکن است آدرس اشتباه باشد یا صفحه حذف شده باشد.</p>
      <Link href="/" className="rounded-xl bg-forma-700 px-4 py-2 text-white hover:bg-forma-800">
        بازگشت به خانه
      </Link>
    </div>
  );
}
