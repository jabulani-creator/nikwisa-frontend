"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducers/store";
import { fetchUserById, updateProfile } from "@/reducers/authSlice";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import Image from "next/image";

type UserProfileData = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  username: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  date_of_birth: string;
  gender: string;
  profile_image: File | null;
  role?: string;
  user_type: string;
};

type DecodedToken = {
  user_id: string;
};

const EditProfilePage = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { user, loading: userLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const [profileData, setProfileData] = useState<UserProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    username: "",
    address_line: "",
    city: "",
    state: "",
    country: "",
    date_of_birth: "",
    gender: "",
    profile_image: null,
    role: "",
    user_type: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch user data when component mounts
  const fetchUserData = useCallback(() => {
    const token = Cookies.get("access_token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded?.user_id) {
          dispatch(fetchUserById(Number(decoded.user_id)));
        }
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Update form fields when user data is fetched
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        username: user.username || "",
        address_line: user.address_line || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || "",
        profile_image: null,
        role: user.role || "",
        user_type: user.user_type || "",
      });
      if (user.profile_image) {
        setImagePreview(user.profile_image);
      }
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setProfileData((prev) => ({
        ...prev,
        profile_image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: keyof UserProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      console.error("User ID is missing");
      return;
    }

    try {
      // Create a FormData object to properly handle file uploads
      const formData = new FormData();

      // Add all fields except profile_image first
      Object.keys(profileData).forEach((key) => {
        if (
          key !== "profile_image" &&
          profileData[key as keyof UserProfileData] !== undefined
        ) {
          formData.append(
            key,
            String(profileData[key as keyof UserProfileData])
          );
        }
      });

      // Add the profile_image file if it exists
      if (profileData.profile_image) {
        formData.append("profile_image", profileData.profile_image);
      }

      // Call the API with FormData
      await dispatch(updateProfile({ userId: user.id, userData: formData }));

      router.push("/dashboard/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const formFields = [
    { label: "First Name", id: "first_name", type: "text" },
    { label: "Last Name", id: "last_name", type: "text" },
    { label: "Email", id: "email", type: "email" },
    { label: "Phone Number", id: "phone_number", type: "tel" },
    { label: "Username", id: "username", type: "text" },
    { label: "Address", id: "address_line", type: "text" },
    { label: "City", id: "city", type: "text" },
    { label: "State", id: "state", type: "text" },
    { label: "Country", id: "country", type: "text" },
    { label: "Date of Birth", id: "date_of_birth", type: "date" },
    {
      label: "Gender",
      id: "gender",
      type: "select",
      options: ["Male", "Female"],
    },
    {
      label: "User Role",
      id: "role",
      type: "select",
      options: ["Merchant", "Client"],
    },
    {
      label: "User Type",
      id: "user_type",
      type: "select",
      options: ["Merchant", "Client"],
    },
  ].filter((field) => field.id !== "profile_image"); // Exclude profile_image

  if (userLoading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        {/* Profile Image Upload */}
        <div className="mb-6">
          <label className="block text-base font-medium text-gray-700">
            Profile Image
          </label>
          <div className="mt-2 flex items-center gap-4">
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Profile Preview"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-full"
              />
            )}
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-customGold"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formFields.map(({ label, id, type, options }) => (
            <div key={id} className="mb-4">
              <label
                htmlFor={id}
                className="block text-base font-medium text-gray-700"
              >
                {label}
              </label>
              {type === "select" ? (
                <select
                  id={id}
                  value={
                    typeof profileData[id as keyof UserProfileData] ===
                      "string" ||
                    typeof profileData[id as keyof UserProfileData] === "number"
                      ? (profileData[id as keyof UserProfileData] as
                          | string
                          | number)
                      : ""
                  }
                  onChange={(e) =>
                    handleChange(id as keyof UserProfileData, e.target.value)
                  }
                  className="w-full p-4 mt-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-customGold"
                >
                  <option value="">Select {label}</option>
                  {options?.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  id={id}
                  value={profileData[id as keyof UserProfileData] || ""}
                  onChange={(e) =>
                    handleChange(id as keyof UserProfileData, e.target.value)
                  }
                  className="w-full p-4 mt-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-customGold"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-4 mt-8">
          <button
            type="submit"
            className="bg-[#B8902E] text-white py-2 px-4 rounded"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/reducers/store";
// import { fetchUserById, updateProfile } from "@/reducers/authSlice";
// import { jwtDecode } from "jwt-decode";
// import Cookies from "js-cookie";
// import Image from "next/image";

// type UserProfileData = {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone_number: string;
//   username: string;
//   address_line: string;
//   city: string;
//   state: string;
//   country: string;
//   date_of_birth: string;
//   gender: string;
//   profile_image: File | null;
//   role?: string;
//   user_type: string;
// };

// type DecodedToken = {
//   user_id: string;
// };

// const EditProfilePage = () => {
//   const router = useRouter();
//   const dispatch: AppDispatch = useDispatch();
//   const { user, loading: userLoading } = useSelector(
//     (state: RootState) => state.auth
//   );

//   console.log("user b", user);
//   const [profileData, setProfileData] = useState<UserProfileData>({
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone_number: "",
//     username: "",
//     address_line: "",
//     city: "",
//     state: "",
//     country: "",
//     date_of_birth: "",
//     gender: "",
//     profile_image: null,
//     role: "",
//     user_type: "",
//   });

//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   // Fetch user data when component mounts
//   const fetchUserData = useCallback(() => {
//     const token = Cookies.get("access_token");
//     if (token) {
//       try {
//         const decoded: DecodedToken = jwtDecode(token);
//         if (decoded?.user_id) {
//           dispatch(fetchUserById(Number(decoded.user_id)));
//           // dispatch(fetchUserById(decoded.user_id));
//         }
//       } catch (err) {
//         console.error("Failed to decode token", err);
//       }
//     }
//   }, [dispatch]);

//   useEffect(() => {
//     fetchUserData();
//   }, [fetchUserData]);

//   // Update form fields when user data is fetched
//   useEffect(() => {
//     if (user) {
//       setProfileData({
//         first_name: user.first_name || "",
//         last_name: user.last_name || "",
//         email: user.email || "",
//         phone_number: user.phone_number || "",
//         username: user.username || "",
//         address_line: user.address_line || "",
//         city: user.city || "",
//         state: user.state || "",
//         country: user.country || "",
//         date_of_birth: user.date_of_birth || "",
//         gender: user.gender || "",
//         profile_image: null,
//         role: user.role || "",
//         user_type: user.user_type || "",
//       });
//       if (user.profile_image) {
//         setImagePreview(user.profile_image);
//       }
//     }
//   }, [user]);

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files ? e.target.files[0] : null;
//     if (file) {
//       setProfileData((prev) => ({
//         ...prev,
//         profile_image: file,
//       }));

//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleChange = (field: keyof UserProfileData, value: string) => {
//     setProfileData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!user?.id) {
//       console.error("User ID is missing");
//       return;
//     }

//     try {
//       console.log("profileData", profileData);

//       // Create a FormData object to properly handle file uploads
//       const formData = new FormData();

//       // Add all fields except profile_image first
//       Object.keys(profileData).forEach((key) => {
//         if (
//           key !== "profile_image" &&
//           profileData[key as keyof UserProfileData] !== undefined
//         ) {
//           formData.append(
//             key,
//             String(profileData[key as keyof UserProfileData])
//           );
//         }
//       });

//       // Add the profile_image file if it exists
//       if (profileData.profile_image) {
//         formData.append("profile_image", profileData.profile_image);
//       }

//       // Call the API with FormData
//       await dispatch(updateProfile({ userId: user.id, userData: formData }));

//       // await dispatch(
//       //   updateProfile({
//       //     userId: user.id,
//       //     userData: formData as unknown, // Using 'any' here since FormData doesn't match the User type structure
//       //   })
//       // );

//       router.push("/dashboard/profile");
//     } catch (error) {
//       console.error("Error updating profile:", error);
//     }
//   };
//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();

//   //   if (!user?.id) {
//   //     console.error("User ID is missing");
//   //     return;
//   //   }

//   //   // Update this section in your handleSubmit function
//   //   const formData = new FormData();
//   //   Object.keys(profileData).forEach((key) => {
//   //     const typedKey = key as keyof UserProfileData;

//   //     if (key === "profile_image" && profileData.profile_image) {
//   //       formData.append(key, profileData.profile_image);
//   //     } else if (
//   //       profileData[typedKey] !== null &&
//   //       profileData[typedKey] !== undefined
//   //     ) {
//   //       // Convert any value to string to ensure it's valid for FormData
//   //       formData.append(key, String(profileData[typedKey]));
//   //     }
//   //   });

//   //   try {
//   //     console.log("profileData", profileData);
//   //     await dispatch(updateProfile({ userId: user.id, userData: profileData }));
//   //     router.push("/dashboard/profile");
//   //   } catch (error) {
//   //     console.error("Error updating profile:", error);
//   //   }
//   // };

//   const formFields = [
//     { label: "First Name", id: "first_name", type: "text" },
//     { label: "Last Name", id: "last_name", type: "text" },
//     { label: "Email", id: "email", type: "email" },
//     { label: "Phone Number", id: "phone_number", type: "tel" },
//     { label: "Username", id: "username", type: "text" },
//     { label: "Address", id: "address_line", type: "text" },
//     { label: "City", id: "city", type: "text" },
//     { label: "State", id: "state", type: "text" },
//     { label: "Country", id: "country", type: "text" },
//     { label: "Date of Birth", id: "date_of_birth", type: "date" },
//     {
//       label: "Gender",
//       id: "gender",
//       type: "select",
//       options: ["Male", "Female"],
//     },
//     {
//       label: "User Role",
//       id: "role",
//       type: "select",
//       options: ["Merchant", "Client"],
//     },
//     {
//       label: "User Type",
//       id: "user_type",
//       type: "select",
//       options: ["Merchant", "Client"],
//     },
//   ];

//   if (userLoading) {
//     return <div>Loading user data...</div>;
//   }

//   return (
//     <div className="max-w-3xl mx-auto mt-8 p-4">
//       <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

//       <form onSubmit={handleSubmit}>
//         {/* Profile Image Upload */}
//         <div className="mb-6">
//           <label className="block text-base font-medium text-gray-700">
//             Profile Image
//           </label>
//           <div className="mt-2 flex items-center gap-4">
//             {imagePreview && (
//               <Image
//                 src={imagePreview}
//                 alt="Profile Preview"
//                 width={128}
//                 height={128}
//                 className="w-32 h-32 object-cover rounded-full"
//               />
//             )}
//             <input
//               type="file"
//               onChange={handleImageChange}
//               accept="image/*"
//               className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-customGold"
//             />
//           </div>
//         </div>

//         {/* Form Fields */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {formFields.map(({ label, id, type, options }) => (
//             <div key={id} className="mb-4">
//               <label
//                 htmlFor={id}
//                 className="block text-base font-medium text-gray-700"
//               >
//                 {label}
//               </label>
//               {type === "select" ? (
//                 <select
//                   id={id}
//                   value={
//                     typeof profileData[id as keyof UserProfileData] ===
//                       "string" ||
//                     typeof profileData[id as keyof UserProfileData] === "number"
//                       ? (profileData[id as keyof UserProfileData] as
//                           | string
//                           | number)
//                       : ""
//                   }
//                   onChange={(e) =>
//                     handleChange(id as keyof UserProfileData, e.target.value)
//                   }
//                 >
//                   <option value="">Select {label}</option>
//                   {options?.map((option) => (
//                     <option key={option} value={option.toLowerCase()}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               ) : (
//                 <input
//                   type={type}
//                   id={id}
//                   value={profileData[id as keyof UserProfileData]}
//                   onChange={(e) =>
//                     handleChange(id as keyof UserProfileData, e.target.value)
//                   }
//                   className="w-full p-4 mt-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-customGold"
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="flex justify-between gap-4 mt-8">
//           <button
//             type="submit"
//             className="bg-[#B8902E] text-white py-2 px-4 rounded"
//           >
//             Save Changes
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditProfilePage;

// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/reducers/store";
// import { fetchUserById, updateProfile } from "@/reducers/authSlice"; // Import the updateProfile action
// import { jwtDecode } from "jwt-decode";
// import Cookies from "js-cookie";

// type UserProfileData = {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone_number: string;
//   username: string;
//   address_line: string;
//   city: string;
//   state: string;
//   country: string;
//   date_of_birth: string;
//   gender: string;
//   profile_image: File | null;
//   role?: string;
//   user_type: string;
// };

// const EditProfilePage = () => {
//   const router = useRouter();
//   const dispatch: AppDispatch = useDispatch();
//   const { user, loading: userLoading } = useSelector(
//     (state: RootState) => state.auth
//   );

//   const [profileData, setProfileData] = useState<UserProfileData>({
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone_number: "",
//     username: "",
//     address_line: "",
//     city: "",
//     state: "",
//     country: "",
//     date_of_birth: "",
//     gender: "",
//     profile_image: null,
//     role: "",
//     user_type: "",
//   });

//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   // Fetch user data on component mount
//   useEffect(() => {
//     const token = Cookies.get("access_token");
//     if (token) {
//       fetchUserData(token);
//     }
//   }, []);

//   const fetchUserData = (token: string) => {
//     try {
//       const decoded: any = jwtDecode(token);
//       if (decoded?.user_id) {
//         dispatch(fetchUserById(decoded.user_id)); // Dispatch action to fetch user
//       }
//     } catch (err) {
//       console.error("Failed to decode token", err);
//     }
//   };

//   // Update form data when user data is fetched
//   useEffect(() => {
//     if (user) {
//       setProfileData({
//         first_name: user.first_name || "",
//         last_name: user.last_name || "",
//         email: user.email || "",
//         phone_number: user.phone_number || "",
//         username: user.username || "",
//         address_line: user.address_line || "",
//         city: user.city || "",
//         state: user.state || "",
//         country: user.country || "",
//         date_of_birth: user.date_of_birth || "",
//         gender: user.gender || "",
//         profile_image: null,
//         role: user.role || "",
//         user_type: user.user_type || "",
//       });
//       if (user.profile_image) {
//         setImagePreview(user.profile_image);
//       }
//     }
//   }, [user]);

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files ? e.target.files[0] : null;
//     if (file) {
//       setProfileData((prev) => ({
//         ...prev,
//         profile_image: file,
//       }));
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleChange = (field: keyof UserProfileData, value: string) => {
//     setProfileData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!user?.id) {
//       console.error("User ID is missing");
//       return;
//     }

//     const formData = new FormData();
//     Object.keys(profileData).forEach((key) => {
//       if (key === "profile_image" && profileData.profile_image) {
//         formData.append(key, profileData.profile_image);
//       } else {
//         formData.append(key, profileData[key as keyof UserProfileData]);
//       }
//     });

//     try {
//       console.log("profileData", profileData);
//       await dispatch(updateProfile({ userId: user.id, userData: profileData })); // Ensure user.id is passed
//       router.push("/dashboard/profile");
//     } catch (error) {
//       console.error("Error updating profile:", error);
//     }
//   };

//   const formFields = [
//     { label: "First Name", id: "first_name", type: "text" },
//     { label: "Last Name", id: "last_name", type: "text" },
//     { label: "Email", id: "email", type: "email" },
//     { label: "Phone Number", id: "phone_number", type: "tel" },
//     { label: "Username", id: "username", type: "text" },
//     { label: "Address", id: "address_line", type: "text" },
//     { label: "City", id: "city", type: "text" },
//     { label: "State", id: "state", type: "text" },
//     { label: "Country", id: "country", type: "text" },
//     { label: "Date of Birth", id: "date_of_birth", type: "date" },
//     {
//       label: "Gender",
//       id: "gender",
//       type: "select",
//       options: ["Male", "Female"],
//     },
//     {
//       label: "User Role",
//       id: "role",
//       type: "select",
//       options: ["Merchant", "client"],
//     },
//     {
//       label: "User Type",
//       id: "user_type",
//       type: "select",
//       options: ["Merchant", "client"],
//     },
//   ];

//   if (userLoading) {
//     return <div>Loading user data...</div>;
//   }

//   return (
//     <div className="max-w-3xl mx-auto mt-8 p-4">
//       <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

//       <form onSubmit={handleSubmit}>
//         {/* Profile Image Upload */}
//         <div className="mb-6">
//           <label className="block text-base font-medium text-gray-700">
//             Profile Image
//           </label>
//           <div className="mt-2 flex items-center gap-4">
//             {imagePreview && (
//               <img
//                 src={imagePreview}
//                 alt="Profile Preview"
//                 className="w-32 h-32 object-cover rounded-full"
//               />
//             )}
//             <input
//               type="file"
//               onChange={handleImageChange}
//               accept="image/*"
//               className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2  focus:ring-customGold"
//             />
//           </div>
//         </div>

//         {/* Form Fields */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {formFields.map(({ label, id, type, options }) => (
//             <div key={id} className="mb-4">
//               <label
//                 htmlFor={id}
//                 className="block text-base font-medium text-gray-700 "
//               >
//                 {label}
//               </label>
//               {type === "select" ? (
//                 <select
//                   id={id}
//                   value={profileData[id as keyof UserProfileData]}
//                   onChange={(e) =>
//                     handleChange(id as keyof UserProfileData, e.target.value)
//                   }
//                   className="w-full p-4 mt-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2  focus:ring-customGold"
//                 >
//                   <option value="">Select {label}</option>
//                   {options?.map((option) => (
//                     <option key={option} value={option.toLowerCase()}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               ) : (
//                 <input
//                   type={type}
//                   id={id}
//                   value={profileData[id as keyof UserProfileData]}
//                   onChange={(e) =>
//                     handleChange(id as keyof UserProfileData, e.target.value)
//                   }
//                   className="w-full p-4 mt-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-customGold"
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-between gap-4 mt-8">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="bg-gray-500 text-white py-2 px-4 rounded"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="bg-[#B8902E] text-white py-2 px-4 rounded"
//           >
//             Save Changes
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditProfilePage;
