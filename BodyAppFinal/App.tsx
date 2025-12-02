import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  LogBox,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {CameraScanner} from './src/components/CameraScanner';
import axios from 'axios';

// Disable all warnings and yellow boxes in dev mode
LogBox.ignoreAllLogs(true);

// STRICT 2-COLOR PALETTE
const COLORS = {
  green: '#2E7D32',      // Pine tree dark green
  black: '#000000',      // Pure black
  white: '#FFFFFF',      // For text on green
  greenLight: '#4CAF50', // For logo (visible on black)
};

type Step = 'welcome' | 'gender' | 'height' | 'age' | 'camera-front' | 'camera-side' | 'analyzing' | 'profile' | 'results';

interface UserData {
  gender: string;
  height: string;
  age: string;
  name: string;
}

interface PoseData {
  front: any[] | null;
  side: any[] | null;
}

function App(): React.JSX.Element {
  const [step, setStep] = useState<Step>('welcome');
  const [userData, setUserData] = useState<UserData>({
    gender: '',
    height: '',
    age: '',
    name: '',
  });
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [poseData, setPoseData] = useState<PoseData>({
    front: null,
    side: null,
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <View style={styles.content}>
          <Text style={styles.logo}>You Day</Text>
          <Text style={styles.tagline}>Your daily transformation</Text>
          
          <View style={styles.features}>
            <View style={styles.feature}>
              <Icon name="lightning-bolt" size={24} color={COLORS.green} />
              <Text style={styles.featureText}>Quick 2-pose scan</Text>
            </View>
            <View style={styles.feature}>
              <Icon name="chart-line" size={24} color={COLORS.green} />
              <Text style={styles.featureText}>Instant insights</Text>
            </View>
            <View style={styles.feature}>
              <Icon name="trending-up" size={24} color={COLORS.green} />
              <Text style={styles.featureText}>Track progress</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setStep('gender')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'gender') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Select Gender</Text>
          <Text style={styles.subtitle}>For accurate analysis</Text>
          
          <TouchableOpacity
            style={[styles.genderOption, userData.gender === 'male' && styles.selectedOption]}
            onPress={() => setUserData({...userData, gender: 'male'})}>
            <Icon 
              name="human-male" 
              size={40} 
              color={userData.gender === 'male' ? COLORS.white : COLORS.green} 
            />
            <Text style={[styles.genderText, userData.gender === 'male' && styles.selectedText]}>
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.genderOption, userData.gender === 'female' && styles.selectedOption]}
            onPress={() => setUserData({...userData, gender: 'female'})}>
            <Icon 
              name="human-female" 
              size={40} 
              color={userData.gender === 'female' ? COLORS.white : COLORS.green} 
            />
            <Text style={[styles.genderText, userData.gender === 'female' && styles.selectedText]}>
              Female
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.genderOption, userData.gender === 'non-binary' && styles.selectedOption]}
            onPress={() => setUserData({...userData, gender: 'non-binary'})}>
            <Icon 
              name="human" 
              size={40} 
              color={userData.gender === 'non-binary' ? COLORS.white : COLORS.green} 
            />
            <Text style={[styles.genderText, userData.gender === 'non-binary' && styles.selectedText]}>
              Non-binary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !userData.gender && styles.buttonDisabled]}
            disabled={!userData.gender}
            onPress={() => setStep('height')}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setUserData({...userData, gender: ''});
              setStep('welcome');
            }}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'height') {
    const isValidHeight = userData.height && (
      heightUnit === 'cm' 
        ? parseInt(userData.height) >= 100 && parseInt(userData.height) <= 250
        : parseFloat(userData.height) >= 3.0 && parseFloat(userData.height) <= 8.5
    );

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Your Height</Text>
          <Text style={styles.subtitle}>This helps personalize your analysis</Text>
          
          {/* Unit Toggle */}
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitButton, heightUnit === 'cm' && styles.unitButtonActive]}
              onPress={() => setHeightUnit('cm')}>
              <Text style={[styles.unitButtonText, heightUnit === 'cm' && styles.unitButtonTextActive]}>
                cm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, heightUnit === 'ft' && styles.unitButtonActive]}
              onPress={() => setHeightUnit('ft')}>
              <Text style={[styles.unitButtonText, heightUnit === 'ft' && styles.unitButtonTextActive]}>
                feet
              </Text>
            </TouchableOpacity>
          </View>

          {/* Single Height Input */}
          <View style={styles.heightInputContainer}>
            <TextInput
              style={styles.heightInput}
              placeholder={heightUnit === 'cm' ? '175' : '5.9'}
              placeholderTextColor={COLORS.green + '60'}
              keyboardType="numeric"
              value={userData.height}
              onChangeText={(text) => setUserData({...userData, height: text})}
              maxLength={heightUnit === 'cm' ? 3 : 4}
            />
            <Text style={styles.heightInputUnit}>{heightUnit}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, !isValidHeight && styles.buttonDisabled]}
            disabled={!isValidHeight}
            onPress={() => setStep('age')}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('gender')}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'age') {
    const isValidAge = userData.age && parseInt(userData.age) >= 13 && parseInt(userData.age) <= 99;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Your Age</Text>
          <Text style={styles.subtitle}>Helps us understand your fitness stage</Text>
          
          {/* Single Age Input with unit inside */}
          <View style={styles.ageInputContainer}>
            <TextInput
              style={styles.ageInput}
              placeholder="25"
              placeholderTextColor={COLORS.green + '60'}
              keyboardType="numeric"
              value={userData.age}
              onChangeText={(text) => setUserData({...userData, age: text})}
              maxLength={2}
            />
            <Text style={styles.ageInputUnit}>years</Text>
          </View>

          <View style={styles.ageInfo}>
            <Icon name="information-outline" size={20} color={COLORS.green} />
            <Text style={styles.ageInfoText}>
              Helps create your personalized training program
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, !isValidAge && styles.buttonDisabled]}
            disabled={!isValidAge}
            onPress={() => setStep('camera-front')}>
            <Text style={styles.buttonText}>Start Body Scan</Text>
            <Icon name="camera" size={20} color={COLORS.white} style={{marginLeft: 10}} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('height')}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'camera-front') {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <CameraScanner
          currentPose="front"
          onFrontPoseDetected={(landmarks) => {
            setPoseData({...poseData, front: landmarks});
            setStep('camera-side');
          }}
          onSidePoseDetected={() => {}}
        />
      </SafeAreaView>
    );
  }

  if (step === 'camera-side') {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <CameraScanner
          currentPose="side"
          onFrontPoseDetected={() => {}}
          onSidePoseDetected={(landmarks) => {
            setPoseData({...poseData, side: landmarks});
            setStep('analyzing');
          }}
        />
      </SafeAreaView>
    );
  }

  if (step === 'analyzing') {
    // Auto-analyze and move to profile
    useEffect(() => {
      const analyze = async () => {
        try {
          // For now, use mock analysis
          setTimeout(() => {
            setAnalysisResult({
              overall_score: 75,
              body_type: 'Above Average',
              strong_areas: [{name: 'Shoulders', score: 85}],
              growth_areas: [{name: 'Core', score: 65}],
            });
            setStep('profile');
          }, 2000);
        } catch (error) {
          console.error('Analysis error:', error);
          setStep('profile'); // Continue anyway
        }
      };
      analyze();
    }, []);

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.title}>Analyzing...</Text>
          <Text style={styles.subtitle}>Processing your body scan</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'profile') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Create Your Character</Text>
          <Text style={styles.subtitle}>This represents you in the game</Text>
          
          <View style={styles.characterPlaceholder}>
            <Icon name="account-circle" size={120} color={COLORS.green} />
            <Text style={styles.characterText}>Profile Picture</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={COLORS.green + '80'}
              value={userData.name}
              onChangeText={(text) => setUserData({...userData, name: text})}
              maxLength={20}
            />
          </View>

          <View style={styles.userDataSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gender:</Text>
              <Text style={styles.summaryValue}>{userData.gender}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Height:</Text>
              <Text style={styles.summaryValue}>{userData.height} cm</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Age:</Text>
              <Text style={styles.summaryValue}>{userData.age} years</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, !userData.name && styles.buttonDisabled]}
            disabled={!userData.name}
            onPress={() => setStep('results')}>
            <Text style={styles.buttonText}>Continue to Results</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'results') {
    const score = analysisResult?.overall_score || 75;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.characterHeader}>
            <Icon name="account-circle" size={60} color={COLORS.green} />
            <Text style={styles.characterName}>{userData.name}</Text>
          </View>
          
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreLabel}>Overall Score</Text>
          </View>

          <View style={styles.resultCard}>
            <Icon name="trophy" size={32} color={COLORS.green} />
            <Text style={styles.resultCardTitle}>{analysisResult?.body_type || 'Above Average'}</Text>
            <Text style={styles.resultCardText}>
              Good muscle development - you have a solid foundation to build on
            </Text>
          </View>

          <View style={styles.userDataSummary}>
            <Text style={styles.summaryTitle}>Your Profile</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Name:</Text>
              <Text style={styles.summaryValue}>{userData.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gender:</Text>
              <Text style={styles.summaryValue}>{userData.gender}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Height:</Text>
              <Text style={styles.summaryValue}>{userData.height} cm</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Age:</Text>
              <Text style={styles.summaryValue}>{userData.age} years</Text>
            </View>
          </View>

          <View style={styles.duolingoPreview}>
            <Icon name="star" size={32} color={COLORS.green} />
            <Text style={styles.comingSoonTitle}>Your Journey Begins</Text>
            <Text style={styles.comingSoonText}>
              🔥 Daily streak: 0 days{'\n'}
              📊 League: Bronze{'\n'}
              🎯 Next milestone: 5 workouts{'\n'}
              ⚡ XP: 0 / 100
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setStep('welcome');
              setUserData({gender: '', height: '', age: '', name: ''});
              setPoseData({front: null, side: null});
              setAnalysisResult(null);
            }}>
            <Text style={styles.buttonText}>Start Over</Text>
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
    backgroundColor: COLORS.black,
  },
  fullScreen: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  characterName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 15,
  },
  characterPlaceholder: {
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderRadius: 15,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  characterText: {
    fontSize: 16,
    color: COLORS.green,
    marginTop: 15,
  },
  duolingoPreview: {
    backgroundColor: COLORS.black,
    padding: 25,
    borderRadius: 15,
    width: '100%',
    marginTop: 20,
    borderWidth: 2,
    borderColor: COLORS.green,
    alignItems: 'center',
  },
  logo: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.greenLight,
    marginBottom: 10,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.green,
    marginBottom: 60,
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.green,
    marginBottom: 40,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 12,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.green,
  },
  selectedOption: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  genderText: {
    fontSize: 20,
    color: COLORS.green,
    fontWeight: '600',
    marginLeft: 15,
  },
  selectedText: {
    color: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.green,
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: COLORS.green,
  },
  backButtonText: {
    color: COLORS.green,
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  comingSoon: {
    backgroundColor: COLORS.black,
    padding: 25,
    borderRadius: 15,
    width: '100%',
    marginTop: 30,
    borderWidth: 2,
    borderColor: COLORS.green,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.green,
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderRadius: 15,
    padding: 20,
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 20,
    color: COLORS.green,
    marginLeft: 15,
    fontWeight: 'bold',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderRadius: 15,
    padding: 4,
    width: '100%',
    marginBottom: 30,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
  },
  unitButtonActive: {
    backgroundColor: COLORS.green,
  },
  unitButtonText: {
    fontSize: 18,
    color: COLORS.green,
    fontWeight: 'bold',
  },
  unitButtonTextActive: {
    color: COLORS.white,
  },
  heightInputContainer: {
    width: '100%',
    marginBottom: 40,
  },
  heightInput: {
    backgroundColor: COLORS.black,
    borderWidth: 3,
    borderColor: COLORS.green,
    borderRadius: 20,
    padding: 30,
    fontSize: 48,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  heightInputUnit: {
    position: 'absolute',
    right: 25,
    top: '50%',
    transform: [{translateY: -15}],
    fontSize: 24,
    color: COLORS.green,
    fontWeight: 'bold',
  },
  ageInputContainer: {
    width: '100%',
    marginBottom: 40,
  },
  ageInput: {
    backgroundColor: COLORS.black,
    borderWidth: 3,
    borderColor: COLORS.green,
    borderRadius: 20,
    padding: 30,
    fontSize: 48,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  ageInputUnit: {
    position: 'absolute',
    right: 25,
    top: '50%',
    transform: [{translateY: -15}],
    fontSize: 24,
    color: COLORS.green,
    fontWeight: 'bold',
  },
  ageInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  ageInfoText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    marginLeft: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraPlaceholder: {
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderRadius: 15,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    marginVertical: 30,
  },
  cameraPlaceholderText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 25,
    lineHeight: 24,
  },
  scanSteps: {
    width: '100%',
  },
  scanStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  scanStepText: {
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 15,
    fontWeight: '600',
  },
  scoreCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: COLORS.green,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.greenLight,
  },
  scoreLabel: {
    fontSize: 16,
    color: COLORS.green,
    marginTop: 5,
  },
  resultCard: {
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderRadius: 15,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.green,
    marginVertical: 15,
  },
  resultCardText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  userDataSummary: {
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.green,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.green + '30',
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.green,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default App;
