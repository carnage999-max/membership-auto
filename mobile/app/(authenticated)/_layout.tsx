import { Tabs } from 'expo-router';
import { Car, Home, Calendar, Tag, User } from 'lucide-react-native';
import { Platform } from 'react-native';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Only for authenticated users
const AuthenticatedLayout = () => {
  // Setup push notifications
  usePushNotifications();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#cba86e',
        tabBarInactiveTintColor: '#707070',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2a2a2a',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
          headerTitle: 'My Vehicles',
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
          headerTitle: 'Appointments',
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Offers',
          tabBarIcon: ({ color, size }) => <Tag color={color} size={size} />,
          headerTitle: 'Special Offers',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          headerTitle: 'My Account',
        }}
      />

      {/* Hide additional screens from tab bar */}
      <Tabs.Screen
        name="mileage"
        options={{
          href: null,
          headerTitle: 'Mileage Tracker',
        }}
      />
      <Tabs.Screen
        name="store-locator"
        options={{
          href: null,
          headerTitle: 'Store Locator',
        }}
      />
      <Tabs.Screen
        name="parking"
        options={{
          href: null,
          headerTitle: 'Parking Reminder',
        }}
      />
      <Tabs.Screen
        name="referrals"
        options={{
          href: null,
          headerTitle: 'Refer a Friend',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          headerTitle: 'Support Chat',
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          href: null,
          headerTitle: 'Help & Support',
        }}
      />
      <Tabs.Screen
        name="service-schedule"
        options={{
          href: null,
          headerTitle: 'Service Schedule',
        }}
      />
      <Tabs.Screen
        name="book-appointment"
        options={{
          href: null,
          headerTitle: 'Book Appointment',
        }}
      />
    </Tabs>
  );
};

export default AuthenticatedLayout;
