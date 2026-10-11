import { useState } from "react";

export const useEventForm = () => {
  const [eventForm, setEventForm] = useState({
    title: "",
    event_type: "trek",
    adventure_activity_category: "",
    adventure_difficulty_level: "Easy",
    trek_difficulty_level: "Easy",
    peak_difficulty_level: "Easy",
    peak_group_type: "",
    age_requirement: 16,
    fitness_requirement: "",
    location: "",
    duration_days: 1,
    duration_nights: 0,
    short_description: "",
    itinerary: "",
    highlights: [],
    cover_image_url: "",
    poster_horizontal_1_url: "",
    poster_horizontal_2_url: "",
    poster_vertical_3_url: "",
    gallery_image_urls: [],
    promo_video_url: "",
    max_participants_allowed: 30,
    included_services: [],
    excluded_services: [],
    safety_guidelines_text: "",
    cancellation_policy_text: "",
    seo_tags: [],
    seo_title: "",
    seo_description: "",
    status: "published",
    state: "Launched Now!",
    label: "Trek",
  });

  const updateForm = (updates) => {
    setEventForm((prev) => ({ ...prev, ...updates }));
  };

  const addToArrayField = (field, value) => {
    if (value.trim()) {
      setEventForm((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    }
  };

  const removeFromArrayField = (field, index) => {
    setEventForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setEventForm({
      title: "",
      event_type: "trek",
      adventure_activity_category: "",
      adventure_difficulty_level: "Easy",
      trek_difficulty_level: "Easy",
      peak_difficulty_level: "Easy",
      peak_group_type: "",
      age_requirement: 16,
      fitness_requirement: "",
      location: "",
      duration_days: 1,
      duration_nights: 0,
      short_description: "",
      itinerary: "",
      highlights: [],
      cover_image_url: "",
      poster_horizontal_1_url: "",
      poster_horizontal_2_url: "",
      poster_vertical_3_url: "",
      gallery_image_urls: [],
      promo_video_url: "",
      max_participants_allowed: 30,
      included_services: [],
      excluded_services: [],
      safety_guidelines_text: "",
      cancellation_policy_text: "",
      seo_tags: [],
      seo_title: "",
      seo_description: "",
      status: "published",
      state: "Launched Now!",
      label: "Trek",
    });
  };

  return {
    eventForm,
    updateForm,
    addToArrayField,
    removeFromArrayField,
    resetForm,
    setEventForm,
  };
};
