import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ColorPicker } from "@/components/ColorPicker";
import { FrequencyPicker } from "@/components/FrequencyPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useHabitForm } from "@/hooks/useHabitForm";
import { getErrorMessage } from "@/utils/errorMessage";

export default function NewHabitScreen(): React.ReactElement {
  const { values, errors, isSubmitting, setName, setColor, setFrequencyConfig, createHabit } =
    useHabitForm();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    setSubmitError(null);
    try {
      await createHabit();
      router.replace("/");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create habit.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      style={styles.scroll}
    >
      <View style={styles.header}>
        <Text style={styles.title}>New habit</Text>
        <Button onPress={() => router.replace("/")} title="Cancel" />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <Input
          error={errors.name}
          onChangeText={setName}
          placeholder="Drink water"
          value={values.name}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Color</Text>
        <ColorPicker onColorSelect={setColor} selectedColor={values.color} />
        {errors.color ? <Text style={styles.errorText}>{errors.color}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Frequency</Text>
        <FrequencyPicker
          frequencyType="weekly"
          onFrequencyChange={setFrequencyConfig}
          selectedFrequency={values.frequency_config}
        />
        {errors.frequency ? <Text style={styles.errorText}>{errors.frequency}</Text> : null}
      </View>

      {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <Button
        disabled={isSubmitting}
        isLoading={isSubmitting}
        onPress={() => void handleSubmit()}
        title="Create habit"
      />
    </ScrollView>
  );
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    flexShrink: 1,
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
});

