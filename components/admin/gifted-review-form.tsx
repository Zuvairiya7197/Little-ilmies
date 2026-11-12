"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function GiftedReviewForm({ products }: { products: { id: string; title: string }[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, authorName, title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add the review.");
        return;
      }
      router.push("/admin/reviews?status=APPROVED");
      router.refresh();
    } catch {
      setError("Could not add the review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-xl p-5" noValidate>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-600">Book</span>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="admin-input">
          <option value="">Choose a book…</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="mt-4">
        <legend className="mb-1.5 text-sm font-semibold text-ink-600">Rating</legend>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((stars) => (
            <label
              key={stars}
              className="tap-target flex cursor-pointer items-center justify-center rounded-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink-300"
            >
              <input
                type="radio"
                name="rating"
                value={stars}
                checked={rating === stars}
                onChange={() => setRating(stars)}
                className="sr-only"
              />
              <Star
                className={cn("h-7 w-7", stars <= rating ? "fill-gold-400 text-gold-400" : "fill-ink-100 text-ink-100")}
                aria-hidden="true"
              />
              <span className="sr-only">
                {stars} {stars === 1 ? "star" : "stars"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-600">Parent&apos;s name to show</span>
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={40}
          className="admin-input"
          placeholder="e.g. Umm Yusuf, Pune"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-600">
          Headline <span className="font-normal text-ink-300">(optional)</span>
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className="admin-input" />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-600">Review</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} maxLength={2000} className="admin-input" />
      </label>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Publish review"}
      </button>
    </form>
  );
}
