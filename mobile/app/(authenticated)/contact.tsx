import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { userService } from '@/services/api/user.service';
import { useMutation } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import { useAuthStore } from '@/stores/auth.store';
import {
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ContactScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  // Contact form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Contact mutation
  const contactMutation = useMutation({
    mutationFn: userService.sendContact,
    onSuccess: () => {
      showToast('success', 'Message sent successfully! We will get back to you soon.');
      setSubject('');
      setMessage('');
    },
    onError: () => {
      showToast('error', 'Failed to send message. Please try again.');
    },
  });

  const handleSendMessage = () => {
    if (!name || !email || !subject || !message) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    contactMutation.mutate({
      name,
      email,
      phone,
      subject,
      message,
    });
  };

  const contactMethods = [
    {
      id: 'phone',
      icon: Phone,
      title: 'Call Us',
      value: '1-800-MEMBER-AUTO',
      link: 'tel:18006362372',
      color: '#4caf50',
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Email Us',
      value: 'support@membershipauto.com',
      link: 'mailto:support@membershipauto.com',
      color: '#2196f3',
    },
    {
      id: 'address',
      icon: MapPin,
      title: 'Visit Us',
      value: '123 Auto Lane, Service City, SC 12345',
      link: 'https://maps.google.com/?q=123+Auto+Lane,Service+City,SC',
      color: '#f44336',
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">Contact Us</Text>
            <Text className="mt-1 text-sm text-textSecondary">
              We're here to help! Reach out to us anytime.
            </Text>
          </View>

          {/* Contact Methods */}
          <View className="mb-6 gap-3">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => Linking.openURL(method.link)}
                  activeOpacity={0.7}
                >
                  <Card className="p-4">
                    <View className="flex-row items-center">
                      <View
                        className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${method.color}20` }}
                      >
                        <Icon size={24} color={method.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-textMuted">{method.title}</Text>
                        <Text className="mt-1 text-base font-semibold text-foreground">
                          {method.value}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Business Hours */}
          <Card className="mb-6 border-2 border-gold bg-gold/10 p-4">
            <View className="mb-3 flex-row items-center">
              <Clock size={20} color="#cba86e" />
              <Text className="ml-2 text-base font-semibold text-foreground">
                Customer Support Hours
              </Text>
            </View>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-textSecondary">Monday - Friday</Text>
                <Text className="text-sm font-medium text-foreground">7:00 AM - 7:00 PM EST</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-textSecondary">Saturday</Text>
                <Text className="text-sm font-medium text-foreground">8:00 AM - 5:00 PM EST</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-textSecondary">Sunday</Text>
                <Text className="text-sm font-medium text-error">Closed</Text>
              </View>
            </View>
          </Card>

          {/* Contact Form */}
          <Card className="mb-6 p-4">
            <View className="mb-4 flex-row items-center">
              <MessageCircle size={20} color="#cba86e" />
              <Text className="ml-2 text-lg font-semibold text-foreground">Send a Message</Text>
            </View>

            <View className="gap-4">
              {/* Name */}
              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">Name *</Text>
                <TextInput
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                  placeholder="Your name"
                  placeholderTextColor="#707070"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email */}
              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">Email *</Text>
                <TextInput
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                  placeholder="your@email.com"
                  placeholderTextColor="#707070"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Phone */}
              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">
                  Phone (Optional)
                </Text>
                <TextInput
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                  placeholder="Your phone number"
                  placeholderTextColor="#707070"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Subject */}
              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">Subject *</Text>
                <TextInput
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                  placeholder="What is this regarding?"
                  placeholderTextColor="#707070"
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              {/* Message */}
              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">Message *</Text>
                <TextInput
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                  placeholder="How can we help you?"
                  placeholderTextColor="#707070"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={contactMutation.isPending}
                className="mt-2 flex-row items-center justify-center rounded-xl bg-gold py-4"
                activeOpacity={0.7}
              >
                {contactMutation.isPending ? (
                  <ActivityIndicator size="small" color="#0d0d0d" />
                ) : (
                  <>
                    <Send size={20} color="#0d0d0d" />
                    <Text className="ml-2 text-base font-semibold text-background">
                      Send Message
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <Text className="text-center text-xs text-textMuted">
                We typically respond within 24 hours during business hours
              </Text>
            </View>
          </Card>

          {/* Additional Info */}
          <Card className="p-4">
            <Text className="mb-3 text-base font-semibold text-foreground">Need Immediate Help?</Text>
            <Text className="mb-3 text-sm leading-5 text-textSecondary">
              For urgent matters or roadside assistance, please call us directly at 1-800-MEMBER-AUTO. Our team is available during business hours to assist you.
            </Text>
            <Text className="text-sm leading-5 text-textSecondary">
              For general inquiries, you can also reach us via email or through the contact form above. We aim to respond to all messages within 24 hours.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default ContactScreen;
