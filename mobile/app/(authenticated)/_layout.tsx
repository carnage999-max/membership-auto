import { Tabs, useRouter } from 'expo-router';
import { Car, Home, Calendar, Tag, User, ChevronLeft } from 'lucide-react-native';
import { Platform, Image, TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const logo = require('@assets/logo.png');

// Custom header with logo and title side by side
const HeaderWithLogo = ({ title }: { title: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
    <Image source={logo} style={{ width: 28, height: 28 }} resizeMode="contain" />
    <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700', marginLeft: 12 }}>
      {title}
    </Text>
  </View>
);

// Custom header with back button and title side by side
const HeaderWithBack = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ padding: 4 }}>
      <ChevronLeft size={28} color="#cba86e" />
    </TouchableOpacity>
    <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>
      {title}
    </Text>
  </View>
);

// Only for authenticated users
const AuthenticatedLayout = () => {
  // Setup push notifications
  usePushNotifications();
  const router = useRouter();

  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#cba86e',
        tabBarInactiveTintColor: '#707070',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2a2a2a',
          borderTopWidth: 1,
          height: (Platform.OS === 'ios' ? 65 : 60) + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: '#0d0d0d',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#2a2a2a',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        // Hide default title since we're using custom headerLeft
        headerTitle: '',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerLeft: () => <HeaderWithLogo title="Home" />,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
          headerLeft: () => <HeaderWithLogo title="My Vehicles" />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appts',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
          headerLeft: () => <HeaderWithLogo title="Appointments" />,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Offers',
          tabBarIcon: ({ color, size }) => <Tag color={color} size={size} />,
          headerLeft: () => <HeaderWithLogo title="Special Offers" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          headerLeft: () => <HeaderWithLogo title="My Account" />,
        }}
      />

      {/* Hide additional screens from tab bar - with back navigation */}
      <Tabs.Screen
        name="mileage"
        options={{
          href: null,
          headerLeft: () => (
            <HeaderWithBack title="Mileage Tracker" onPress={() => router.back()} />
          ),
        }}
      />
      <Tabs.Screen
        name="store-locator"
        options={{
          href: null,
          headerLeft: () => (
            <HeaderWithBack title="Store Locator" onPress={() => router.back()} />
          ),
        }}
      />
      <Tabs.Screen
        name="parking"
        options={{
          href: null,
          headerLeft: () => (
            <HeaderWithBack title="Parking Reminder" onPress={() => router.back()} />
          ),
        }}
      />
      <Tabs.Screen
        name="referrals"
        options={{
          href: null,
          headerLeft: () => (
            <HeaderWithBack title="Refer a Friend" onPress={() => router.back()} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          headerLeft: () => (
            <HeaderWithBack title="Support Chat" onPress={() => router.back()} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          href: null,
          headerLeft: () => (
            <HeaderWithBack title="Help & Support" onPress={() => router.back()} />
          ),
        }}
      />
      <Tabs.Screen
        name="service-schedule"
        options={{
          href: null,
          headerLeft: () => (
            <HeaderWithBack title="Service Schedule" onPress={() => router.back()} />
          ),
        }}
      />
      <Tabs.Screen
        name="book-appointment/index"
        options={{
          href: null,
          headerLeft: () => (
            <HeaderWithBack title="Book Appointment" onPress={() => router.back()} />
          ),
        }}
      />
    </Tabs>
  );
};

export default AuthenticatedLayout;
