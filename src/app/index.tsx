
import emailjs from '@emailjs/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const categories = [
  'Account Problem',
  'Technical Issue',
  'Payment Concern',
  'Other',
];

// Set these values in your .env file.
const CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const EMAIL_SERVICE_ID =
  process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
const EMAIL_TEMPLATE_ID =
  process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAIL_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

type Status = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

export default function Index() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [message, setMessage] = useState('');
  const [image, setImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function pickImage() {
    setStatus(null);

    try {
      if (Platform.OS !== 'web') {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setStatus({
            type: 'error',
            message: 'Please allow photo library access.',
          });
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0]);
        setStatus({
          type: 'info',
          message: 'Screenshot selected. You can submit your request.',
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setStatus({
        type: 'error',
        message: 'Could not open the photo library. Please try again.',
      });
    }
  }

  async function submitForm() {
    if (loading) return;

    setStatus(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please complete your name, email, and message.',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    if (!image) {
      setStatus({
        type: 'error',
        message: 'Please select a screenshot first.',
      });
      return;
    }

    if (
      !CLOUD_NAME ||
      !UPLOAD_PRESET ||
      !EMAIL_SERVICE_ID ||
      !EMAIL_TEMPLATE_ID ||
      !EMAIL_PUBLIC_KEY
    ) {
      setStatus({
        type: 'error',
        message:
          'Missing configuration. Check the five EXPO_PUBLIC_ variables in your .env file.',
      });
      return;
    }

    setLoading(true);
    setStatus({
      type: 'info',
      message: 'Uploading screenshot and sending your request...',
    });

    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const fileResponse = await fetch(image.uri);
        const fileBlob = await fileResponse.blob();

        formData.append(
          'file',
          fileBlob,
          image.fileName || 'support-screenshot.jpg'
        );
      } else {
        formData.append(
          'file',
          {
            uri: image.uri,
            type: image.mimeType || 'image/jpeg',
            name: image.fileName || 'support-screenshot.jpg',
          } as any
        );
      }

      formData.append('upload_preset', UPLOAD_PRESET);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.secure_url) {
        throw new Error(
          uploadResult.error?.message ||
            'Cloudinary upload failed. Check your cloud name and unsigned upload preset.'
        );
      }

      const imageUrl: string = uploadResult.secure_url;

      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        {
          name: name.trim(),
          reply_to: email.trim(),
          issue_category: category,
          message: message.trim(),
          image_url: imageUrl,
        },
        {
          publicKey: EMAIL_PUBLIC_KEY,
        }
      );

      setStatus({
        type: 'success',
        message:
          'Request sent successfully! Your screenshot was uploaded and your email was sent.',
      });

      setName('');
      setEmail('');
      setCategory(categories[0]);
      setMessage('');
      setImage(null);
    } catch (error) {
      console.error('Support form submission error:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';

      setStatus({
        type: 'error',
        message: `Submission failed: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Customer Support</Text>
      <Text style={styles.subtitle}>
        Tell us about your concern.
      </Text>

      {status && (
        <View
          style={[
            styles.statusBox,
            status.type === 'success'
              ? styles.statusSuccess
              : status.type === 'error'
                ? styles.statusError
                : styles.statusInfo,
          ]}
        >
          <Text style={styles.statusText}>{status.message}</Text>
        </View>
      )}

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      <Text style={styles.label}>Issue Category</Text>
      <View style={styles.categories}>
        {categories.map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategory(item)}
            disabled={loading}
            style={[
              styles.category,
              category === item && styles.categorySelected,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && styles.categoryTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.message]}
        placeholder="Describe your problem..."
        value={message}
        onChangeText={setMessage}
        multiline
        textAlignVertical="top"
        editable={!loading}
      />

      <Pressable
        style={[
          styles.uploadButton,
          loading && styles.disabledButton,
        ]}
        onPress={pickImage}
        disabled={loading}
      >
        <Text style={styles.uploadButtonText}>
          {image ? 'Change Screenshot' : 'Select Screenshot'}
        </Text>
      </Pressable>

      {image && (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: image.uri }}
            style={styles.preview}
            resizeMode="contain"
          />
          <Text style={styles.previewLabel}>
            Selected Screenshot
          </Text>
          <Pressable
            onPress={() => setImage(null)}
            disabled={loading}
          >
            <Text style={styles.removeText}>
              Remove Screenshot
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable
        style={[
          styles.submitButton,
          loading && styles.disabledButton,
        ]}
        onPress={submitForm}
        disabled={loading}
        accessibilityRole="button"
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.buttonText}>Submitting...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Submit Request</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 22,
    paddingTop: 55,
    paddingBottom: 40,
    backgroundColor: '#F1F5F9',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
  },
  message: {
    height: 110,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  category: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    padding: 10,
  },
  categorySelected: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  categoryText: {
    color: '#334155',
    fontSize: 12,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  uploadButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  uploadButtonText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  previewContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  previewLabel: {
    color: '#475569',
    marginTop: 8,
  },
  removeText: {
    color: '#DC2626',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 22,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    minHeight: 54,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  statusError: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  statusInfo: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  statusText: {
    color: '#1E293B',
    fontSize: 14,
  },
});
