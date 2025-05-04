"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Review = {
  id: string;
  owner: string;
  review: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch reviews from API
  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDropReview = () => {
    setModalOpen(true);
    setName("");
    setReview("");
  };

  const handleSubmit = async () => {
    if (!review.trim()) return;
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: name, review }),
    });
    if (res.ok) {
      setModalOpen(false);
      setReview("");
      setName("");
      fetchReviews();
    }
  };

  const handleVote = async (id: string, type: "upvotes" | "downvotes") => {
    await fetch(`/api/reviews/${id}/${type === "upvotes" ? "upvote" : "downvote"}`, {
      method: "POST",
    });
    fetchReviews();
  };

  return (
    <main className="min-h-screen w-screen bg-zinc-900 flex flex-col items-center p-4 md:p-8 pt-8 md:pt-12">
      <div className="w-full max-w-2xl relative px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-white mb-4 md:mb-0 tracking-wider text-center md:text-left">Reviews</h1>
          <Button 
            className="w-full md:w-auto" 
            onClick={handleDropReview}
          >
            Drop a review
          </Button>
        </div>
        <div className="space-y-4 md:space-y-6">
          {loading && <div className="text-center text-white">Loading...</div>}
          {!loading && reviews.length === 0 && (
            <div className="text-center text-white">No reviews yet. Be the first!</div>
          )}
          {reviews.map(r => (
            <div key={r.id} className="bg-zinc-800 p-4 md:p-6 rounded-lg shadow-md border border-zinc-700 flex flex-col gap-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <span className="font-bold text-wordle-yellow text-sm md:text-base">{r.owner}</span>
                <div className="flex gap-2 items-center w-full md:w-auto">
                  <Button 
                    size="sm" 
                    onClick={() => handleVote(r.id, "upvotes")}
                    className="flex-1 md:flex-none"
                  >
                    ⬆️ {r.upvotes}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleVote(r.id, "downvotes")}
                    className="flex-1 md:flex-none"
                  >
                    ⬇️ {r.downvotes}
                  </Button>
                </div>
              </div>
              <div className="text-white text-base md:text-lg mt-2">{r.review}</div>
            </div>
          ))}
        </div>
      </div>
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold font-serif">Drop a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Review</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full h-32 bg-zinc-800 border-zinc-700 rounded-md p-2 text-white"
                placeholder="Write your review..."
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!review.trim()}
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
} 