import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchMockCurrentUser,
  fetchMockAverageRating,
  fetchMockReviews,
  fetchMockUserProfile,
} from '../lib/reviewApi';
import { useRouter } from 'expo-router';

const ReviewScreen = () => {
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [recipientName, setRecipientName] = useState<string>('');
  const [reviewersMap, setReviewersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recipientId = 'user123'; // This is the person being reviewed
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await fetchMockCurrentUser();

        const [ratingData, reviewData, recipientProfile] = await Promise.all([
          fetchMockAverageRating(),
          fetchMockReviews(),
          fetchMockUserProfile(recipientId),
        ]);

        setRating(ratingData.average_rating);
        setReviewCount(ratingData.review_count);
        setRecipientName(recipientProfile.name);

        // Fetch reviewer names for all unique reviewerIds
        const uniqueReviewerIds = Array.from(
          new Set(reviewData.map((r) => r.reviewerId))
        );

        const reviewerProfiles = await Promise.all(
          uniqueReviewerIds.map((id) => fetchMockUserProfile(id))
        );

        const reviewerMap: Record<string, string> = {};
        reviewerProfiles.forEach((profile) => {
          reviewerMap[profile.id] = profile.name;
        });

        setReviewersMap(reviewerMap);
        setReviews(reviewData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <View style={styles.pageWrapper}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color="black" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
          <>
            <Text style={styles.title}>{recipientName}'s Reviews</Text>

            <View style={styles.averageRatingBlock}>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <Ionicons
                    key={index}
                    name={
                      index <= Math.floor(rating ?? 0)
                        ? 'star'
                        : rating && rating >= index - 0.5
                        ? 'star-half'
                        : 'star-outline'
                    }
                    size={24}
                    color="#ffd700"
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {rating?.toFixed(1)}/5 ({reviewCount})
              </Text>
            </View>

            {reviews.map((review, i) => (
              <View key={i} style={styles.reviewCard}>
                <Text style={styles.reviewHeader}>
                  {reviewersMap[review.reviewerId] ?? 'Loading'} – {review.date}
                </Text>
                <View style={styles.reviewStarsWithText}>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((index) => (
                      <Ionicons
                        key={index}
                        name={
                          index <= Math.floor(review.rating)
                            ? 'star'
                            : review.rating >= index - 0.5
                            ? 'star-half'
                            : 'star-outline'
                        }
                        size={18}
                        color="#ffd700"
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewScoreText}>{review.rating}/5</Text>
                </View>
                <Text style={styles.reviewBody}>{review.description}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 999,
    padding: 10,
  },
  container: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  averageRatingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    marginLeft: 10,
    fontSize: 18,
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  reviewHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewBody: {
    fontSize: 14,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewStarsWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewScoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});

export default ReviewScreen;
