import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ColorPicker } from "@/components/ColorPicker";
import { FrequencyPicker } from "@/components/FrequencyPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useHabitForm } from "@/hooks/useHabitForm";

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
    <View style={styles.container}>
      <Text style={styles.title}>New habit</Text>

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
        onPress={handleSubmit}
        title="Create habit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
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

