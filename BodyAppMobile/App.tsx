import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {analyzePhysique} from './src/services/api';
import type {UserData, PhysiqueScore, DietPlan, WorkoutRoutine} from './src/types';

function App(): React.JSX.Element {
  const [step, setStep] = useState<'welcome' | 'gender' | 'analyzing' | 'results'>('welcome');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    setStep('analyzing');
    try {
      // Mock pose data
      const mockPose = Array(33).fill(0).map(() => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random() * 0.1,
        visibility: 0.95,
      }));

      const data = await analyzePhysique({
        frontPose: mockPose,
        sidePose: mockPose,
        gender,
        height: height ? parseFloat(height) : undefined,
      });
      
      setResult(data);
      setStep('results');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setStep('gender');
    }
  };

  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.logo}>💪</Text>
          <Text style={styles.title}>BodyApp</Text>
          <Text style={styles.subtitle}>AI-Powered Body Analysis</Text>
          <TouchableOpacity style={styles.button} onPress={() => setStep('gender')}>
            <Text style={styles.buttonText}>Get Started →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'gender') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Select Gender</Text>
          
          <TouchableOpacity
            style={[styles.option, gender === 'male' && styles.optionSelected]}
            onPress={() => setGender('male')}>
            <Text style={styles.optionText}>👨 Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, gender === 'female' && styles.optionSelected]}
            onPress={() => setGender('female')}>
            <Text style={styles.optionText}>👩 Female</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Height (cm, optional):</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="e.g. 175"
          />

          <TouchableOpacity
            style={[styles.button, !gender && styles.buttonDisabled]}
            disabled={!gender}
            onPress={handleAnalyze}>
            <Text style={styles.buttonText}>Analyze →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'analyzing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.title}>Analyzing...</Text>
          <Text style={styles.subtitle}>Processing your data</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'results' && result) {
    const {physique, dietPlan, workoutRoutine} = result;
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsContent}>
          <Text style={styles.title}>Your Results</Text>
          
          <View style={styles.scoreCard}>
            <Text style={styles.scoreNumber}>{physique.overall_score}</Text>
            <Text style={styles.scoreLabel}>/100</Text>
          </View>

          <Text style={styles.bodyType}>{physique.body_type}</Text>
          <Text style={styles.description}>{physique.body_description}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💪 Top Strengths</Text>
            {physique.strong_areas.map((area: any, i: number) => (
              <Text key={i} style={styles.areaText}>• {area.name}: {area.score}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ Diet Plan</Text>
            <Text style={styles.areaText}>Calories: {dietPlan.calories}</Text>
            <Text style={styles.areaText}>Protein: {dietPlan.protein}g</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => {
            setStep('welcome');
            setGender('');
            setHeight('');
            setResult(null);
          }}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultsContent: {
    padding: 20,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
    marginBottom: 40,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  option: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#4CAF50',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scoreLabel: {
    fontSize: 24,
    color: '#999',
  },
  bodyType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  areaText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
});

export default App;
