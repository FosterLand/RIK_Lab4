import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import questions from '../../data/questions';
import { saveResults } from '../../utils/saveResults';

export default function SurveyScreen() {
  const [answers, setAnswers] = useState({});
  const [snackbar, setSnackbar] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const savedAnswersRef = useRef({});
  const progressAnim = useRef(new Animated.Value(1)).current;

  const isFormEmpty = Object.keys(answers).length === 0 ||
    Object.values(answers).every((v) =>
      Array.isArray(v) ? v.length === 0 : !v || !v.trim()
    );

  const handleClear = () => {
    if (isFormEmpty) return;

    savedAnswersRef.current = answers;
    setSnackbar(true);
    setCountdown(5);
    progressAnim.setValue(1);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 5000,
      useNativeDriver: false,
    }).start();

    let remaining = 5;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
    }, 1000);

    timerRef.current = setTimeout(() => {
      clearInterval(countdownRef.current);
      setAnswers({});
      setSnackbar(false);
    }, 5000);
  };

  const handleUndo = () => {
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
    progressAnim.stopAnimation();
    setAnswers(savedAnswersRef.current);
    setSnackbar(false);
  };

  const handleTextChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const toggleOption = (id, option) => {
    setAnswers((prev) => {
      const current = prev[id] || [];
      if (current.includes(option)) {
        return { ...prev, [id]: current.filter((o) => o !== option) };
      }
      return { ...prev, [id]: [...current, option] };
    });
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => {
      const val = answers[q.id];
      if (q.type === 'text') return !val || !val.trim();
      return !val || val.length === 0;
    });

    if (unanswered.length > 0) {
      Alert.alert(
        'Увага',
        'Будь ласка, дайте відповідь на всі запитання перед відправкою.'
      );
      return;
    }

    const results = questions.map((q) => ({
      question: q.text,
      type: q.type,
      answer: answers[q.id],
    }));

    await saveResults(results);
    Alert.alert('Дякуємо!', 'Ваші відповіді збережено у файл survey_results.txt');
    setAnswers({});
  };

  const renderQuestion = (q) => {
    if (q.type === 'text') {
      return (
        <TextInput
          style={styles.input}
          placeholder="Ваша відповідь..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          value={answers[q.id] || ''}
          onChangeText={(val) => handleTextChange(q.id, val)}
        />
      );
    }

    const selected = answers[q.id] || [];
    const isCheckbox = q.type === 'checkbox';

    return (
      <View>
        {q.options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={styles.optionRow}
              onPress={() => toggleOption(q.id, option)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  isCheckbox ? styles.checkbox : styles.radioOuter,
                  isSelected && styles.optionSelected,
                ]}
              >
                {isSelected && (
                  isCheckbox ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : (
                    <View style={styles.radioInner} />
                  )
                )}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Опитування</Text>
      <Text style={styles.subtitle}>Розкажіть про себе</Text>

      {questions.map((q) => (
        <View key={q.id} style={styles.card}>
          <Text style={styles.label}>
            {q.id}. {q.text}
          </Text>
          {(q.type === 'checkbox' || q.type === 'multiselect') && (
            <Text style={styles.hint}>Можна обрати декілька варіантів</Text>
          )}
          {renderQuestion(q)}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.clearButton, isFormEmpty && styles.clearButtonDisabled]}
        onPress={handleClear}
        activeOpacity={isFormEmpty ? 1 : 0.7}
      >
        <Text style={styles.buttonText}>Очистити форму</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Надіслати</Text>
      </TouchableOpacity>

      {snackbar && (
        <View style={styles.snackbar}>
          <View style={styles.snackbarRow}>
            <Text style={styles.snackbarText}>Форму буде очищено ({countdown}с)</Text>
            <TouchableOpacity onPress={handleUndo}>
              <Text style={styles.snackbarUndo}>Скасувати</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#aaaaaa',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#ffffff',
    minHeight: 70,
    textAlignVertical: 'top',
    marginTop: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#666666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionSelected: {
    borderColor: '#27ae60',
    backgroundColor: '#333333',
  },
  checkmark: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: 'bold',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#27ae60',
  },
  optionText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#e67e22',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  clearButtonDisabled: {
    backgroundColor: '#f1a9a0',
  },
  button: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#333333',
    borderRadius: 10,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  snackbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  snackbarText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  snackbarUndo: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#555555',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e74c3c',
    borderRadius: 2,
  },
});