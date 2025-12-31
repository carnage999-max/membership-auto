import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'expo-router';
import {
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Book,
  Headphones,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'What is included in my membership?',
      category: 'Membership',
      answer:
        'Your Membership Auto membership includes unlimited oil changes, tire rotations, multi-point inspections, fluid top-offs, and discounts on additional services. Premium members also get complimentary roadside assistance and priority scheduling.',
    },
    {
      id: '2',
      question: 'How do I schedule an appointment?',
      category: 'Appointments',
      answer:
        'You can schedule an appointment through the app by tapping "Book Appointment" on the home screen, selecting your vehicle, choosing a service location, picking a date and time, and confirming your booking.',
    },
    {
      id: '3',
      question: 'Can I cancel or reschedule my appointment?',
      category: 'Appointments',
      answer:
        'Yes! You can cancel or reschedule your appointment up to 4 hours before the scheduled time through the Appointments section in the app. Please note that late cancellations may be subject to a fee.',
    },
    {
      id: '4',
      question: 'What if my vehicle needs additional repairs?',
      category: 'Services',
      answer:
        'If our technicians identify additional repairs needed during your service, they will contact you with a detailed explanation and estimate before performing any work. You always have the final say on what repairs are completed.',
    },
    {
      id: '5',
      question: 'How does the referral program work?',
      category: 'Rewards',
      answer:
        'Share your unique referral code with friends and family. When they sign up for a membership using your code, you both receive rewards! You get one free month of service, and they get 50% off their first month.',
    },
    {
      id: '6',
      question: 'What should I do if I have a problem with my service?',
      category: 'Support',
      answer:
        'We stand behind our work with a 100% satisfaction guarantee. If you are not completely satisfied with your service, please contact us immediately through the app or call our customer service line. We will make it right.',
    },
    {
      id: '7',
      question: 'How do I update my payment method?',
      category: 'Account',
      answer:
        'You can update your payment method in the Profile section under "Payment Methods". Your payment information is securely stored and encrypted for your protection.',
    },
    {
      id: '8',
      question: 'Can I use my membership at any location?',
      category: 'Membership',
      answer:
        'Yes! Your membership is valid at all Membership Auto service centers nationwide. Use the Store Locator to find a location near you.',
    },
  ];

  const quickActions = [
    {
      id: 'contact',
      icon: MessageCircle,
      title: 'Contact Us',
      subtitle: 'Send us a message',
      color: '#4caf50',
      action: () => router.push('/(authenticated)/contact'),
    },
    {
      id: 'phone',
      icon: Phone,
      title: 'Call Support',
      subtitle: '1-800-MEMBER-AUTO',
      color: '#2196f3',
      action: () => Linking.openURL('tel:18006362372'),
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Email Us',
      subtitle: 'support@membershipauto.com',
      color: '#ff9800',
      action: () => Linking.openURL('mailto:support@membershipauto.com'),
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">Help & Support</Text>
            <Text className="mt-1 text-sm text-textSecondary">
              Get answers to your questions or reach out to us
            </Text>
          </View>

          {/* Quick Actions */}
          <View className="mb-6 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  onPress={action.action}
                  activeOpacity={0.7}
                >
                  <Card className="p-4">
                    <View className="flex-row items-center">
                      <View
                        className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${action.color}20` }}
                      >
                        <Icon size={24} color={action.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {action.title}
                        </Text>
                        <Text className="mt-0.5 text-sm text-textSecondary">{action.subtitle}</Text>
                      </View>
                      <ChevronRight size={20} color="#707070" />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Support Hours */}
          <Card className="mb-6 border-2 border-gold bg-gold/10 p-4">
            <View className="mb-3 flex-row items-center">
              <Headphones size={20} color="#cba86e" />
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

          {/* FAQs Section */}
          <View className="mb-4 flex-row items-center">
            <Book size={20} color="#cba86e" />
            <Text className="ml-2 text-lg font-semibold text-foreground">
              Frequently Asked Questions
            </Text>
          </View>

          <View className="gap-3">
            {faqs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden p-4">
                <TouchableOpacity
                  onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <View className="mb-1 flex-row items-center">
                        <View className="mr-2 rounded-full bg-gold/20 px-2 py-0.5">
                          <Text className="text-xs font-medium text-gold">{faq.category}</Text>
                        </View>
                      </View>
                      <Text className="text-base font-semibold text-foreground leading-5">
                        {faq.question}
                      </Text>
                    </View>
                    <View className="mt-1">
                      {expandedFAQ === faq.id ? (
                        <ChevronDown size={20} color="#cba86e" />
                      ) : (
                        <ChevronRight size={20} color="#707070" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {expandedFAQ === faq.id && (
                  <View className="mt-3 pt-3 border-t border-border">
                    <Text className="text-sm leading-6 text-textSecondary">{faq.answer}</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>

          {/* Still Need Help */}
          <Card className="mt-6 p-4 bg-surface">
            <View className="items-center">
              <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                <HelpCircle size={32} color="#cba86e" />
              </View>
              <Text className="mb-2 text-center text-lg font-semibold text-foreground">
                Still Need Help?
              </Text>
              <Text className="mb-4 text-center text-sm text-textSecondary">
                Can't find what you're looking for? Our support team is ready to assist you.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(authenticated)/contact')}
                className="w-full rounded-xl bg-gold py-3"
                activeOpacity={0.7}
              >
                <Text className="text-center text-base font-semibold text-background">
                  Contact Support
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpScreen;
