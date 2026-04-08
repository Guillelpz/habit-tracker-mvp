import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { ColorPicker } from "@/components/ColorPicker";
import { FrequencyPicker } from "@/components/FrequencyPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useHabit } from "@/hooks/useHabit";
import { useHabitForm } from "@/hooks/useHabitForm";
import { useHabits } from "@/hooks/useHabits";
import type { FrequencyConfig, Habit } from "@/lib/types";
import { normalizeFrequencyConfigForPersistence } from "@/utils/frequency";
import { getErrorMessage } from "@/utils/errorMessage";

interface EditHabitFormProps {
  habit: Habit;
}

function EditHabitForm(props: EditHabitFormProps): React.ReactElement {
  const { habit } = props;
  const { updateHabit } = useHabits();
  const { values, errors, setName, setColor, setFrequencyConfig, validate } = useHabitForm(
    {
      name: habit.name,
      color: habit.color,
      frequency_config: habit.frequency_config,
    },
    { frequencyType: habit.frequency_type },
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSave = async (): Promise<void> => {
    setSubmitError(null);

    const isValid = validate();
    if (!isValid) {
      return;
    }

    const frequencyConfig = values.frequency_config as FrequencyConfig | null;
    if (!frequencyConfig) {
      setSubmitError("Frequency is required.");
      return;
    }

    setIsSaving(true);
    try {
      await updateHabit(habit.id, {
        name: values.name,
        color: (values.color ?? "").trim(),
        frequency_config: normalizeFrequencyConfigForPersistence(frequencyConfig, habit.frequency_type),
      });

      router.replace(`/habit/${habit.id}`);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to save changes."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      style={styles.scroll}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit habit</Text>
        <Button onPress={() => router.back()} title="Cancel" />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <Input error={errors.name} onChangeText={setName} placeholder="Drink water" value={values.name} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Color</Text>
        <ColorPicker onColorSelect={setColor} selectedColor={values.color} />
        {errors.color ? <Text style={styles.errorText}>{errors.color}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Frequency</Text>
        <FrequencyPicker
          frequencyType={habit.frequency_type}
          onFrequencyChange={setFrequencyConfig}
          selectedFrequency={values.frequency_config}
        />
        {errors.frequency ? <Text style={styles.errorText}>{errors.frequency}</Text> : null}
        {errors.frequency_type ? <Text style={styles.errorText}>{errors.frequency_type}</Text> : null}
      </View>

      {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <Button
        disabled={isSaving}
        isLoading={isSaving}
        onPress={() => void handleSave()}
        title="Save changes"
      />
    </ScrollView>
  );
}

export default function EditHabitScreen(): React.ReactElement {
  const params = useLocalSearchParams<{ id?: string }>();
  const habitId = typeof params.id === "string" ? params.id : null;
  const { habit, isLoading, error, refetch } = useHabit(habitId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Edit habit</Text>
        <Text style={styles.message}>Unable to load habit.</Text>
        <Text style={styles.detail}>{error.message}</Text>
        <Button onPress={() => void refetch()} title="Retry" />
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Habit not found</Text>
        <Text style={styles.message}>This habit may have been removed or archived.</Text>
        <Button onPress={() => router.back()} title="Go back" />
      </View>
    );
  }

  // Key forces the form hook to re-initialize if habit changes.
  return <EditHabitForm habit={habit} key={habit.id} />;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  errorText: {
    color: "#b91c1c",
  },
  message: {
    color: "#6b7280",
    textAlign: "center",
  },
  detail: {
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
});

