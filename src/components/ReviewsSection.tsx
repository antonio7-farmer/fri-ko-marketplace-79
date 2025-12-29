import { Star, MessageCircle } from 'lucide-react';

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
}

// Placeholder reviews for demo
const placeholderReviews = [
  {
    id: '1',
    user_name: 'Marija K.',
    user_avatar: null,
    rating: 5,
    comment: 'Odlični proizvodi, uvijek svježe voće i povrće. Preporučujem svima!',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    user_name: 'Ivan P.',
    user_avatar: null,
    rating: 4,
    comment: 'Vrlo zadovoljan kvalitetom. Brza komunikacija i ljubazno osoblje.',
    created_at: '2024-01-10'
  }
];

const ReviewsSection = ({ rating, reviewCount }: ReviewsSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-[#1F2937]">{rating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-[#E5E7EB]'}
                />
              ))}
            </div>
            <p className="text-sm text-[#6B7280] mt-1">{reviewCount} recenzija</p>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm text-[#6B7280] w-8">{stars}★</span>
                <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#22C55E]"
                    style={{ width: `${stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : 5}%` }}
                  />
                </div>
                <span className="text-sm text-[#6B7280] w-8 text-right">
                  {stars === 5 ? 7 : stars === 4 ? 3 : stars === 3 ? 1 : 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {placeholderReviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <MessageCircle size={48} className="text-[#E5E7EB] mx-auto mb-4" />
            <p className="text-[#6B7280]">Još nema recenzija</p>
          </div>
        ) : (
          placeholderReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                  <span className="text-[#22C55E] font-semibold text-lg">
                    {review.user_name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-[#1F2937]">{review.user_name}</h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-[#E5E7EB]'}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-[#6B7280]">
                      {new Date(review.created_at).toLocaleDateString('hr-HR')}
                    </span>
                  </div>
                  <p className="text-[#6B7280]">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
