"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { fetchStoresWithOfferings } from "@/reducers/storeSlice";
import { AppDispatch, RootState } from "@/reducers/store";
import StoreCardAdmin from "@/components/StoreCardAdmin"; // Ensure correct path

interface User {
  id: number;
  username: string;
  email: string;
  user_id: number; // Ensure this matches your decoded token structure
}

const StorePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  const { stores, loading, error } = useSelector(
    (state: RootState) => state.stores
  );

  // Extract user ID from token
  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = Cookies.get("access_token");
      if (!accessToken) {
        router.push("/signin");
        return;
      }

      try {
        const decodedToken: User = jwtDecode(accessToken);
        setUserId(decodedToken.user_id);
      } catch (err) {
        console.error("Failed to decode token", err);
        router.push("/signin");
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
      if (userId !== null) {
        dispatch(fetchStoresWithOfferings(userId.toString()));
      }
    }, [dispatch, userId]);

  // Filter stores owned by the logged-in user
  const userStores = stores.filter((store) => {
    const owner = store.owner as unknown as { id: number };
    return typeof owner === 'object' && owner.id === userId;
  });

  return (
    <div className="container mx-auto p-0 md:p-8">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">My Stores</h1>
        {userStores.length === 0 && (
          <button
            className="bg-[#B8902E] text-white py-2 px-4 rounded"
            onClick={() => router.push("/dashboard/create-store")}
          >
            Add Store
          </button>
        )}
      </div>

      {loading && <p>Loading store...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {userStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userStores.map((store) => (
            <StoreCardAdmin
              key={store.id}
              id={store.id}
              name={store.name}
              image={store.image || ""}
              rating={store.rating || 0}
              reviews_count={store.reviews_count || 0}
              working_hours={store.working_hours}
              location={store.location}
              event_planning_categories={store.event_planning_categories || []}
              rent_hire_categories={store.rent_hire_categories || []}
            />
          ))}
        </div>
      ) : (
        !loading && <p>No store available.</p>
      )}
    </div>
  );
};

export default StorePage;
