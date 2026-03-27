import { StyleSheet, Text, TextInput, View } from "react-native";

export interface InputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string | null;
}

export function Input(props: InputProps): React.ReactElement {
  const { value, onChangeText, placeholder, secureTextEntry, error } = props;

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={[styles.input, !!error && styles.inputError]}
        value={value}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#b91c1c",
  },
  errorText: {
    marginTop: 6,
    color: "#b91c1c",
  },
});

