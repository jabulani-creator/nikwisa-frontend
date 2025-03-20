"use client";

import Step1Categories from "@/components/Categories/Step1Categories";
import Step2SubCategories from "@/components/Categories/Step2SubCategories";
import Step3StoreDetails from "@/components/Categories/Step3Details";
import React, { useState } from "react";

// Define the Step2Payload type
type Step2Payload = {
  categories?: number[];
  event_planning_categories?: string[];
  rent_hire_categories?: string[];
  name?: string;
  phone_number?: string;
  whats_app?: string;
  image?: string;
  overview?: string;
  location?: string;
  working_hours?: string;
  owner?: unknown;
};

const CreateStoreSteps = () => {
  const [step, setStep] = useState(1);
  const [storeData, setStoreData] = useState<Step2Payload>({
    categories: [],
    event_planning_categories: [],
    rent_hire_categories: [],
    name: "",
    phone_number: "",
    whats_app: "",
    image: null, // Changed from empty string to null
    overview: "",
    location: "",
    working_hours: "",
    owner: null,
  });

  const handleNext = (newData: Partial<StoreData>) => {
    setStoreData((prev) => ({ ...prev, ...newData }));
    setStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <div className="p-6">
      {step === 1 && (
        <Step1Categories
          selectedCategories={storeData.categories}
          onNext={(data: { categories: string[] }) =>
            handleNext({ categories: data.categories })
          }
        />
      )}
      {step === 2 && (
        <Step2SubCategories
          selectedCategories={storeData.categories} // Pass string[]
          selectedEventCategories={storeData.event_planning_categories} // Pass string[]
          selectedRentHireCategories={storeData.rent_hire_categories} // Pass string[]
          onPrevious={handlePrevious}
          onNext={(data: {
            event_planning_categories: string[];
            rent_hire_categories: string[];
          }) =>
            handleNext({
              event_planning_categories: data.event_planning_categories,
              rent_hire_categories: data.rent_hire_categories,
            })
          }
        />
      )}
      {step === 3 && (
        <Step3StoreDetails storeData={storeData} onPrevious={handlePrevious} />
      )}
    </div>
  );
};
