import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-24">
      <p className="text-xs uppercase tracking-[0.18em] text-stone">404</p>
      <h1 className="display mt-3 text-5xl text-ink">That page is not in the yard.</h1>
      <Link href="/" className="btn btn-primary mt-6">Back to CBH</Link>
    </div>
  );
}
