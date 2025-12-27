import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { userService } from '@/services/api/user.service';
import { useMutation } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import { useAuthStore } from '@/stores/auth.store';
import {
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const HelpScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Contact form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('');

  // Contact mutation
  const contactMutation = useMutation({
    mutationFn: userService.sendContact,
    onSuccess: () => {
      showToast('success', 'Message sent successfully! We will get back to you soon.');
      setShowContactModal(false);
      setMessage('');
    },
    onError: () => {
      showToast('error', 'Failed to send message. Please try again.');
    },
  });

  const handleSendMessage = () => {
    if (!name || !email || !message) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    contactMutation.mutate({
      name,
      email,
      phone,
      message,
    });
  };

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'What is included in my membership?',
      answer:
        'Your Membership Auto membership includes unlimited oil changes, tire rotations, multi-point inspections, fluid top-offs, and discounts on additional services. Premium members also get complimentary roadside assistance and priority scheduling.',
    },
    {
      id: '2',
      question: 'How do I schedule an appointment?',
      answer:
        'You can schedule an appointment through the app by tapping "Book Appointment" on the home screen, selecting your vehicle, choosing a service location, picking a date and time, and confirming your booking.',
    },
    {
      id: '3',
      question: 'Can I cancel or reschedule my appointment?',
      answer:
        'Yes! You can cancel or reschedule your appointment up to 4 hours before the scheduled time through the Appointments section in the app. Please note that late cancellations may be subject to a fee.',
    },
    {
      id: '4',
      question: 'What if my vehicle needs additional repairs?',
      answer:
        'If our technicians identify additional repairs needed during your service, they will contact you with a detailed explanation and estimate before performing any work. You always have the final say on what repairs are completed.',
    },
    {
      id: '5',
      question: 'How does the referral program work?',
      answer:
        'Share your unique referral code with friends and family. When they sign up for a membership using your code, you both receive rewards! You get one free month of service, and they get 50% off their first month.',
    },
    {
      id: '6',
      question: 'What should I do if I have a problem with my service?',
      answer:
        'We stand behind our work with a 100% satisfaction guarantee. If you are not completely satisfied with your service, please contact us immediately through the app or call our customer service line. We will make it right.',
    },
    {
      id: '7',
      question: 'How do I update my payment method?',
      answer:
        'You can update your payment method in the Profile section under "Payment Methods". Your payment information is securely stored and encrypted for your protection.',
    },
    {
      id: '8',
      question: 'Can I use my membership at any location?',
      answer:
        'Yes! Your membership is valid at all Membership Auto service centers nationwide. Use the Store Locator to find a location near you.',
    },
  ];

  const contactOptions = [
    {
      id: 'phone',
      icon: Phone,
      title: 'Call Us',
      subtitle: '1-800-MEMBER-AUTO',
      action: () => Linking.openURL('tel:18006362372'),
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Email Us',
      subtitle: 'support@membershipauto.com',
      action: () => Linking.openURL('mailto:support@membershipauto.com'),
    },
    {
      id: 'message',
      icon: MessageCircle,
      title: 'Send Message',
      subtitle: 'Contact us through the app',
      action: () => setShowContactModal(true),
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">Help & Support</Text>
            <Text className="text-sm text-textSecondary">
              Get answers to your questions or contact us
            </Text>
          </View>

          {/* Quick Contact Options */}
          <Text className="text-lg font-semibold text-foreground mb-3">Contact Us</Text>
          <View className="space-y-3 mb-6">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <TouchableOpacity key={option.id} onPress={option.action} activeOpacity={0.7}>
                  <Card>
                    <View className="flex-row items-center">
                      <View className="bg-surface p-3 rounded-lg mr-3">
                        <Icon size={24} color="#cba86e" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {option.title}
                        </Text>
                        <Text className="text-sm text-textSecondary">{option.subtitle}</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Hours */}
          <Card className="mb-6 bg-gold/10 border-gold">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Customer Support Hours
            </Text>
            <Text className="text-sm text-textSecondary">Monday - Friday: 7:00 AM - 7:00 PM EST</Text>
            <Text className="text-sm text-textSecondary">Saturday: 8:00 AM - 5:00 PM EST</Text>
            <Text className="text-sm text-textSecondary">Sunday: Closed</Text>
          </Card>

          {/* FAQs */}
          <Text className="text-lg font-semibold text-foreground mb-3">
            Frequently Asked Questions
          </Text>
          <View className="space-y-2">
            {faqs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden">
                <TouchableOpacity
                  onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-base font-medium text-foreground">{faq.question}</Text>
                    </View>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp size={20} color="#cba86e" />
                    ) : (
                      <ChevronDown size={20} color="#cba86e" />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedFAQ === faq.id && (
                  <View className="mt-3 pt-3 border-t border-border">
                    <Text className="text-sm text-textSecondary leading-5">{faq.answer}</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Contact Form Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="px-4 pt-4" style={{ paddingTop: insets.top + 16 }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Send Message</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)} activeOpacity={0.7}>
                <Text className="text-base text-gold">Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-4 mb-6">
                {/* Name */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Name *</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholder="Your name"
                    placeholderTextColor="#707070"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Email */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Email *</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
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
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Phone (Optional)
                  </Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholder="Your phone number"
                    placeholderTextColor="#707070"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* Message */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Message *</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
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
                  className="flex-row items-center justify-center rounded-xl bg-gold py-4"
                  activeOpacity={0.7}
                >
                  {contactMutation.isPending ? (
                    <ActivityIndicator size="small" color="#0d0d0d" />
                  ) : (
                    <>
                      <Send size={20} color="#0d0d0d" />
                      <Text className="ml-2 text-base font-semibold text-background">Send Message</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text className="text-xs text-textMuted text-center">
                  We typically respond within 24 hours
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HelpScreen;
