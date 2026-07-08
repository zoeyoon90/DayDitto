import { Button } from "@/components/Button/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center">
      <h1 className="text-5xl sm:text-7xl md:text-9xl animate-fade-in">DayDitto</h1>
      <p className="pt-4 sm:pt-7 text-xl sm:text-2xl md:text-4xl animate-fade-in text-center leading-8 sm:leading-10 md:leading-12">
        나의 하루를 <br/>다른 언어로 다시 쓰다
      </p>
      <Button asChild className="mt-6 sm:mt-10 bg-main animate-fade-in [animation-delay:1s]">
        <Link href="/login">로그인</Link>
      </Button>
    </div>
  );
}