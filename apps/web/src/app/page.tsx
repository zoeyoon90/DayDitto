import { Button } from "@/components/Button/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center">
      <h1 className="text-9xl animate-fade-in  ">DayDitto</h1>
      <p className="pt-7 text-4xl animate-fade-in text-center leading-12 ">
        나의 하루를 <br/>다른 언어로 다시 쓰다
      </p>
      <Button asChild className="mt-10 bg-main animate-fade-in [animation-delay:1s]">
        <Link href="/login">로그인</Link>
      </Button>
    </div>
  );
}