import { useState } from "react";

export const useScheduleForm = () => {
  const [scheduleForm, setScheduleForm] = useState({
    event_id: "",
    status: "active",
    schedule_data: {
      basic_details: {
        timezone: "Asia/Kolkata",
        start_datetime: "",
        end_datetime: "",
        duration_days: 1,
      },
      capacity_pricing: {
        currency: "INR",
        base_price_per_person: 5000,
        max_participants: 50,
        seats_available: 50,
      },
      pickups: [],
      extra_options: {
        inclusions: [],
        exclusions: [],
        custom_notes: "",
      },
    },
  });

  const updateScheduleBasicDetails = (field, value) => {
    setScheduleForm((prev) => ({
      ...prev,
      schedule_data: {
        ...prev.schedule_data,
        basic_details: {
          ...prev.schedule_data.basic_details,
          [field]: value,
        },
      },
    }));
  };

  const updateScheduleCapacityPricing = (field, value) => {
    setScheduleForm((prev) => ({
      ...prev,
      schedule_data: {
        ...prev.schedule_data,
        capacity_pricing: {
          ...prev.schedule_data.capacity_pricing,
          [field]: value,
        },
      },
    }));
  };

  const addPickup = (pickup) => {
    setScheduleForm((prev) => ({
      ...prev,
      schedule_data: {
        ...prev.schedule_data,
        pickups: [...prev.schedule_data.pickups, pickup],
      },
    }));
  };

  const removePickup = (index) => {
    setScheduleForm((prev) => ({
      ...prev,
      schedule_data: {
        ...prev.schedule_data,
        pickups: prev.schedule_data.pickups.filter((_, i) => i !== index),
      },
    }));
  };

  const addInclusion = (item) => {
    if (item.trim()) {
      setScheduleForm((prev) => ({
        ...prev,
        schedule_data: {
          ...prev.schedule_data,
          extra_options: {
            ...prev.schedule_data.extra_options,
            inclusions: [...prev.schedule_data.extra_options.inclusions, item],
          },
        },
      }));
    }
  };

  const removeInclusion = (index) => {
    setScheduleForm((prev) => ({
      ...prev,
      schedule_data: {
        ...prev.schedule_data,
        extra_options: {
          ...prev.schedule_data.extra_options,
          inclusions: prev.schedule_data.extra_options.inclusions.filter(
            (_, i) => i !== index,
          ),
        },
      },
    }));
  };

  const addExclusion = (item) => {
    if (item.trim()) {
      setScheduleForm((prev) => ({
        ...prev,
        schedule_data: {
          ...prev.schedule_data,
          extra_options: {
            ...prev.schedule_data.extra_options,
            exclusions: [...prev.schedule_data.extra_options.exclusions, item],
          },
        },
      }));
    }
  };

  const removeExclusion = (index) => {
    setScheduleForm((prev) => ({
      ...prev,
      schedule_data: {
        ...prev.schedule_data,
        extra_options: {
          ...prev.schedule_data.extra_options,
          exclusions: prev.schedule_data.extra_options.exclusions.filter(
            (_, i) => i !== index,
          ),
        },
      },
    }));
  };

  const updateCustomNotes = (notes) => {
    setScheduleForm((prev) => ({
      ...prev,
      schedule_data: {
        ...prev.schedule_data,
        extra_options: {
          ...prev.schedule_data.extra_options,
          custom_notes: notes,
        },
      },
    }));
  };

  const resetForm = () => {
    setScheduleForm({
      event_id: "",
      status: "active",
      schedule_data: {
        basic_details: {
          timezone: "Asia/Kolkata",
          start_datetime: "",
          end_datetime: "",
          duration_days: 1,
        },
        capacity_pricing: {
          currency: "INR",
          base_price_per_person: 5000,
          max_participants: 50,
          seats_available: 50,
        },
        pickups: [],
        extra_options: {
          inclusions: [],
          exclusions: [],
          custom_notes: "",
        },
      },
    });
  };

  return {
    scheduleForm,
    setScheduleForm,
    updateScheduleBasicDetails,
    updateScheduleCapacityPricing,
    addPickup,
    removePickup,
    addInclusion,
    removeInclusion,
    addExclusion,
    removeExclusion,
    updateCustomNotes,
    resetForm,
  };
};
